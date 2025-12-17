import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const q = query(
      collection(db, "articles"),
      orderBy("publishedAt", "desc"),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    const articles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const feedXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Bakalia News</title>
  <link>https://bakalia.xyz</link>
  <description>Latest News from Bakalia News</description>
  <language>bn-BD</language>
  ${articles.map(article => `
  <item>
    <title><![CDATA[${article.title}]]></title>
    <link>https://bakalia.xyz/news/${article.id}</link>
    <guid>https://bakalia.xyz/news/${article.id}</guid>
    <description><![CDATA[${article.content ? article.content.replace(/<[^>]+>/g, '').substring(0, 200) + '...' : ''}]]></description>
    <pubDate>${new Date(article.publishedAt?.seconds * 1000 || Date.now()).toUTCString()}</pubDate>
    ${article.imageUrl ? `<enclosure url="${article.imageUrl}" type="image/jpeg" />` : ''}
  </item>
  `).join('')}
</channel>
</rss>`;

    return new Response(feedXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error("RSS Generation Error:", error);
    return new Response("Error generating feed", { status: 500 });
  }
}