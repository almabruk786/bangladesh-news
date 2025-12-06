// আপডেট: সঠিক পাথ (২ ঘর পেছনে) - এটি নিশ্চিত করুন
import { db } from '../../lib/firebase';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { parseNewsContent } from '../../lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://bakalia.xyz';

  const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(20));
  const snapshot = await getDocs(q);

  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Bangladesh News</title>
      <link>${baseUrl}</link>
      <description>Latest News from Bangladesh</description>
      <language>bn</language>
  `;

  snapshot.forEach((doc) => {
    const data = doc.data();
    const link = `${baseUrl}/news/${doc.id}`;

    const content = parseNewsContent(data.content);

    rss += `
      <item>
        <title><![CDATA[${data.title}]]></title>
        <link>${link}</link>
        <description><![CDATA[${content.substring(0, 150)}...]]></description>
        <pubDate>${new Date(data.publishedAt).toUTCString()}</pubDate>
        <guid>${link}</guid>
      </item>
    `;
  });

  rss += `
    </channel>
  </rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'text/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}