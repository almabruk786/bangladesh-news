import { db } from './lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default async function sitemap() {
  const baseUrl = 'https://bakalia.xyz'; // আপনার লাইভ ডোমেইন

  // লেটেস্ট ১০০টি খবর ইনডেক্স করা হবে (AdSense এর জন্য ভালো)
  const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(100));
  const snapshot = await getDocs(q);
  
  const newsUrls = snapshot.docs.map((doc) => ({
    url: `${baseUrl}/news/${doc.id}`,
    lastModified: new Date(doc.data().publishedAt),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
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
      priority: 0.5,
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
    ...newsUrls,
  ];
}