import { adminDb } from "./firebaseAdmin";
import { getSmartExcerpt } from "./utils";

// Simple In-Memory Cache to prevent Quota Exhaustion
const cache = {
    news: { data: null, timestamp: 0 },
    categories: { data: null, timestamp: 0 }
};

const CACHE_TTL_NEWS = 5 * 60 * 1000; // 5 minutes
const CACHE_TTL_CATS = 60 * 60 * 1000; // 60 minutes

export const getNews = async () => {
    const now = Date.now();
    if (cache.news.data && (now - cache.news.timestamp < CACHE_TTL_NEWS)) {
        console.log("[getNews] Returning cached data");
        return cache.news.data;
    }

    try {
        // Use firebase-admin for server-side operations
        if (!adminDb) return [];

        const articlesRef = adminDb.collection("articles");
        const snapshot = await articlesRef
            .where("status", "==", "published")
            .orderBy("publishedAt", "desc")
            .select('title', 'category', 'publishedAt', 'updatedAt', 'imageUrl', 'imageUrls', 'isPinned', 'views', 'excerpt', 'status', 'content')
            .limit(25)
            .get();

        const news = snapshot.docs.map(doc => {
            const data = doc.data();

            // Smart Excerpt Fallback (Server-Side)
            const finalExcerpt = data.excerpt || getSmartExcerpt(data.content, 180);

            return {
                id: doc.id,
                ...data,
                content: undefined, // OPTIMIZATION: Don't send heavy content to client
                excerpt: finalExcerpt,
                publishedAt: (data.publishedAt && data.publishedAt.toDate) ? data.publishedAt.toDate().toISOString() : data.publishedAt,
                updatedAt: (data.updatedAt && data.updatedAt.toDate) ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            };
        }).filter(doc => !doc.hidden);

        // Update Cache
        if (news.length > 0) {
            cache.news.data = news;
            cache.news.timestamp = now;
            console.log(`[getNews] Cached ${news.length} articles`);
        }

        return news;
    } catch (error) {
        console.error("Error fetching news:", error);
        return cache.news.data || []; // Return stale cache if error (or empty)
    }
};

export const getCategories = async () => {
    const now = Date.now();
    if (cache.categories.data && (now - cache.categories.timestamp < CACHE_TTL_CATS)) {
        return cache.categories.data;
    }

    try {
        if (!adminDb) return [];

        const snapshot = await adminDb.collection("categories").orderBy("name").get();

        if (snapshot.empty) return [];

        const cats = snapshot.docs.map(doc => ({
            name: doc.data().name,
            bn: doc.data().bn,
            link: `/category/${doc.data().name}`,
            hot: doc.data().hot,
            order: doc.data().order !== undefined ? doc.data().order : 999
        }));

        cats.sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name));

        // Update Cache
        if (cats.length > 0) {
            cache.categories.data = cats;
            cache.categories.timestamp = now;
            console.log(`[getCategories] Cached ${cats.length} categories`);
        }

        return cats;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return cache.categories.data || [];
    }
};
