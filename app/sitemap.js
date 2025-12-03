import { db } from './lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default async function sitemap() {
  const baseUrl = 'https://আপনার-লাইভ-সাইটের-লিংক.vercel.app'; // এখানে আপনার আসল Vercel লিংক দিন

  // লেটেস্ট ৫০টি খবর ইনডেক্স করা হবে
  const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(50));
  const snapshot = await getDocs(q);
  
  const newsUrls = snapshot.docs.map((doc) => ({
    url: `${baseUrl}/news/${doc.id}`,
    lastModified: new Date(doc.data().publishedAt),
    changeFrequency: 'daily',
    priority: 0.7,
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
    ...newsUrls,
  ];
}