import { db } from '../../../lib/firebase';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // আপডেট: আপনার কেনা ডোমেইন ব্যবহার করা হচ্ছে (SEO এর জন্য সেরা)
  const baseUrl = 'https://bakalia.xyz'; 

  // লেটেস্ট ২০টি খবর আনছি
  const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(20));
  const snapshot = await getDocs(q);

  // XML এর শুরুর অংশ
  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Bangladesh News</title>
      <link>${baseUrl}</link>
      <description>Automated AI News Portal</description>
      <language>bn</language>
  `;

  // প্রতিটি খবর XML এ ঢোকানো হচ্ছে
  snapshot.forEach((doc) => {
    const data = doc.data();
    const link = `${baseUrl}/news/${doc.id}`;
    
    rss += `
      <item>
        <title><![CDATA[${data.title}]]></title>
        <link>${link}</link>
        <description><![CDATA[${data.content ? data.content.substring(0, 150) : ""}...]]></description>
        <pubDate>${new Date(data.publishedAt).toUTCString()}</pubDate>
        <guid>${link}</guid>
      </item>
    `;
  });

  // শেষ অংশ
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