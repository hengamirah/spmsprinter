/* ══════════════════════════════════════════════════════════════
   SPM SPRINTER — Frontend Application Logic
   ═════════════════════════════════════════════════════════════ */

// ──────────────────── CONFIGURATION ──────────────────────
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyNx5cS45rD2vmw_4WZGbbY8sxlIJS5DcUvDhus1GBzV7j0Usew8JIjnOON1qFw3bbdDQ/exec";
const SHOP_URL   = "https://shopee.com.my/spmsprinter";

// ──────────────────── STATE ──────────────────────
let ORDER_ID = '';
let EMAIL = '';
let cdTimer = null;
let cbCounter = 0;

// ──────────────────── ERROR DEFINITIONS ──────────────────────
const ERRORS = {
  not_found: {
    type: 'fail',
    icon: '❌',
    title: 'Order ID Not Found',
    message: `We couldn't find this Order ID. Please double-check your Shopee order and try again.<br><br>Still having issues? <a href="${SHOP_URL}" target="_blank" class="lz-alert a">Contact us via Shopee chat</a> and we'll help right away.`
  },
  already_sent: {
    type: 'warning',
    icon: '📬',
    title: 'Already Delivered',
    message: `This order has already been sent! Check your inbox and spam folder carefully.<br><br>Still can't find it? <a href="${SHOP_URL}" target="_blank">Let us know via Shopee chat</a> and we'll resend it.`
  },
  cancelled: {
    type: 'fail',
    icon: '🚫',
    title: 'Order Cancelled',
    message: `This order has been cancelled and cannot be claimed.<br><br>If you think this is a mistake, <a href="${SHOP_URL}" target="_blank">contact us via Shopee chat</a>.`
  },
  book_not_found: {
    type: 'fail',
    icon: '⚠️',
    title: 'Processing Error',
    message: `There was an issue processing your order. <a href="${SHOP_URL}" target="_blank">Please contact us via Shopee chat</a> with your Order ID.`
  },
  file_too_large: {
    type: 'fail',
    icon: '⚠️',
    title: 'Processing Error',
    message: `There was an issue processing your order. <a href="${SHOP_URL}" target="_blank">Please contact us via Shopee chat</a> with your Order ID.`
  },
  send_failed: {
    type: 'fail',
    icon: '⚠️',
    title: 'Sending Error',
    message: `There was an issue sending your deck. <a href="${SHOP_URL}" target="_blank">Please contact us via Shopee chat</a> for assistance.`
  },
  server_error: {
    type: 'fail',
    icon: '⚠️',
    title: 'Server Error',
    message: `An unexpected error occurred. <a href="${SHOP_URL}" target="_blank">Please contact us via Shopee chat</a> with your Order ID.`
  },
  _timeout: {
    type: 'fail',
    icon: '⏱️',
    title: 'Request Timed Out',
    message: `The request took too long. Please check your internet connection and try again.`
  },
  _default: {
    type: 'fail',
    icon: '⚠️',
    title: 'Something Went Wrong',
    message: `An unexpected error occurred. <a href="${SHOP_URL}" target="_blank">Please contact us via Shopee chat</a>.`
  }
};

// ──────────────────── DOM & RENDERING ──────────────────────
function render(html) {
  if (cdTimer) {
    clearInterval(cdTimer);
    cdTimer = null;
  }
  const app = document.getElementById('app');
  app.innerHTML = html;
  app.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function validEmail(e) {
  const parts = e.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.') && parts[0].length > 0;
}

// ──────────────────── API COMMUNICATION ──────────────────────
function api(params, done) {
  const name = '__lz' + (++cbCounter) + '_' + Date.now();
  const qs = Object.entries(params)
    .map(([k, v]) => k + '=' + encodeURIComponent(v))
    .join('&');
  const sid = 'lzs_' + cbCounter;

  const tid = setTimeout(() => {
    delete window[name];
    const s = document.getElementById(sid);
    if (s) s.remove();
    done(null);
  }, 30000);

  window[name] = r => {
    clearTimeout(tid);
    delete window[name];
    const s = document.getElementById(sid);
    if (s) s.remove();
    done(r);
  };

  const sc = document.createElement('script');
  sc.id = sid;
  sc.src = SCRIPT_URL + '?' + qs + '&callback=' + name;
  sc.onerror = () => {
    clearTimeout(tid);
    delete window[name];
    done(null);
  };
  document.body.appendChild(sc);
}

// ──────────────────── UI HELPERS ──────────────────────
function backBtn() {
  return `<button class="lz-btn-ghost" onclick="stepOrderId()">
    ← Have another order? Start over
  </button>`;
}

function showAlert(errorKey) {
  const err = ERRORS[errorKey] || ERRORS._default;
  return `
    <div class="lz-alert ${err.type}">
      <span class="lz-alert-icon">${err.icon}</span>
      <span class="lz-alert-title">${err.title}</span>
      ${err.message}
    </div>
  `;
}

// ──────────────────── STEP 1: ORDER ID ──────────────────────
function stepOrderId(errorKey) {
  render(`
    ${errorKey ? showAlert(errorKey) : ''}
    <div class="field">
      <label class="lz-label">Shopee Order ID</label>
      <input
        class="lz-input"
        id="oid"
        placeholder="e.g. 260529N1Q25U6C"
        autocomplete="off"
        maxlength="20"
      />
      <div class="lz-err-msg" id="oidErr">Please enter your Order ID</div>
      <p class="lz-hint">Find your Order ID in your Shopee purchase history or confirmation email.</p>
    </div>
    <button class="lz-btn" onclick="submitOrderId()">Check My Order</button>
  `);

  const inp = document.getElementById('oid');
  if (inp) {
    inp.focus();
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitOrderId();
    });
    inp.addEventListener('input', () => {
      inp.classList.remove('err');
      document.getElementById('oidErr').classList.remove('show');
    });
  }
}

