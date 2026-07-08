/**
 * ════════════════════════════════════════════════════════════════════
 *  SPM SPRINTER — Ebook / Study Deck Delivery Backend
 *  Google Apps Script. Reads orders from a Google Sheet,
 *  verifies each Shopee Order ID, and emails the study deck from Drive.
 *
 *  SETUP:
 *   1. Create Google Sheet with "Orders" tab (see CONFIG below)
 *   2. Extensions ▸ Apps Script ▸ paste this code
 *   3. Fill in CONFIG block below
 *   4. Deploy ▸ New deployment ▸ Web app ▸ Execute as: Me,
 *      Who has access: Anyone. Copy the /exec URL.
 * ════════════════════════════════════════════════════════════════════
 */

// ══════════════════════════════ CONFIG ══════════════════════════════
var CONFIG = {
  SHEET_TAB:        'Orders',
  SHOP_NAME:        'SPM Sprinter',
  SENDER_NAME:      'SPM Sprinter',
  // Minutes to wait after Purchase Time before claiming (anti-refund-fraud).
  // Set to 0 for instant claiming. Ignored if Purchase Time is blank.
  RELEASE_DELAY_MIN: 30,
  // Email subject + body (HTML allowed)
  EMAIL_SUBJECT: 'Your SPM Sprinter Study Deck is here! 🏆',
  EMAIL_BODY:
    '<div style="font-family: Arial, sans-serif; font-size: 15px; color: #14224a; line-height: 1.8; background: #f9f7f4; padding: 32px 20px; border-radius: 12px;">' +
    '<div style="max-width: 600px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">' +
    '<h2 style="color: #f0b90b; font-size: 24px; margin-bottom: 16px;">🎉 Welcome to SPM Sprinter!</h2>' +
    '<p style="margin-bottom: 16px;">Thank you for your purchase! Your premium SPM study deck is attached below.</p>' +
    '<div style="background: #f0b90b; color: #14224a; padding: 16px; border-radius: 8px; margin: 24px 0; font-weight: 600; text-align: center;">' +
    'Your Study Deck is Ready to Download' +
    '</div>' +
    '<p style="margin-bottom: 16px;"><strong>Next Steps:</strong></p>' +
    '<ul style="margin-bottom: 24px;">' +
    '<li>📥 Download the PDF from this email</li>' +
    '<li>💾 Save it to your device or cloud storage (Google Drive, Dropbox, etc.)</li>' +
    '<li>📚 Start studying and sprint towards those straight A\'s!</li>' +
    '</ul>' +
    '<p style="margin-bottom: 8px; color: #666;"><strong>Tips:</strong></p>' +
    '<ul style="color: #666; font-size: 13px;">' +
    '<li>Can\'t find the email? Check your <strong>spam/junk folder</strong></li>' +
    '<li>Share feedback? We\'d love a <strong>5-star rating on Shopee</strong> ⭐</li>' +
    '</ul>' +
    '<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">' +
    '<p style="color: #999; font-size: 12px; text-align: center;">Questions? Contact us via Shopee chat.<br>—The SPM Sprinter Team</p>' +
    '</div>' +
    '</div>',
};
// ════════════════════════════════════════════════════════════════════

/**
 * Required Sheet Tab: "Orders"
 * Row 1 = Headers (exact text, any order):
 *   Order ID | Deck Name | Drive File IDs | Status | Purchase Time | Delivered Email | Delivered At
 */

