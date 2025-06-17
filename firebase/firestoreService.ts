// firebase/firestoreService.ts

// FIREBASE CORE
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

// --------- PLANS -----------
export async function savePlan(userId: string, plan: { title: string; content: string }) {
  return await addDoc(collection(db, "plans"), {
    ...plan,
    userId,
    createdAt: Timestamp.now(),
  });
}

export async function getUserPlans(userId: string) {
  const q = query(collection(db, "plans"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deletePlan(planId: string) {
  return await deleteDoc(doc(db, "plans", planId));
}

export async function updatePlan(planId: string, updates: { title?: string; content?: string }) {
  const planRef = doc(db, "plans", planId);
  await updateDoc(planRef, { ...updates, updatedAt: Timestamp.now() });
}

export async function filterPlansByMonth(userId: string, month: number, year: number) {
  const start = Timestamp.fromDate(new Date(year, month - 1, 1));
  const end = Timestamp.fromDate(new Date(year, month, 1));
  const q = query(
    collection(db, "plans"),
    where("userId", "==", userId),
    where("createdAt", ">=", start),
    where("createdAt", "<", end),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getStats(userId: string) {
  const totalQuery = query(collection(db, "plans"), where("userId", "==", userId));
  const totalSnap = await getDocs(totalQuery);
  const now = new Date();
  const start = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const end = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() + 1, 1));
  const monthQuery = query(
    collection(db, "plans"),
    where("userId", "==", userId),
    where("createdAt", ">=", start),
    where("createdAt", "<", end),
  );
  const monthSnap = await getDocs(monthQuery);
  return { totalPlans: totalSnap.size, plansThisMonth: monthSnap.size };
}

export async function submitFeedback(userId: string, message: string, email?: string) {
  return await addDoc(collection(db, "feedback"), {
    userId,
    message,
    email: email || null,
    createdAt: Timestamp.now(),
  });
}

export async function sendContactEmail(name: string, email: string, message: string) {
  const payload = {
    service_id: "YOUR_SERVICE_ID",
    template_id: "YOUR_TEMPLATE_ID",
    user_id: "YOUR_PUBLIC_KEY",
    template_params: { name, email, message },
  };
  return await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// --------- AGENTS (ví dụ sau này) ----------
// export async function saveAgent(...) { ... }
