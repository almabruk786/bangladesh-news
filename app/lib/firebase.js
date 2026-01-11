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

console.log("Firebase Config Debug:", {
  apiKey: firebaseConfig.apiKey ? "Present" : "MISSING",
  projectId: firebaseConfig.projectId,
  senderId: firebaseConfig.messagingSenderId,
});

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

export const getNews = async () => {
  try {
    const { collection, getDocs, query, where, orderBy, limit } = await import("firebase/firestore");
    const articlesRef = collection(db, "articles");
    const q = query(articlesRef, where("status", "==", "published"), orderBy("publishedAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure specific fields are serializable for Next.js Server Components
      return {
        id: doc.id,
        ...data,
        // serialize timestamps if they exist and are not already strings
        publishedAt: (data.publishedAt && data.publishedAt.toDate) ? data.publishedAt.toDate().toISOString() : data.publishedAt,
        updatedAt: (data.updatedAt && data.updatedAt.toDate) ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      };
    }).filter(doc => !doc.hidden);
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const q = query(collection(db, "categories"), orderBy("name"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];

    const cats = snapshot.docs.map(doc => ({
      name: doc.data().name,
      bn: doc.data().bn,
      link: `/category/${doc.data().name}`,
      hot: doc.data().hot,
      order: doc.data().order !== undefined ? doc.data().order : 999
    }));

    // Sort: Order first (asc), then Name (asc)
    cats.sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name));

    return cats;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};