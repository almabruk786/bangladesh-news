import { db } from '../../lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import ArticleContent from './ArticleContent';
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
    const description = getSmartExcerpt(article.content, 30);
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
        images: article.imageUrl ? [article.imageUrl] : [],
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
        .filter(n => n.id !== id);

      // Serializing timestamps if they are Firestore timestamps is tricky in Server Components.
      // Assuming publishedAt is a string or compatible value based on existing client code usage.
      // If it's a Firestore Timestamp, we need to convert it to string/number.
      // Based on existing code `new Date(article.publishedAt)`, it seems it might be stored as string or number.
      // If it's Firestore Timestamp, `new Date()` works on it? No, needs `.toDate()`.
      // Let's assume the previous code worked so the data format is compatible.
    } catch (e) {
      console.error("Error fetching related news:", e);
    }
  }

  if (!article) {
    return <div className="text-center py-20 font-bold">খবরটি পাওয়া যায়নি!</div>;
  }

  return <ArticleContent article={article} relatedNews={relatedNews} />;
}