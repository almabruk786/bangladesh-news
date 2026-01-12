import { adminDb } from './firebaseAdmin';

// Smart Cache with LRU eviction and stale-while-revalidate
class SmartCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    // Get time-of-day multiplier for dynamic TTL
    getTimeMultiplier() {
        const hour = new Date().getHours();
        // Peak hours (9 AM - 11 PM Bangladesh): shorter cache
        // Off-peak (11 PM - 9 AM): longer cache
        if (hour >= 9 && hour < 23) return 1; // Normal
        return 3; // 3x longer during off-peak
    }

    set(key, value, ttl) {
        // Apply dynamic TTL based on time
        const dynamicTTL = ttl * this.getTimeMultiplier();

        const item = {
            value,
            timestamp: Date.now(),
            ttl: dynamicTTL,
            hits: 0
        };

        // LRU: If cache full, remove least recently used
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
        item.hits++; // Track popularity

        // Stale-while-revalidate: Return stale data but mark for refresh
        if (age > item.ttl) {
            return { value: item.value, stale: true };
        }

        // Move to end (LRU)
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

    // Get cache stats
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

// Initialize smart caches
const newsCache = new SmartCache(50); // Cache up to 50 news queries
const categoryCache = new SmartCache(20);
const articleCache = new SmartCache(100); // Individual articles

// Base TTLs (will be multiplied by time-of-day)
const BASE_TTL = {
    NEWS: 5 * 60 * 1000,      // 5 minutes (15 min at night)
    CATEGORIES: 60 * 60 * 1000, // 60 minutes (3 hours at night)
    ARTICLE: 10 * 60 * 1000    // 10 minutes (30 min at night)
};

export const getNews = async () => {
    const cacheKey = 'all_news';
    const cached = newsCache.get(cacheKey);

    if (cached && !cached.stale) {
        console.log('[getNews] Cache HIT (fresh)');
        return cached.value;
    }

    // If stale, return old data but refresh in background
    if (cached && cached.stale) {
        console.log('[getNews] Cache HIT (stale) - returning old data, refreshing...');

        // Background refresh (non-blocking)
        setImmediate(async () => {
            try {
                const fresh = await fetchNewsFromDb();
                newsCache.set(cacheKey, fresh, BASE_TTL.NEWS);
                console.log('[getNews] Background refresh complete');
            } catch (err) {
                console.error('[getNews] Background refresh failed:', err);
            }
        });

        return cached.value;
    }

    // Cache miss - fetch from DB
    console.log('[getNews] Cache MISS - fetching from DB');
    const news = await fetchNewsFromDb();
    newsCache.set(cacheKey, news, BASE_TTL.NEWS);
    return news;
};

async function fetchNewsFromDb() {
    if (!adminDb) {
        console.warn('[getNews] adminDb not available');
        return [];
    }

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
            excerpt: data.excerpt,
            imageUrl: data.imageUrl,
            imageUrls: data.imageUrls,
            imageAlt: data.imageAlt,
            publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt,
            views: data.views || 0,
        };
    });
}

export const getCategories = async () => {
    const cacheKey = 'all_categories';
    const cached = categoryCache.get(cacheKey);

    if (cached && !cached.stale) {
        console.log('[getCategories] Cache HIT (fresh)');
        return cached.value;
    }

    if (cached && cached.stale) {
        console.log('[getCategories] Cache HIT (stale) - returning old, refreshing...');

        setImmediate(async () => {
            try {
                const fresh = await fetchCategoriesFromDb();
                categoryCache.set(cacheKey, fresh, BASE_TTL.CATEGORIES);
            } catch (err) {
                console.error('[getCategories] Background refresh failed:', err);
            }
        });

        return cached.value;
    }

    console.log('[getCategories] Cache MISS - fetching from DB');
    const categories = await fetchCategoriesFromDb();
    categoryCache.set(cacheKey, categories, BASE_TTL.CATEGORIES);
    return categories;
};

async function fetchCategoriesFromDb() {
    if (!adminDb) return [];

    const snapshot = await adminDb.collection('categories').orderBy('order').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Cache individual article (useful for trending/related)
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

    const doc = await adminDb.collection('articles').doc(id).get();
    if (!doc.exists) return null;

    const article = { id: doc.id, ...doc.data() };
    articleCache.set(id, article, BASE_TTL.ARTICLE);
    return article;
};

// Clear cache manually (useful for admin actions)
export const clearCache = (type = 'all') => {
    if (type === 'news' || type === 'all') newsCache.clear();
    if (type === 'categories' || type === 'all') categoryCache.clear();
    if (type === 'articles' || type === 'all') articleCache.clear();
    console.log(`[Cache] Cleared: ${type}`);
};

// Get cache statistics (for monitoring)
export const getCacheStats = () => ({
    news: newsCache.getStats(),
    categories: categoryCache.getStats(),
    articles: articleCache.getStats(),
    timeMultiplier: newsCache.getTimeMultiplier()
});
