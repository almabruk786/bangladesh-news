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
    return null;
  } catch (err) {
    return null;
  }
};

export const getFcmToken = async (vapidKey) => {
  try {
    const msg = await messaging();
    if (msg) {
      const currentToken = await getToken(msg, { vapidKey });
      return currentToken;
    }
    return null;
  } catch (err) {
    console.log('An error occurred while retrieving token.', err);
    return null;
  }
};

export const getNews = async () => {
  try {
    const { collection, getDocs, query, where, orderBy, limit } = await import("firebase/firestore");
    const articlesRef = collection(db, "articles");
    const q = query(articlesRef, where("status", "==", "published"), orderBy("publishedAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(doc => !doc.hidden);
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};