function doGet(e) {
  var out;
  try {
    out = handle(e.parameter || {});
  } catch (err) {
    out = { error: 'server_error', detail: String(err) };
  }
  var callback = (e.parameter && e.parameter.callback) || '';
  var json = JSON.stringify(out);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function handle(p) {
  var orderId = (p.orderId || '').toString().trim().toUpperCase();
  var email   = (p.email || '').toString().trim();
  var checkOnly = (p.checkOnly || '').toString() === 'true';

  if (!orderId) return { error: 'not_found' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(CONFIG.SHEET_TAB);
  if (!sh) return { error: 'server_error', detail: 'Sheet tab "' + CONFIG.SHEET_TAB + '" not found' };

  var data = sh.getDataRange().getValues();
  var head = data[0].map(function (h) { return h.toString().trim().toLowerCase(); });

  var col = {
    id:       idx(head, 'order id'),
    deck:     idx(head, 'deck name'),
    files:    idx(head, 'drive file ids'),
    status:   idx(head, 'status'),
    ptime:    idx(head, 'purchase time'),
    demail:   idx(head, 'delivered email'),
    dat:      idx(head, 'delivered at'),
  };

  if (col.id < 0 || col.files < 0 || col.status < 0) {
    return { error: 'server_error', detail: 'Missing required columns: Order ID, Drive File IDs, Status' };
  }

  // Find the order row
  var rowNum = -1, row = null;
  for (var i = 1; i < data.length; i++) {
    if (data[i][col.id].toString().trim().toUpperCase() === orderId) {
      rowNum = i + 1;
      row = data[i];
      break;
    }
  }
  if (rowNum < 0) return { error: 'not_found' };

  var status = (row[col.status] || '').toString().trim().toLowerCase();
  var alreadySent = status === 'sent' || (col.dat >= 0 && row[col.dat]);

  if (status === 'cancelled') return { error: 'cancelled' };
  if (alreadySent) return { error: 'already_sent' };

  // Parse file IDs
  var fileIds = (row[col.files] || '').toString().split(',')
    .map(function (s) { return s.trim(); })
    .filter(String);
  var bookCount = fileIds.length || 1;

  // Release-delay countdown (only if Purchase Time set)
  if (CONFIG.RELEASE_DELAY_MIN > 0 && col.ptime >= 0 && row[col.ptime]) {
    var pt = new Date(row[col.ptime]);
    if (!isNaN(pt.getTime())) {
      var readyAt = pt.getTime() + CONFIG.RELEASE_DELAY_MIN * 60 * 1000;
      var now = Date.now();
      if (now < readyAt) {
        return {
          error: 'not_ready',
          secondsLeft: Math.ceil((readyAt - now) / 1000),
          readyAt: readyAt,
          bookCount: bookCount,
        };
      }
    }
  }

  // Just checking status → return ready
  if (checkOnly) return { error: 'ready', bookCount: bookCount };

  // ── Actually deliver ──
  if (!email) return { error: 'send_failed' };
  if (fileIds.length === 0) return { error: 'book_not_found' };

  var attachments = [];
  for (var k = 0; k < fileIds.length; k++) {
    try {
      var fileBlob = DriveApp.getFileById(fileIds[k]).getBlob();
      attachments.push(fileBlob);
    } catch (err) {
      return { error: 'book_not_found', detail: 'File ID not found or not shared: ' + fileIds[k] };
    }
  }

  // Guard against Gmail's ~25 MB attachment limit
  var totalBytes = 0;
  for (var b = 0; b < attachments.length; b++) {
    totalBytes += attachments[b].getBytes().length;
  }
  if (totalBytes > 24 * 1024 * 1024) {
    return { error: 'file_too_large', detail: 'Total attachments exceed 24 MB limit' };
  }

  try {
    MailApp.sendEmail({
      to: email,
      subject: CONFIG.EMAIL_SUBJECT,
      htmlBody: CONFIG.EMAIL_BODY,
      attachments: attachments,
      name: CONFIG.SENDER_NAME,
    });
  } catch (err) {
    return { error: 'send_failed', detail: String(err) };
  }

  // Mark as sent
  sh.getRange(rowNum, col.status + 1).setValue('sent');
  if (col.demail >= 0) sh.getRange(rowNum, col.demail + 1).setValue(email);
  if (col.dat >= 0) sh.getRange(rowNum, col.dat + 1).setValue(new Date());

  return { success: true };
}

function idx(head, name) {
  return head.indexOf(name.toLowerCase());
}
