import { db } from '../lib/firebase';   // FIXED PATH
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default async function sitemap() {
  const baseUrl = 'https://bakalia.xyz';

  try {
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
        lastModified: data.publishedAt
          ? new Date(data.publishedAt).toISOString()
          : new Date().toISOString(),
      };
    });

    return [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
      },
      ...newsUrls,
    ];

  } catch (error) {
    console.error("Sitemap generation error:", error);

    return [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
      }
    ];
  }
}