function submitOrderId() {
  const v = (document.getElementById('oid').value || '').trim().toUpperCase();
  if (!v) {
    document.getElementById('oid').classList.add('err');
    document.getElementById('oidErr').classList.add('show');
    return;
  }
  ORDER_ID = v;

  render(`
    <div class="lz-loading">
      <div class="lz-spinner"></div>
      <div class="lz-loading-title">Checking your order...</div>
      <div class="lz-loading-sub">We're verifying your order details with our database.<br>This usually takes just a moment.</div>
    </div>
  `);

  api({ orderId: ORDER_ID, checkOnly: 'true' }, r => {
    if (!r) {
      stepOrderId('_timeout');
      return;
    }
    if (r.error === 'not_ready') {
      stepCountdown(r.secondsLeft, r.bookCount, r.readyAt);
    } else if (r.error === 'ready') {
      stepEmail();
    } else if (r.error === 'cancelled') {
      stepCancelled();
    } else if (r.error === 'already_sent') {
      stepAlreadySent();
    } else if (r.error === 'not_found') {
      stepNotFound();
    } else {
      stepOrderId(r.error || '_default');
    }
  });
}

// ──────────────────── STEP 2A: COUNTDOWN ──────────────────────
function stepCountdown(secsLeft, bookCount, readyAtMs) {
  const readyAt = new Date(readyAtMs);
  const readyAtStr = readyAt.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  render(`
    <div class="lz-alert waiting">
      <span class="lz-alert-icon">⏳</span>
      <span class="lz-alert-title">Almost Ready!</span>
      We're verifying your order of <strong>${bookCount} deck(s)</strong> to ensure you receive everything correctly.
      <br><br>
      <strong>Please check back at ${readyAtStr}</strong> to claim your deck.
      <div class="lz-countdown" id="cdTimer">--:--</div>
      <div class="lz-countdown-sub">Your order will be ready to download at ${readyAtStr}</div>
    </div>
    ${backBtn()}
  `);

  function tick() {
    const diff = Math.max(0, Math.ceil((readyAt - Date.now()) / 1000));
    const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
    const seconds = String(diff % 60).padStart(2, '0');
    const el = document.getElementById('cdTimer');
    if (el) el.textContent = minutes + ':' + seconds;
    if (diff <= 0) {
      clearInterval(cdTimer);
      cdTimer = null;
      stepEmail();
    }
  }

  tick();
  cdTimer = setInterval(tick, 1000);
}

// ──────────────────── STEP 2B: STATUS PAGES ──────────────────────
function stepNotFound() {
  render(`
    ${showAlert('not_found')}
    ${backBtn()}
  `);
}

function stepAlreadySent() {
  render(`
    ${showAlert('already_sent')}
    ${backBtn()}
  `);
}

function stepCancelled() {
  render(`
    ${showAlert('cancelled')}
    ${backBtn()}
  `);
}

