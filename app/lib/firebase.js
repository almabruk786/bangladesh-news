import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// getStorage বাদ দেওয়া হয়েছে কারণ আমরা Cloudinary ব্যবহার করছি

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Messaging (Client-side only)
import { getMessaging, getToken, isSupported } from "firebase/messaging";

export const messaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
    console.error("Firebase Messaging not supported in this browser.");
    throw new Error("Firebase Messaging is NOT supported in this browser (isSupported() returned false).");
  } catch (err) {
    console.error("Error initializing messaging:", err);
    throw err; // Re-throw to see on test page
  }
};

export const getFcmToken = async (vapidKey) => {
  try {
    const msg = await messaging();
    if (msg) {
      let registration;
      if ('serviceWorker' in navigator) {
        // Explicitly register the service worker to ensure it's found
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
      }

      const currentToken = await getToken(msg, {
        vapidKey,
        serviceWorkerRegistration: registration
      });
      return currentToken;
    }
    return null;
  } catch (err) {
    console.error('An error occurred while retrieving token.', err);
    // Specific error handling for "missing or insufficient permissions" vs "invalid-argument"
    if (err.code === 'messaging/invalid-argument') {
      console.error("VAPID Key seems invalid or mismatched with project.");
    }
    throw err; // Reveal error to caller
  }
};

