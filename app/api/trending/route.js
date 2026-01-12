import { NextResponse } from 'next/server';
import { adminDb } from '../../lib/firebaseAdmin';

export const revalidate = 900; // Cache for 15 minutes (ISR)

export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json({ success: false, trending: [] });
        }

        // Simplified: Get articles sorted by views field
        const articlesSnapshot = await adminDb.collection('articles')
            .where('status', '==', 'published')
            .orderBy('views', 'desc')
            .limit(5)
            .get();

        const trending = articlesSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            category: doc.data().category,
            imageUrl: doc.data().imageUrl || doc.data().imageUrls?.[0],
            publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt,
            views: doc.data().views || 0
        }));

        return NextResponse.json({ success: true, trending });

    } catch (error) {
        console.error('[Trending API] Error:', error);

        // Fallback: Get latest articles if views sorting fails
        try {
            const fallbackSnapshot = await adminDb.collection('articles')
                .where('status', '==', 'published')
                .orderBy('publishedAt', 'desc')
                .limit(5)
                .get();

            const trending = fallbackSnapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().title,
                category: doc.data().category,
                imageUrl: doc.data().imageUrl || doc.data().imageUrls?.[0],
                publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt,
                views: doc.data().views || 0
            }));

            return NextResponse.json({ success: true, trending });
        } catch (fallbackError) {
            return NextResponse.json({ success: false, trending: [] });
        }
    }
}
