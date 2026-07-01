import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "tu_api_key_aqui" &&
  firebaseConfig.apiKey.trim() !== ""
);

let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (e) {
    console.error("Error initializing Firebase:", e);
  }
}

export { db, storage, isFirebaseConfigured };
