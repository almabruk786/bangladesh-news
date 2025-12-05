import { db } from './lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// 🔥 এই লাইনটি নতুন যোগ করা হয়েছে 🔥
// এটি গুগলকে বলবে: "পুরনো ফাইল দেখিও না, সব সময় তাজা ম্যাপ দেখাও"
export const revalidate = 0; 

export default async function sitemap() {
  const baseUrl = 'https://bakalia.xyz'; 

  // লেটেস্ট ১০০টি খবর
  const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(100));
  const snapshot = await getDocs(q);
  
  const newsUrls = snapshot.docs.map((doc) => ({
    url: `${baseUrl}/news/${doc.id}`,
    lastModified: new Date(doc.data().publishedAt),
    changeFrequency: 'always', // গুগলকে বলছি খবর সব সময় আপডেট হয়
    priority: 0.9,
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