// ──────────────────── STEP 3: EMAIL ENTRY ──────────────────────
function stepEmail() {
  render(`
    <div class="lz-alert success" style="margin-bottom: 24px;">
      <span class="lz-alert-icon">✅</span>
      <span class="lz-alert-title">Order Verified!</span>
      Your order has been verified and is ready for delivery. Please enter your email address below to receive your study deck.
    </div>
    <div class="field">
      <label class="lz-label">Your Email Address</label>
      <input
        class="lz-input"
        id="eml"
        type="email"
        placeholder="you@gmail.com"
        autocomplete="email"
      />
      <div class="lz-err-msg" id="emlErr">Please enter a valid email (e.g. you@gmail.com)</div>
      <p class="lz-hint">Your study deck will be sent to this email address.</p>
      <p class="lz-hint" style="color: var(--warning); margin-top: 8px;">
        ⚠️ <strong>Use a regular email</strong> (Gmail, Yahoo, Outlook, etc.) — <strong>not school/student email</strong>.
        School emails often block attachments.
      </p>
    </div>
    <button class="lz-btn" onclick="submitEmail()">Continue</button>
  `);

  const inp = document.getElementById('eml');
  if (inp) {
    inp.focus();
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitEmail();
    });
    inp.addEventListener('input', () => {
      inp.classList.remove('err');
      document.getElementById('emlErr').classList.remove('show');
    });
  }
}

function submitEmail() {
  const v = (document.getElementById('eml').value || '').trim();
  if (!v || !validEmail(v)) {
    document.getElementById('eml').classList.add('err');
    document.getElementById('emlErr').classList.add('show');
    return;
  }
  EMAIL = v;
  stepConfirm();
}

// ──────────────────── STEP 4: CONFIRMATION ──────────────────────
function stepConfirm() {
  render(`
    <div class="lz-confirm-box">
      <span class="lz-confirm-email">${EMAIL}</span>
      Please confirm this is the correct email. Your study deck will be sent to this address and
      <strong style="color: var(--error);">cannot be resent</strong> to a different email.
    </div>
    <button class="lz-btn" onclick="submitSend()">Yes, Send My Deck</button>
    <button class="lz-btn-ghost" onclick="stepEmail()">Edit Email</button>
  `);
}

// ──────────────────── STEP 5: SEND & COMPLETION ──────────────────────
function submitSend() {
  render(`
    <div class="lz-loading">
      <div class="lz-spinner"></div>
      <div class="lz-loading-title">Sending your deck...</div>
      <div class="lz-loading-sub">
        Please wait while we prepare and deliver your study deck to your email.<br>
        This usually takes less than a minute.
      </div>
    </div>
  `);

  api({ orderId: ORDER_ID, email: EMAIL }, r => {
    if (!r) {
      render(`
        ${showAlert('_timeout')}
        ${backBtn()}
      `);
      return;
    }

    if (r.success) {
      render(`
        <div class="lz-alert success">
          <span class="lz-alert-icon">🎉</span>
          <span class="lz-alert-title">Deck Sent Successfully!</span>
          Your study deck is on its way to <strong>${EMAIL}</strong>!<br><br>
          <strong>Check your inbox</strong> — it should arrive within a few minutes.<br>
          <em>Don't forget to check your spam or junk folder too!</em><br><br>
          Now sprint towards those straight A's! 🏆<br><br>
          <strong>⭐ Love your purchase?</strong> Take 5 seconds to leave us a
          <a href="${SHOP_URL}" target="_blank">5-star rating on Shopee</a> — it helps us reach more students!
        </div>
        <button class="lz-btn-ghost" onclick="stepOrderId()">Download Another Deck</button>
      `);
    } else if (r.error === 'cancelled') {
      stepCancelled();
    } else {
      const err = ERRORS[r.error] || ERRORS._default;
      render(`
        <div class="lz-alert ${err.type}">
          <span class="lz-alert-icon">${err.icon}</span>
          <span class="lz-alert-title">${err.title}</span>
          ${err.message}
        </div>
        ${backBtn()}
      `);
    }
  });
}

// ──────────────────── MODAL FUNCTIONS ──────────────────────
function showHowToUseModal() {
  document.getElementById('howToUseModal').style.display = 'block';
  document.getElementById('modalOverlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeHowToUseModal() {
  document.getElementById('howToUseModal').style.display = 'none';
  document.getElementById('modalOverlay').style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Close modal with Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeHowToUseModal();
});

// ──────────────────── INITIALIZATION ──────────────────────
function init() {
  // Validate SCRIPT_URL is configured
  if (SCRIPT_URL.includes('PASTE_YOUR')) {
    render(`
      <div class="lz-alert fail">
        <span class="lz-alert-icon">⚙️</span>
        <span class="lz-alert-title">Configuration Required</span>
        The backend is not configured yet. Please add your Google Apps Script URL to the index.html file.
        <br><br>
        See <a href="SETUP.md" target="_blank">SETUP.md</a> for instructions.
      </div>
    `);
    return;
  }
  stepOrderId();
}
