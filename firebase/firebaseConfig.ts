// firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyAY2GYRTMkMY-R_IpOmQldGqKkY1P57_ds",
  authDomain: "evamos-xuongmay.firebaseapp.com",
  projectId: "evamos-xuongmay",
  storageBucket: "evamos-xuongmay.firebasestorage.app",
  messagingSenderId: "429726245786",
  appId: "1:429726245786:web:83da27725fafda12129023",
  measurementId: "G-92TRNQBCRP"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
