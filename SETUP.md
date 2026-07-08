# SPM Sprinter — Complete Setup Guide

Deploy a **free, serverless study deck delivery system** using GitHub Pages (frontend) + Google Apps Script (backend). No hosting costs, no coding required after setup.

**Timeline:** 30–45 minutes on first setup  
**Cost:** $0 (GitHub + Google = free)

---

## 📋 What You'll Build

```
Your Frontend (GitHub Pages)
         ↓ (JSONP API call)
Google Apps Script (Backend)
         ↓
Google Sheets (Order Database) + Google Drive (PDF Storage) + Gmail
```

**Flow:** Customer enters Order ID → backend verifies → checks release delay → sends PDF via Gmail → marks order "sent"

---

## Step 1 — Prepare Study Decks in Google Drive

1. Go to [drive.google.com](https://drive.google.com)
2. Create a folder, e.g. **"SPM Sprinter Decks"**
3. Upload your study deck PDFs (keep each < 24 MB — Gmail limit)
4. For each PDF:
   - Right-click → **Share**
   - Set "General access" to **"Anyone with the link"** (Viewer)
   - Right-click → **Share** → **Copy link**
   - Extract the **File ID** from the URL:
     ```
     https://drive.google.com/file/d/[FILE_ID]/view?usp=sharing
                                      ^^^^^^^^
     ```
   - Save these File IDs — you'll paste them into the Sheet

**Example File ID:** `1AbCdEfGhIjKlMnOpQrStUvWxYz1A2B3C`

---

## Step 2 — Create the Orders Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → **New blank sheet**
2. Name it **"SPM Sprinter Orders"**
3. Rename the first tab (bottom) to exactly **"Orders"**
4. In **Row 1**, add these headers (exact spelling, any order):

   | Order ID | Deck Name | Drive File IDs | Status | Purchase Time | Delivered Email | Delivered At |
   |----------|-----------|----------------|--------|---------------|-----------------|--------------|

   **Column meanings:**
   - **Order ID** — Shopee order number (e.g. `260529N1Q25U6C`)
   - **Deck Name** — Your label (e.g. `Add Maths + Physics`), optional
   - **Drive File IDs** — File ID(s) from Step 1. For bundles, separate with commas
   - **Status** — Leave blank or `ready` to allow claiming. Type `cancelled` to block. Script writes `sent` automatically
   - **Purchase Time** — Optional. If set, buyer must wait `RELEASE_DELAY_MIN` minutes before claiming (fraud prevention)
   - **Delivered Email** — Auto-filled by script
   - **Delivered At** — Auto-filled by script

5. Add test rows:

   | Order ID | Deck Name | Drive File IDs | Status | Purchase Time | Delivered Email | Delivered At |
   |----------|-----------|----------------|--------|---------------|-----------------|--------------|
   | TEST123  | Sample Deck | *paste your File ID* | | | | |

---

## Step 3 — Deploy Google Apps Script Backend

1. In your **Google Sheet**, click **Extensions ▸ Apps Script**
2. Delete any starter code
3. Paste the entire contents of **`Code.gs`** from this repo
4. **Optional:** Adjust the CONFIG block:
   ```javascript
   RELEASE_DELAY_MIN: 30,  // minutes (0 = instant)
   EMAIL_SUBJECT: '...',   // customize email subject
   EMAIL_BODY: '...',      // customize email HTML
   ```
5. Click **💾 Save**
6. Click **Deploy ▸ New deployment**
7. Click the gear ⚙️ → select **Web app**
8. Set:
   - **Description:** SPM Sprinter
   - **Execute as:** **Me** (your Google account)
   - **Who has access:** **Anyone**
9. Click **Deploy**
10. Authorize the app (approve Gmail + Sheets + Drive permissions)
11. **Copy the Web app URL** (ends in `/exec`):
    ```
    https://script.google.com/macros/s/AKfycbw.../exec
    ```

**Important:** After any future `Code.gs` edits, go **Deploy ▸ Manage deployments ▸ edit ▸ Version: New version**

---

## Step 4 — Configure Your Frontend

1. Open **`index.html`** in a text editor
2. Find this line (around line 138):
   ```html
   const SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. Replace with your Web app URL from Step 3:
   ```html
   const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw.../exec";
   ```
4. Update your Shopee store link (if different):
   ```html
   const SHOP_URL = "https://shopee.com.my/your-username";
   ```
5. Save the file

---

## Step 5 — Add Your Logo

1. Save your SPM Sprinter logo as **`logo.png`** in the same folder as `index.html`
2. The site will automatically use it; if missing, it displays "SPM Sprinter" text instead

---

## Step 6 — Push to GitHub & Enable GitHub Pages

1. If you haven't already, create a free account at [github.com](https://github.com)
2. Create a **new repository**:
   - Name: `spmsprinter` (or your preference)
   - **Public**
   - Click **Create repository**
3. Upload files to GitHub:
   - Click **Add file ▸ Upload files**
   - Drag & drop: `index.html`, `styles.css`, `script.js`, `faq.html`, `contact.html`, `logo.png`
   - Commit
4. Enable GitHub Pages:
   - Go to repo **Settings ▸ Pages**
   - **Source:** Deploy from a branch
   - **Branch:** `main` (or `master`)
   - **Folder:** `/ (root)`
   - Save
5. Wait 1–2 minutes. Your site is live at:
   ```
   https://YOUR_USERNAME.github.io/spmsprinter/
   ```

---

## Step 7 — Test the Full Flow

1. Open your GitHub Pages URL
2. Enter `TEST123` → should verify → ask for email → send sample deck
3. Check your inbox (and spam folder)
4. Check your Google Sheet:
   - **Status** should now be `sent`
   - **Delivered Email** should be filled
   - **Delivered At** should have a timestamp
5. Try entering `TEST123` again → should say **"Already Delivered"**
6. Try a random Order ID → should say **"Not Found"**
7. Change a row's **Status** to `cancelled` and test → should say **"Order Cancelled"**

**If all pass:** Delete the test row, and you're live! 🚀

---

## Daily Operations

Once live, here's your routine:

1. Customer orders on Shopee → copy their **Order ID**
2. Add a row to your Google Sheet:
   - **Order ID** (required)
   - **Deck Name** (optional label)
   - **Drive File IDs** (required; paste from Step 1)
   - **Purchase Time** (optional; if set, 30-min hold)
   - Leave other columns blank
3. Customer self-serves via your page — done!

**Bulk add:** Export your Shopee orders as CSV and paste them into the sheet for high volume.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Something Went Wrong" on every order** | Check that `SCRIPT_URL` in `index.html` is correct. Redeploy a **New version** of the Apps Script if you edited `Code.gs`. |
| **Email never arrives** | Check spam. Confirm Drive file is shared "Anyone with link". Verify File ID is in the sheet (not the whole URL). |
| **"file_too_large"** | PDF is over ~24 MB. Compress it, or host it elsewhere and email a download link instead of attaching. |
| **Order shows "not found" but it's in the sheet** | Order ID must match exactly (spaces/case are trimmed, but typos aren't). Copy/paste from Shopee directly. |
| **Gmail sending limit reached** | Consumer Gmail allows ~100/day; Workspace allows ~1,500/day. For high volume, switch to Workspace. |

---

## Security Notes

- **Order IDs are semi-secret.** Don't post raw Order IDs online — only share your GitHub Pages link with customers
- **Each Order ID delivers once.** The "sent" flag prevents duplicate claims and resends
- **Drive files are "anyone with link."** Don't share raw Drive links publicly; only the File IDs live in your private sheet

---

## Customization

### Change Release Delay
Edit `Code.gs` in Apps Script:
```javascript
RELEASE_DELAY_MIN: 0,  // instant claiming (no hold)
RELEASE_DELAY_MIN: 60, // 1 hour hold
```
Then deploy a **New version**.

### Customize Email
Edit `Code.gs` — the `EMAIL_SUBJECT` and `EMAIL_BODY` fields. HTML is allowed.

### Customize Landing Page
Edit `index.html`, `styles.css`, `script.js`. All changes live on next `git push`.

### Add More Pages
Create new `.html` files and link them from `index.html`. Use the same `styles.css` for consistency.

---

## Need Help?

- **Setup issues?** Double-check the File IDs and Sheet headers
- **Google Apps Script errors?** Open the Apps Script editor → **Executions** tab to see detailed logs
- **GitHub Pages not updating?** Clear your browser cache (Ctrl+Shift+R)
- **Still stuck?** Each file has detailed comments; read the code — it's straightforward

---

## What's Next?

- ✅ Live custom landing page
- ✅ Automated email delivery
- ✅ Zero server costs
- 🎓 Scale to thousands of students
- 📊 Track all orders in one sheet

**You're all set to sprint towards straight A's!** 🏆
