import { adminDb } from './firebaseAdmin';

// Smart Cache with LRU eviction and stale-while-revalidate
import { unstable_cache } from 'next/cache';

class SmartCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    getTimeMultiplier() {
        const hour = new Date().getHours();
        if (hour >= 9 && hour < 23) return 1;
        return 3;
    }

    set(key, value, ttl) {
        const dynamicTTL = ttl * this.getTimeMultiplier();

        const item = {
            value,
            timestamp: Date.now(),
            ttl: dynamicTTL,
            hits: 0
        };

        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, item);
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        const age = Date.now() - item.timestamp;
        item.hits++;

        if (age > item.ttl) {
            return { value: item.value, stale: true };
        }

        this.cache.delete(key);
        this.cache.set(key, item);

        return { value: item.value, stale: false };
    }

    clear(key) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    getStats() {
        const entries = Array.from(this.cache.entries());
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            entries: entries.map(([key, item]) => ({
                key,
                age: Date.now() - item.timestamp,
                hits: item.hits,
                stale: Date.now() - item.timestamp > item.ttl
            }))
        };
    }
}

const newsCache = new SmartCache(50);
const categoryCache = new SmartCache(20);
const articleCache = new SmartCache(100);

const BASE_TTL = {
    NEWS: 5 * 60 * 1000,
    CATEGORIES: 60 * 60 * 1000,
    ARTICLE: 10 * 60 * 1000
};

export const getNews = unstable_cache(
    async () => {
        console.log('[getNews] Cache MISS - fetching from DB');
        return await fetchNewsFromDb();
    },
    ['all_news'],
    { revalidate: 300, tags: ['news'] }
);

async function fetchNewsFromDb() {
    if (!adminDb) {
        console.warn('[fetchNewsFromDb] adminDb not available');
        return [];
    }

    try {
        const snapshot = await adminDb
            .collection('articles')
            .where('status', '==', 'published')
            .orderBy('publishedAt', 'desc')
            .limit(100)
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                category: data.category,
                categories: data.categories,
                content: data.content, // Added to enable excerpt generation
                excerpt: data.excerpt,
                imageUrl: data.imageUrl,
                imageUrls: data.imageUrls,
                imageAlt: data.imageAlt,
                publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt,
                views: data.views || 0,
            };
        });
    } catch (error) {
        // Handle quota exceeded gracefully
        if (error.code === 8 || error.message?.includes('Quota exceeded')) {
            console.warn('[fetchNewsFromDb] Quota exceeded - returning empty array');
            return [];
        }
        console.error('[fetchNewsFromDb] Error:', error);
        return [];
    }
}

export const getCategories = unstable_cache(
    async () => {
        console.log('[getCategories] Cache MISS - fetching from DB');
        return await fetchCategoriesFromDb();
    },
    ['all_categories'],
    { revalidate: 3600, tags: ['categories'] }
);

async function fetchCategoriesFromDb() {
    if (!adminDb) return [];

    try {
        const snapshot = await adminDb.collection('categories').orderBy('order').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        // Handle quota exceeded gracefully
        if (error.code === 8 || error.message?.includes('Quota exceeded')) {
            console.warn('[fetchCategoriesFromDb] Quota exceeded - returning empty array');
            return [];
        }
        console.error('[fetchCategoriesFromDb] Error:', error);
        return [];
    }
}

export const getArticleById = async (id) => {
    const cached = articleCache.get(id);

    if (cached && !cached.stale) {
        return cached.value;
    }

    if (cached && cached.stale) {
        setImmediate(async () => {
            try {
                const doc = await adminDb.collection('articles').doc(id).get();
                if (doc.exists) {
                    articleCache.set(id, { id: doc.id, ...doc.data() }, BASE_TTL.ARTICLE);
                }
            } catch (err) {
                console.error('[getArticleById] Background refresh failed:', err);
            }
        });

        return cached.value;
    }

    if (!adminDb) return null;

    try {
        const doc = await adminDb.collection('articles').doc(id).get();
        if (!doc.exists) return null;

        const article = { id: doc.id, ...doc.data() };
        articleCache.set(id, article, BASE_TTL.ARTICLE);
        return article;
    } catch (error) {
        // Handle quota exceeded
        if (error.code === 8 || error.message?.includes('Quota exceeded')) {
            console.warn('[getArticleById] Quota exceeded - returning null');
            return null;
        }
        console.error('[getArticleById] Error:', error);
        return null;
    }
};

export const clearCache = (type = 'all') => {
    if (type === 'news' || type === 'all') newsCache.clear();
    if (type === 'categories' || type === 'all') categoryCache.clear();
    if (type === 'articles' || type === 'all') articleCache.clear();
    console.log(`[Cache] Cleared: ${type}`);
};

export const getCacheStats = () => ({
    news: newsCache.getStats(),
    categories: categoryCache.getStats(),
    articles: articleCache.getStats(),
    timeMultiplier: newsCache.getTimeMultiplier()
});
