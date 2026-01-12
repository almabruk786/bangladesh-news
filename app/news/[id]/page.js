import { adminDb } from '../../lib/firebaseAdmin';
import Link from 'next/link';
import ArticleContent from './ArticleContent';
import { generateNewsArticleSchema, generateBreadcrumbSchema } from '../../lib/schemas';
import { parseNewsContent, getSmartExcerpt } from '../../lib/utils';
import { extractIdFromUrl, generateSeoUrl } from '../../lib/urlUtils';

// ISR: Revalidate every 5 minutes (reduces Firestore reads dramatically on Vercel)
export const revalidate = 300;

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { id: slugId } = await params;
  const id = extractIdFromUrl(slugId) || slugId;

  if (!adminDb) return { title: "News Not Found" };

  try {
    const docSnap = await adminDb.collection("articles").doc(id).get();

    if (docSnap.exists) {
      const article = { id: docSnap.id, ...docSnap.data() };

      // Robust Description Logic
      let description = article.metaDescription;
      if (!description) {
        description = getSmartExcerpt(article.content, 30);
      }
      if (!description || description.length < 10) {
        description = `${article.title} - বিস্তারিত পড়ুন বাকলিয়া নিউজে...`;
      }

      const seoUrl = `https://bakalia.xyz/news/${generateSeoUrl(article.title, article.id)}`;

      // Robust Image Logic
      const ensureAbsoluteUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `https://bakalia.xyz${url.startsWith('/') ? '' : '/'}${url}`;
      };

      let ogImages = [];
      const imgAlt = article.imageAlt || article.title;

      // Try to find image in content if metadata is missing
      let contentImage = null;
      if (!article.ogImage && !article.imageUrl && (!article.imageUrls || article.imageUrls.length === 0)) {
        const imgMatch = article.content?.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) contentImage = imgMatch[1];
      }

      const primaryImage = ensureAbsoluteUrl(article.ogImage || article.imageUrl || (article.imageUrls?.[0]) || contentImage);

      if (primaryImage) {
        ogImages.push({
          url: primaryImage,
          alt: imgAlt,
          width: 1200,
          height: 630,
        });
      } else {
        ogImages.push({
          url: 'https://bakalia.xyz/bn-icon.png',
          alt: 'Bakalia News Logo',
          width: 512,
          height: 512,
        });
      }

      return {
        title: `${article.title} | Bakalia News`,
        description: description,
        alternates: {
          canonical: seoUrl,
        },
        openGraph: {
          title: article.title,
          description: description,
          images: ogImages,
          type: 'article',
          publishedTime: article.publishedAt?.toDate?.().toISOString() || article.publishedAt,
          authors: [article.authorName || 'Desk Report'],
          url: seoUrl,
          siteName: 'বাকলিয়া নিউজ',
          locale: 'bn_BD',
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description: description,
          images: [primaryImage || 'https://bakalia.xyz/bn-icon.png'],
        },
      };
    }
  } catch (e) {
    console.error("Metadata generation error:", e);
  }

  return {
    title: "News Not Found",
    description: "The requested news article was not found.",
  };
}

import { notFound } from 'next/navigation';

export default async function NewsDetails({ params }) {
  const { id: slugId } = await params;
  const id = extractIdFromUrl(slugId) || slugId;

  let article = null;
  let relatedNews = [];

  if (!adminDb) return <div className="p-10 text-center">System Error: Admin SDK Missing</div>;

  try {
    const docSnap = await adminDb.collection("articles").doc(id).get();

    if (docSnap.exists) {
      const data = docSnap.data();

      // Serialize Firestore Dates
      const serializeDate = (date) => {
        if (!date) return null;
        if (date.toDate) return date.toDate().toISOString();
        return date; // assume string
      };

      article = {
        id: docSnap.id,
        ...data,
        publishedAt: serializeDate(data.publishedAt),
        updatedAt: serializeDate(data.updatedAt),
      };

      // Fetch related news (Sidebar) using Admin SDK
      try {
        const relatedSnap = await adminDb.collection("articles")
          .where("category", "==", article.category)
          .where("status", "==", "published")
          .limit(6)
          .get();

        relatedNews = relatedSnap.docs
          .map(d => {
            const dData = d.data();
            return {
              id: d.id,
              ...dData,
              publishedAt: serializeDate(dData.publishedAt)
            };
          })
          .filter(n => n.id !== id && !n.hidden);
      } catch (e) {
        console.error("Error fetching related news:", e);
      }
    }
  } catch (error) {
    console.error("Failed to fetch article:", error);
  }

  if (!article || article.hidden) {
    notFound();
  }

  const newsSchema = generateNewsArticleSchema({
    ...article,
    updatedAt: article.updatedAt // ensure schema gets updated date if available
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: article.category, url: `/category/${article.category}` },
    { name: article.title, url: `/news/${id}` }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ArticleContent article={article} relatedNews={relatedNews} />
    </>
  );
}