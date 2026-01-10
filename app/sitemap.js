import { getNews } from './lib/firebase';

export default async function sitemap() {
    const baseUrl = 'https://bakalia.xyz'; // Replace with your actual domain

    // Fetch latest news for sitemap
    // Note: getNews currently fetches 50. For sitemap we might want more eventually, 
    // but starting with 50 is fine for now to avoid massive reads.
    const news = await getNews();

    const newsUrls = news.map((item) => ({
        url: `${baseUrl}/news/${item.id}`,
        lastModified: item.updatedAt || item.publishedAt || new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date().toISOString(),
            changeFrequency: 'always',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...newsUrls,
    ];
}
