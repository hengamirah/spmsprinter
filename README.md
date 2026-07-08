# SPM Sprinter — Premium Study Deck Delivery

> **Sprint towards straight A's.** Deliver premium study materials to Shopee customers instantly with zero hosting costs.

![SPM Sprinter](logo.png)

---

## 🚀 What This Is

A **complete, serverless ebook delivery platform** built entirely on free services:

- **Frontend:** GitHub Pages (static hosting, $0)
- **Backend:** Google Apps Script (serverless API, $0)
- **Database:** Google Sheets (order tracking, $0)
- **Storage:** Google Drive (PDF hosting, $0)
- **Email:** Gmail (automated delivery, $0)

**Total cost:** $0  
**Setup time:** 30–45 minutes  
**Maintenance:** ~5 min/day

---

## 📊 How It Works

```
Customer on Shopee
       ↓
Buys study deck
       ↓
Receives Order ID
       ↓
Visits your GitHub Pages link
       ↓
Enters Order ID + email
       ↓
Google Apps Script backend:
  • Looks up order in Google Sheet
  • Checks release delay (if set)
  • Verifies hasn't already been sent
  • Emails PDF from Google Drive
  • Marks order as "sent"
       ↓
Customer gets email with PDF
       ↓
100% automated ✅
```

---

## 🎨 Features

✅ **Brand-ready landing page** — navy + gold premium design  
✅ **Responsive mobile UI** — smooth animations & micro-interactions  
✅ **Release delay system** — anti-fraud holds (e.g., 30-min after purchase)  
✅ **One-time delivery** — prevents duplicate claims  
✅ **Bulk order support** — send multiple decks in one email  
✅ **FAQ + Contact pages** — reduce support burden  
✅ **JSONP API** — works on GitHub Pages (no CORS issues)  
✅ **Email customization** — your branding in every email  

---

## 📁 Files

| File | Purpose |
|------|---------|
| `index.html` | Main landing page (claim your deck) |
| `faq.html` | Frequently asked questions |
| `contact.html` | Contact & support page |
| `styles.css` | All styling (dark theme, animations) |
| `script.js` | Frontend logic (form handling, API calls) |
| `Code.gs` | Google Apps Script backend (paste into Apps Script) |
| `SETUP.md` | Complete step-by-step setup guide |
| `README.md` | This file |

---

## 🏃 Quick Start

### For First-Time Setup (30–45 min)

Follow **[SETUP.md](SETUP.md)** step-by-step. It covers:

1. Uploading PDFs to Google Drive
2. Creating the Orders Google Sheet
3. Deploying the Google Apps Script backend
4. Configuring your frontend
5. Publishing to GitHub Pages
6. Testing end-to-end

### For Existing Installations

Just add order rows to your Google Sheet:

| Order ID | Deck Name | Drive File IDs | Status |
|----------|-----------|----------------|--------|
| 260529N1Q25U6C | Add Maths | *file_id_1* | |

Customers claim them automatically via your page.

---

## 🔧 Configuration

All configuration is in two places:

### 1. `index.html` (line ~138)
```html
const SCRIPT_URL = "YOUR_APPS_SCRIPT_URL_HERE";  // paste your /exec URL
const SHOP_URL   = "https://shopee.com.my/your-username";
```

### 2. `Code.gs` in Google Apps Script (lines 11–46)
```javascript
RELEASE_DELAY_MIN: 30,        // hold time after purchase
EMAIL_SUBJECT: '...',         // customize subject
EMAIL_BODY: '...',            // customize HTML email
```

That's it. No API keys, no secrets, no databases to manage.

---

## 📧 How Emails Work

1. Customer claims order → backend retrieves PDF from Google Drive
2. Checks file size (< 24 MB Gmail limit)
3. Sends via Gmail with your custom subject + HTML body
4. If file > 24 MB, error returned to customer
5. You can customize the email template in `Code.gs`

---

## 🛡️ Security

- **Order IDs are semi-secret** — Only share your GitHub Pages link, not raw Order IDs
- **One-time delivery** — Each Order ID sends only once (marked "sent" in sheet)
- **Release delay** — Optional hold period to prevent refund fraud
- **No credentials stored** — All auth is through Google OAuth (built-in)
- **Drive files are "anyone with link"** — Don't share raw Drive URLs; only File IDs in your private sheet

---

## 📱 Mobile-First Design

- Fully responsive (mobile, tablet, desktop)
- Dark theme with gold accents
- Smooth animations and transitions
- Touch-friendly buttons (min 44px height)
- Fast loading (no dependencies, pure HTML/CSS/JS)

---

## 🔄 Updates & Redeployment

### Frontend Changes
Edit `.html`, `.css`, or `.js` files → push to GitHub → live in <1 minute

### Backend Changes
Edit `Code.gs` in Apps Script → Deploy ▸ Manage deployments ▸ edit ▸ Version: New version → changes live immediately

---

## 🐛 Troubleshooting

**Email not arriving?**
- Check spam/junk folder
- Confirm Drive file is shared "Anyone with link"
- Avoid school/student emails (use Gmail, Yahoo, Outlook)

**Order ID not found?**
- Copy Order ID directly from Shopee (avoid typos)
- Check sheet for exact match (case/spaces are trimmed, but content must match)

**PDF too large?**
- Gmail attachment limit is ~24 MB
- Compress PDF or host elsewhere + email link instead

**Still stuck?**
- Check Apps Script editor → **Executions** tab for error logs
- Review [SETUP.md](SETUP.md) troubleshooting section

---

## 🌟 Use Cases

✓ **Study decks** (original design)  
✓ **Ebook bundles**  
✓ **Exam guides**  
✓ **Course materials**  
✓ **Digital downloads** in general  

Any use case where:
- Customer buys on Shopee
- Gets an order ID
- Needs instant digital delivery via email
- You want zero hosting costs

---

## 📈 Scaling

Works from 1 to thousands of orders:

- **1–50/day:** Works on free Google/GitHub tier
- **50–100/day:** Still free (Google Sheets scales, Gmail ~100/day limit)
- **100+/day:** Upgrade to Google Workspace (Gmail allows 1,500+/day)

---

## 🎓 Built for Educators

- Simple one-page setup for non-technical users
- No code changes needed after initial config
- Bulk import CSV orders from Shopee
- Track delivery in a single spreadsheet
- Zero operational overhead

---

## 💬 Questions?

Refer to:
- **Setup issues:** [SETUP.md](SETUP.md)
- **How it works:** This README
- **Support:** Contact via Shopee or email

---

## 📄 License

Free to use, modify, and redistribute. No license restrictions.

---

**Made with ❤️ for SPM students. Sprint towards straight A's! 🏆**
