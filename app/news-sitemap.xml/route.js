import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { formatIsoDate } from '../../lib/dateUtils';
import { generateSeoUrl } from '../../lib/urlUtils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://bakalia.xyz';
  
  // Calculate 48 hours ago
  const twoDaysAgo = new Date();
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
  // Convert to Firestore Timestamp for query if stored as Timestamp, or string if stored as string.
  // Assuming string "ISO" or Date object based on previous code usage.
  // Actually, previous code used `new Date(data.publishedAt)`, so it likely stores as ISO string or compatible.
  // Let's perform client-side filter to be safe if format varies, or try query string range.
  // Querying all "published" articles and filtering is safer for mixed formats if dataset is small (<1000).
  
  let newsItems = [];
  try {
      // Fetch recent published articles
      // Optimally: where('publishedAt', '>', twoDaysAgo.toISOString())
      // But let's fetch last 50 published to ensure we get them, then filter precisesly.
      const q = query(
          collection(db, "articles"), 
          where("status", "==", "published")
          // orderBy("publishedAt", "desc"), // Requires index, might fail if not indexed
          // limit(100) 
      );
      
      const snapshot = await getDocs(q);
      
      newsItems = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(article => {
              const pubDate = new Date(article.publishedAt);
              return pubDate > twoDaysAgo;
          });

  } catch (e) {
      console.error("News Sitemap Error:", e);
  }

  const sitemapFields = newsItems.map(item => {
    return `
    <url>
      <loc>${baseUrl}/news/${generateSeoUrl(item.title, item.id)}</loc>
      <news:news>
        <news:publication>
          <news:name>Bangladesh News</news:name>
          <news:language>bn</news:language>
        </news:publication>
        <news:publication_date>${formatIsoDate(item.publishedAt)}</news:publication_date>
        <news:title>${item.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</news:title>
      </news:news>
    </url>
    `;
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${sitemapFields}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
