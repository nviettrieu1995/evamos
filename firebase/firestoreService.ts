// firebase/firestoreService.ts

// FIREBASE CORE
import { db } from "./firebaseConfig";
import {
  collection, addDoc, getDocs, query, where,
  Timestamp, deleteDoc, doc, updateDoc
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

// --------- AGENTS (ví dụ sau này) ----------
// export async function saveAgent(...) { ... }
