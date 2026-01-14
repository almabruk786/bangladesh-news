import { getSitemapNews, getCategories } from './lib/firebaseServer';
import { generateSeoUrl } from './lib/urlUtils';

export default async function sitemap() {
    const baseUrl = 'https://bakalia.xyz';

    // Fetch latest news for sitemap (Optimized > 1000 items)
    const news = await getSitemapNews();

    const newsUrls = news.map((item) => ({
        url: `${baseUrl}/news/${generateSeoUrl(item.title, item.id)}`,
        lastModified: item.updatedAt || item.publishedAt || new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    // Category pages - CRITICAL FOR SEO!
    const categoryList = await getCategories();

    const categoryUrls = categoryList.map((cat) => ({
        url: `${baseUrl}/category/${cat.name}`,
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
