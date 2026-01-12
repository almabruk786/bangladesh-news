import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';

export const revalidate = 900; // Cache for 15 minutes (ISR)

export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json({ success: false, trending: [] });
        }

        // Get analytics from last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const logsSnapshot = await adminDb.collection('analytics')
            .where('timestamp', '>=', oneDayAgo)
            .where('articleId', '!=', null)
            .get();

        // Count views per article (unique IPs)
        const articleViews = {};
        const uniqueIPs = {};

        logsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const articleId = data.articleId;
            const ip = data.ip;

            if (!articleId) return;

            if (!uniqueIPs[articleId]) {
                uniqueIPs[articleId] = new Set();
            }
            uniqueIPs[articleId].add(ip);
        });

        // Convert to counts
        Object.keys(uniqueIPs).forEach(articleId => {
            articleViews[articleId] = uniqueIPs[articleId].size;
        });

        // Get top 5 articles
        const topArticleIds = Object.entries(articleViews)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id]) => id);

        if (topArticleIds.length === 0) {
            return NextResponse.json({ success: true, trending: [] });
        }

        // Fetch article details
        const articlesPromises = topArticleIds.map(id =>
            adminDb.collection('articles').doc(id).get()
        );

        const articlesDocs = await Promise.all(articlesPromises);

        const trending = articlesDocs
            .filter(doc => doc.exists)
            .map((doc, index) => ({
                id: doc.id,
                title: doc.data().title,
                category: doc.data().category,
                imageUrl: doc.data().imageUrl || doc.data().imageUrls?.[0],
                publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt,
                views: articleViews[doc.id]
            }));

        return NextResponse.json({ success: true, trending });

    } catch (error) {
        console.error('[Trending API] Error:', error);
        return NextResponse.json({ success: false, trending: [], error: error.message });
    }
}
