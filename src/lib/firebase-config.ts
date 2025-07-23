
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Adjust authDomain for local development if not already set to a localhost variant
if (process.env.NODE_ENV === 'development' && firebaseConfig.authDomain && !firebaseConfig.authDomain.includes('localhost')) {
    const originalDomain = new URL(`https://${firebaseConfig.authDomain}`);
    firebaseConfig.authDomain = `localhost:${originalDomain.port || '9002'}`;
}


let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const firebaseApp = app;
export const allConfigured = Object.values(firebaseConfig).every(v => !!v);
