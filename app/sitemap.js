import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default async function sitemap() {
  const baseUrl = 'https://bakalia.xyz';

  const q = query(
    collection(db, "articles"),
    orderBy("publishedAt", "desc"),
    limit(100)
  );

  const snapshot = await getDocs(q);

  const newsUrls = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      url: `${baseUrl}/news/${doc.id}`,
      lastModified: new Date(data.publishedAt).toISOString(),
    };
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
    },
    ...newsUrls,
  ];
}
