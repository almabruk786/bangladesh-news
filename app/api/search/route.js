import { NextResponse } from 'next/server';
import { adminDb } from '../../lib/firebaseAdmin';

export const revalidate = 300; // Cache search results for 5 minutes

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length < 2) {
            return NextResponse.json({
                success: false,
                results: [],
                message: 'Query too short'
            });
        }

        if (!adminDb) {
            return NextResponse.json({
                success: false,
                results: []
            });
        }

        const lowerQuery = query.toLowerCase().trim();

        // Optimized: Fetch only last 100 articles (reduced from 200)
        const snapshot = await adminDb.collection('articles')
            .where('status', '==', 'published')
            .orderBy('publishedAt', 'desc')
            .limit(100)
            .get();

        // Server-side filtering
        const results = snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    content: data.content,
                    category: data.category,
                    imageUrl: data.imageUrl || data.imageUrls?.[0],
                    publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt,
                    views: data.views || 0
                };
            })
            .filter(item => {
                // Smart search: title, content snippet, category
                const titleMatch = item.title?.toLowerCase().includes(lowerQuery);
                const contentMatch = item.content?.toLowerCase().includes(lowerQuery);
                const categoryMatch = item.category?.toLowerCase().includes(lowerQuery);
                return titleMatch || contentMatch || categoryMatch;
            })
            .slice(0, 20); // Return max 20 results

        return NextResponse.json({
            success: true,
            results,
            total: results.length
        });

    } catch (error) {
        console.error('[Search API] Error:', error);
        return NextResponse.json({
            success: false,
            results: [],
            error: 'Search failed'
        }, { status: 500 });
    }
}
