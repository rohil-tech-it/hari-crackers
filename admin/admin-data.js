/* ==========================================================================
   HARI CRACKERS — admin/admin-data.js
   Firestore helpers for the admin panel: orders + shop settings.
   Falls back to small demo datasets when Firebase isn't configured yet,
   so the admin UI is still browsable before you finish setup.
   ========================================================================== */

import { db, SHOP, FIREBASE_ENABLED } from "../firebase-init.js";
import {
  collection, getDocs, doc, setDoc, updateDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ---------------------------------------------------------------------- */
/* Orders                                                                   */
/* ---------------------------------------------------------------------- */
const DEMO_ORDERS = [
  { id: "HC00000001", orderNo: "HC00000001", name: "Priya S.", phone: "9876500001", total: 845, status: "pending",
    items: [{ name: "Electric Sparklers 7\"", qty: 3, price: 60 }, { name: "Apple Flower Pot", qty: 5, price: 30 }],
    source: "website", createdAt: new Date(Date.now() - 3600e3).toISOString(), type: "pickup" },
  { id: "HC00000002", orderNo: "HC00000002", name: "Karthik R.", phone: "9876500002", total: 1799, status: "completed",
    items: [{ name: "Deluxe Celebration Combo", qty: 1, price: 1799 }],
    source: "website-pdf", createdAt: new Date(Date.now() - 86400e3).toISOString(), type: "delivery" },
  { id: "SHOP00000003", orderNo: "SHOP00000003", name: "Walk-in Customer", phone: "-", total: 320, status: "completed",
    items: [{ name: "Ground Chakkar Mini", qty: 4, price: 40 }, { name: "Kids Snake Tablets", qty: 4, price: 25 }],
    source: "shop-counter", createdAt: new Date(Date.now() - 7200e3).toISOString() },
];

export async function getOrders() {
  if (FIREBASE_ENABLED && db) {
    try {
      const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn("Firestore orders fetch failed:", err);
      return [];
    }
  }
  return DEMO_ORDERS;
}

export async function updateOrderStatus(orderId, status) {
  if (!FIREBASE_ENABLED || !db) throw new Error("Firebase is not configured yet.");
  await updateDoc(doc(db, "orders", orderId), { status });
}

export async function saveShopOrder(order) {
  if (!FIREBASE_ENABLED || !db) return; // silently skip in demo mode
  try {
    await setDoc(doc(collection(db, "orders"), order.orderNo), order);
  } catch (err) {
    console.warn("Could not save shop order:", err);
  }
}

/* ---------------------------------------------------------------------- */
/* Shop settings                                                            */
/* ---------------------------------------------------------------------- */
export async function getSettings() {
  if (FIREBASE_ENABLED && db) {
    try {
      const snap = await getDocs(collection(db, "settings"));
      const shopDoc = snap.docs.find(d => d.id === "shop");
      if (shopDoc) return { ...SHOP, ...shopDoc.data() };
    } catch (err) {
      console.warn("Firestore settings fetch failed:", err);
    }
  }
  return SHOP;
}

export async function saveSettings(settings) {
  if (!FIREBASE_ENABLED || !db) throw new Error("Firebase is not configured yet — settings can't be saved live in demo mode.");
  await setDoc(doc(db, "settings", "shop"), settings);
}
