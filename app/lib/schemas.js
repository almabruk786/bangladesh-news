import { formatIsoDate } from './dateUtils';
import { generateSeoUrl } from './urlUtils';

const BASE_URL = 'https://bakalia.xyz';
const PUBLISHER_NAME = 'Bakalia News';
const PUBLISHER_LOGO = `${BASE_URL}/icon.png`; // Ensure this exists, or use a specific logo URL

// 1. NewsArticle Schema
export const generateNewsArticleSchema = (article) => {
    if (!article) return null;

    const url = `${BASE_URL}/news/${generateSeoUrl(article.title, article.id)}`;
    const imageUrls = article.imageUrl ? [article.imageUrl] : (article.imageUrls || []);

    return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        'headline': article.title,
        'image': imageUrls,
        'datePublished': formatIsoDate(article.publishedAt),
        'dateModified': formatIsoDate(article.updatedAt || article.publishedAt),
        'author': {
            '@type': 'Person', // or Organization if generic
            'name': article.authorName || 'Desk Report',
            'url': `${BASE_URL}/about`
        },
        'publisher': {
            '@type': 'Organization',
            'name': PUBLISHER_NAME,
            'logo': {
                '@type': 'ImageObject',
                'url': PUBLISHER_LOGO
            }
        },
        'description': article.content ? article.content.substring(0, 160).replace(/<[^>]*>?/gm, "") : "",
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': url
        }
    };
};

// 2. BreadcrumbList Schema
export const generateBreadcrumbSchema = (breadcrumbs) => {
    // breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Category', url: '/category/...' }]
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    const itemListElement = breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }));

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': itemListElement
    };
};

// 3. Organization Schema (Global)
export const generateOrganizationSchema = () => {
    return {
        '@context': 'https://schema.org',
        '@type': 'NewsMediaOrganization',
        'name': PUBLISHER_NAME,
        'alternateName': ['Bangla Newspaper', 'BD News', 'All Bangla Newspaper', 'Bakalia News'],
        'url': BASE_URL,
        'logo': {
            '@type': 'ImageObject',
            'url': PUBLISHER_LOGO,
            'width': 512, // Approximate dimensions of icon.png
            'height': 512
        },
        'sameAs': [
            'https://www.facebook.com/profile.php?id=914852471714207',
            // 'https://twitter.com/bakalianews'
        ],
        'contactPoint': {
            '@type': 'ContactPoint',
            'contactType': 'editorial',
            'email': 'editor@bakalia.xyz'
        }
    };
};

// 4. ItemList Schema (For Homepage / Top Stories)
export const generateItemListSchema = (articles) => {
    if (!articles || articles.length === 0) return null;

    const itemListElement = articles.map((article, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'url': `${BASE_URL}/news/${generateSeoUrl(article.title, article.id)}`,
        'name': article.title
    }));

    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': itemListElement
    };
};
