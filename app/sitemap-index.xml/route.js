import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://bakalia.xyz';

  // Check if there are any news from last 48 hours
  let hasFreshNews = false;
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
    // Rough check: fetch last 10 published and check dates
    // Using existing constraints from other files
    const q = query(collection(db, "articles"), where("status", "==", "published"), limit(20));
    const snap = await getDocs(q);
    hasFreshNews = snap.docs.some(doc => {
      const d = new Date(doc.data().publishedAt);
      return d > twoDaysAgo;
    });
  } catch (e) {
    console.error("Sitemap Index Check Error:", e);
  }

  const newsSitemapEntry = hasFreshNews ? `
  <sitemap>
    <loc>${baseUrl}/news-sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>` : '';

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-main.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>${newsSitemapEntry}
</sitemapindex>`;

  return new Response(sitemapIndex, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
