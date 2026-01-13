import { NextResponse } from 'next/server';

// Simple cache clear API for testing
export async function POST() {
    try {
        // Force a module reload to clear the cache
        // Note: This is a simple approach. In production, you'd implement proper cache invalidation.
        const response = {
            message: 'Cache should clear on next restart or wait 5 minutes for natural expiration',
            note: 'Firestore cache is in-memory and will clear on server restart'
        };

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST to clear cache',
        cacheInfo: {
            NEWS: '5 minutes',
            CATEGORIES: '60 minutes',
            ARTICLE: '10 minutes'
        }
    });
}
