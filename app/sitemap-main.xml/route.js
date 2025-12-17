import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { formatIsoDate } from '../lib/dateUtils';
import { generateSeoUrl } from '../lib/urlUtils';

export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = 'https://bakalia.xyz';

    // Static Pages
    const staticUrls = [
        '', '/about', '/contact', '/privacy-policy',
        '/category/Politics', '/category/Sports', '/category/International',
        '/category/Bangladesh', '/category/Business', '/category/Entertainment',
        '/category/Lifestyle', '/category/Opinion'
    ];

    const staticXml = staticUrls.map(url => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${url === '' ? 'always' : 'daily'}</changefreq>
    <priority>${url === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

    // Articles (All published)
    let articleXml = '';
    try {
        const q = query(collection(db, "articles"), where("status", "==", "published"));
        const snapshot = await getDocs(q);

        articleXml = snapshot.docs.map(doc => {
            const data = doc.data();
            return `
  <url>
    <loc>${baseUrl}/news/${generateSeoUrl(data.title, doc.id)}</loc>
    <lastmod>${formatIsoDate(data.updatedAt || data.publishedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
        }).join('');
    } catch (e) {
        console.error("Main Sitemap Error:", e);
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${articleXml}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
