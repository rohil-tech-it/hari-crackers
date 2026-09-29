# 🎆 Hari Crackers — Full Website + Admin Panel

Idhu unga **Hari Crackers** shop ku HTML + CSS + JS + Firebase (modular v10 SDK) base ah build panna full project — Q Crackers structure follow panni. No build step, no npm — plain files, browser la nேrama run aagum.

---

## 📁 File Structure

```
hari-crackers/
├── index.html            → Home page
├── products.html         → Full shop / catalogue (category filter + search)
├── about.html
├── contact.html
├── faq.html
├── seed-products.html    → One-time setup tool: pushes sample products into Firestore
├── firebase-init.js      → Firebase config + SHOP details (EDIT THIS FIRST)
├── products-firebase.js  → Product data + Firestore CRUD helpers
├── cart.js               → Shared cart drawer, WhatsApp checkout, PDF bill
├── script.js             → Mobile nav, sparkle animation, footer year
├── style.css             → Orange + Purple theme (site + admin panel)
├── .htaccess              → Apache hardening (ignored on Firebase/Netlify hosting)
├── images/, assets/       → Put product photos / logo here
└── admin/
    ├── index.html         → Staff login (Firebase Auth)
    ├── dashboard.html     → Stats: orders, revenue, pending, low stock
    ├── orders.html        → Walk-in billing counter + online order management
    ├── products.html      → Add / edit / delete products (Firestore CRUD)
    ├── settings.html      → Edit shop name/phone/address/WhatsApp/GST/UPI
    ├── admin-data.js      → Shared Firestore helpers for orders + settings
    └── .htaccess
```

---

## 🚀 Quick start (before Firebase setup)

Even before touching Firebase, you can preview the whole site + admin panel using local sample data ("Demo Mode").

1. Because pages use ES module `<script type="module">`, opening `index.html` directly via `file://` **will not work** in most browsers (CORS blocks module imports from disk). Run a local server instead:
   - VS Code → install "Live Server" extension → right-click `index.html` → "Open with Live Server", **or**
   - Terminal: `python3 -m http.server 8000` → open `http://localhost:8000`
2. Browse the site — home, shop, about, contact, faq all work with the sample product list in `products-firebase.js`.
3. Open `admin/dashboard.html` — since Firebase isn't configured yet, it skips login and shows a **"Demo mode"** banner with sample orders/products so you can see how everything looks.

---

## 🔥 Firebase Setup (for real data + admin login)

### Step 1 — Create a Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → "Add project"
2. Name it (e.g. `hari-crackers`) → create

### Step 2 — Register a Web App
1. Project Overview → click the `</>` (web) icon → register app
2. Copy the `firebaseConfig` object Firebase shows you

### Step 3 — Paste config into firebase-init.js
Open `firebase-init.js` and replace the placeholder values:
```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```
Then change this line at the bottom of the config block:
```js
export const FIREBASE_ENABLED = true;   // was false
```
**This flag is important** — while it's `false`, every page uses local sample data only and admin pages skip login (demo mode). Set it to `true` only after you've pasted your real config, or pages will fail trying to reach a fake project.

### Step 4 — Enable Firestore
Build → Firestore Database → Create database → Start in test mode (switch to the production rules below before going live).

### Step 5 — Enable Authentication (for /admin login)
1. Build → Authentication → Sign-in method → enable **Email/Password**
2. Build → Authentication → Users → **Add user** → enter the email/password you'll use to log into `/admin`

### Step 6 — Seed your products
Open `seed-products.html` in the browser and click **"Seed Sample Products"** — this pushes the sample catalogue from `products-firebase.js` into your Firestore `products` collection in one click. After that, edit/add/delete products live from `admin/products.html` instead of touching code.

Once your real inventory is in Firestore, you can delete `seed-products.html` (or just stop linking to it).

---

## 🔒 Firestore Security Rules (set before going live)

Test mode allows public read/write for 30 days only. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;   // only logged-in admin can edit
    }
    match /orders/{orderId} {
      allow read: if request.auth != null;    // only admin can read the order list
      allow create: if true;                  // customers can place orders
      allow update: if request.auth != null;  // only admin can change status
      allow delete: if false;
    }
    match /settings/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

This means: anyone can browse products and place an order, but only someone logged into `/admin` (via Firebase Auth) can edit products, view the order list, or change order status.

---

## 💬 WhatsApp + shop details

Edit the `SHOP` object at the bottom of `firebase-init.js` (or `admin/settings.html` once Firestore is connected) to set:
- `name`, `tagline`, `address`
- `phone` — displayed on site
- `whatsapp` — country code + number, no `+` or spaces (e.g. `919876543210`)
- `gst`, `upiId` — optional, shown on PDF bill

---

## 🧾 Billing (online + walk-in)

- **Online orders**: customer adds items on `products.html`/`index.html`, opens the cart, fills name/phone/pickup-or-delivery, then clicks **WhatsApp** (sends a pre-filled order message to your number) or **Bill** (downloads a PDF).
- **Walk-in orders**: staff log into `admin/orders.html`, use the **"New Walk-in Bill"** panel to pick catalogue items or add custom/loose items, then **Print** or download as **PDF**. Every walk-in bill is also saved to the `orders` collection (source: `shop-counter`) once Firebase is connected.
- All orders — online and walk-in — show up together in the **Orders & Billing** admin page with status (pending/completed/cancelled).

---

## 🎨 Theme customization

All colors live as CSS variables at the top of `style.css`:
```css
--night:   #22093A   /* dark purple background */
--purple:  #7C2AA8   /* purple accent */
--orange:  #FF7A1A   /* orange accent */
--gold:    #FFC24B   /* gold sparkle */
--cream:   #FFF3E4   /* light background */
```
Change these and the whole site (customer + admin) re-themes.

---

## 🌐 Deploy

**Firebase Hosting** (recommended — same project as your data):
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # public directory: this folder, single-page app: No
firebase deploy
```

**Netlify / Vercel**: drag-and-drop the folder at [netlify.com/drop](https://app.netlify.com/drop) for an instant live URL.

> Note: `.htaccess` only works on Apache-based hosting — it's ignored (harmlessly) on Firebase Hosting, Netlify, and Vercel.

---

## ✅ Suggested next steps

- [ ] Paste your real Firebase config + set `FIREBASE_ENABLED = true`
- [ ] Create your admin login user in Firebase Authentication
- [ ] Run `seed-products.html` once, then manage products from `admin/products.html`
- [ ] Add real product photos to `images/` and update card markup to use `<img>`
- [ ] Apply the production Firestore security rules above before sharing the live link
- [ ] Update phone/WhatsApp/address across `firebase-init.js` (and each page's topbar/footer if you're not using Firestore settings yet)

Doubt irundhaal, indha comments ah follow panni build pannunga! 🎇
