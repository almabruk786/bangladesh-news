import { getNews } from './lib/firebase';

export default async function sitemap() {
    const baseUrl = 'https://bakalia.xyz';

    // Fetch latest news for sitemap (optimized to 100 for better performance)
    const news = await getNews();

    const newsUrls = news.map((item) => ({
        url: `${baseUrl}/news/${item.id}`,
        lastModified: item.updatedAt || item.publishedAt || new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    // Category pages - CRITICAL FOR SEO!
    const categories = [
        'Bangladesh', 'Politics', 'International', 'Sports', 'Opinion',
        'Business', 'Entertainment', 'Lifestyle', 'Technology', 'Health',
        'Education', 'National'
    ];

    const categoryUrls = categories.map((cat) => ({
        url: `${baseUrl}/category/${cat}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.9, // High priority for category pages
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date().toISOString(),
            changeFrequency: 'always',
            priority: 1,
        },
        ...categoryUrls, // Category pages MUST be in sitemap
        {
            url: `${baseUrl}/newspapers`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        ...newsUrls,
    ];
}
