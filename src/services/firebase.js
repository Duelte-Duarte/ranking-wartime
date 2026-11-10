
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBjYc1BfO7RFkVLSNgDwuru3Ac71QYd0l8",
  authDomain: "ranking-wartime.firebaseapp.com",
  projectId: "ranking-wartime",
  storageBucket: "ranking-wartime.firebasestorage.app",
  messagingSenderId: "650732983418",
  appId: "1:650732983418:web:4fe02c88af2084f536d7c3",
  measurementId: "G-QXBZ0D47YZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
