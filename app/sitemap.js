import { db } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default async function sitemap() {
  const baseUrl = 'https://bakalia.xyz'; // আপনার ডোমেইন

  // ফায়ারবেজ থেকে সব আর্টিকেল আনা
  let newsUrls = [];
  try {
    const querySnapshot = await getDocs(collection(db, "articles"));
    newsUrls = querySnapshot.docs.map(doc => ({
      url: `${baseUrl}/news/${doc.id}`,
      lastModified: new Date(doc.data().publishedAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    // ক্যাটাগরি পেজগুলো (স্ট্যাটিক রাখা ভালো বা ডায়নামিক করা যেতে পারে)
    {
      url: `${baseUrl}/?category=politics`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/?category=sports`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/?category=technology`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  return [...staticUrls, ...newsUrls];
}