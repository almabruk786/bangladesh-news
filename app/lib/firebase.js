// ধাপ ৬: ফায়ারবেস (Firebase) সেটআপ
// বন্ধু, এটা হলো আমাদের রোবটের মেমোরি কানেকশন।
// তোমার প্রজেক্ট ফোল্ডারে 'lib/firebase.js' নামে ফাইলটি থাকলে এটি ব্যবহার করবে।

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// আমরা এখন সরাসরি কোডে API Key না লিখে, .env.local ফাইল থেকে নিচ্ছি
// এটি অনেক বেশি নিরাপদ এবং প্রফেশনাল পদ্ধতি
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// অ্যাপ চালু করছি
const app = initializeApp(firebaseConfig);

// ডাটাবেস বা স্টোর রুম রেডি করছি
export const db = getFirestore(app);

// ব্যাস! এখন আমরা এই 'db' ব্যবহার করে খবর জমা রাখতে পারব।