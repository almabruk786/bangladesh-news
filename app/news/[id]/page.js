import { db } from '../../lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import ArticleContent from './ArticleContent';
import { generateNewsArticleSchema, generateBreadcrumbSchema } from '../../lib/schemas';
import { parseNewsContent, getSmartExcerpt } from '../../lib/utils';
import { extractIdFromUrl, generateSeoUrl } from '../../lib/urlUtils';

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { id: slugId } = await params;
  const id = extractIdFromUrl(slugId) || slugId; // Support both "123" and "news-title-123"

  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const article = { id: docSnap.id, ...docSnap.data() };
    const description = article.metaDescription || getSmartExcerpt(article.content, 30);
    const seoUrl = `https://bakalia.xyz/news/${generateSeoUrl(article.title, article.id)}`;

    return {
      title: `${article.title} - ${article.category || 'News'} | Bangladesh News`,
      description: description,
      alternates: {
        canonical: seoUrl, // Force SEO URL as canonical
      },
      openGraph: {
        title: article.title,
        description: description,
        images: article.ogImage
          ? [article.ogImage]
          : (article.imageUrl ? [article.imageUrl] : (article.imageUrls && article.imageUrls.length > 0 ? [article.imageUrls[0]] : [])),
        type: 'article',
        publishedTime: article.publishedAt,
        authors: [article.authorName || 'Desk Report'],
        url: seoUrl,
      },
    };
  }

  return {
    title: "News Not Found",
    description: "The requested news article was not found.",
  };
}

export default async function NewsDetails({ params }) {
  const { id: slugId } = await params;
  const id = extractIdFromUrl(slugId) || slugId;

  let article = null;
  let relatedNews = [];

  try {
    const docRef = doc(db, "articles", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      article = { id: docSnap.id, ...docSnap.data() };

      // Fetch related news (Sidebar)
      // Note: Firestore structured queries might need composite indexes. 
      // If it fails on server, we might want to wrap in try/catch or simplify query.
      try {
        const q = query(collection(db, "articles"), where("category", "==", article.category), where("status", "==", "published"), limit(6));
        const snap = await getDocs(q);
        // Filter out current article and serialize data
        relatedNews = snap.docs
          .map(d => ({ id: d.id, ...d.data(), publishedAt: d.data().publishedAt })) // Ensure needed fields are present
          .filter(n => n.id !== id && !n.hidden);
      } catch (e) {
        console.error("Error fetching related news:", e);
      }
    }
  } catch (error) {
    console.error("Failed to fetch article:", error);
    // You might want to return a specific error component or let it fall through to "News Not Found"
  }

  if (!article || article.hidden) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-center p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">News Not Available</h1>
        <p className="text-slate-500">The news article you are looking for is currently unavailable or has been removed.</p>
        <Link href="/" className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition">
          Back to Home
        </Link>
      </div>
    );
  }

  const newsSchema = generateNewsArticleSchema({ ...article, updatedAt: null }); // Pass updatedAt if available in db
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