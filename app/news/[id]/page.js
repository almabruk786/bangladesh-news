import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Header from '../../components/Header'; 
import { ArrowLeft, Share2, Clock, User } from 'lucide-react';
import Link from 'next/link';

// ১. অটোমেটিক মেটাডাটা জেনারেটর
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const article = docSnap.data();
    return {
      title: article.title,
      description: article.content.substring(0, 160), // প্রথম ১৬০ অক্ষর ডেসক্রিপশন হবে
      openGraph: {
        title: article.title,
        description: article.content.substring(0, 160),
        images: [article.imageUrl || 'https://bakalia.xyz/default-news.jpg'],
        type: 'article',
        publishedTime: article.publishedAt,
        authors: ['Bangladesh News Desk'],
      },
    };
  }
  return { title: "News Not Found" };
}

export default async function NewsDetails({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return <div className="text-center py-20">খবরটি পাওয়া যায়নি!</div>;

  const article = docSnap.data();

  // ২. গুগলের জন্য অটোমেটিক স্কিমা (Schema Markup)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: [article.imageUrl || ''],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: [{
        '@type': 'Organization',
        name: 'Bangladesh News',
        url: 'https://bakalia.xyz'
    }]
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* স্কিমা ডাটা ইনজেক্ট করা হলো */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-red-600 mb-6 transition font-medium text-sm">
          <ArrowLeft size={16} className="mr-2" /> প্রচ্ছদ
        </Link>

        <article className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6 text-sm">
             <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-xs">
               {article.category || "বাংলাদেশ"}
             </span>
             <span className="flex items-center text-slate-400 gap-1">
               <Clock size={14} /> 
               {new Date(article.publishedAt).toLocaleString('bn-BD')}
             </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-8 leading-tight">
            {article.title}
          </h1>

          <div className="w-full h-[300px] md:h-[500px] bg-slate-200 rounded-xl mb-10 overflow-hidden relative shadow-lg">
            <img 
              src={article.imageUrl || "https://via.placeholder.com/800x400?text=No+Image"} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed">
            {article.content.split('\n').map((para, index) => (
              <p key={index} className="mb-4 text-lg">{para}</p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 font-medium bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2">
              <User size={16} /> রিপোর্টার: <span className="text-slate-800">{article.source === 'Editor Desk' ? 'নিজস্ব প্রতিবেদক' : article.source}</span>
            </p>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition font-medium shadow-md shadow-blue-200">
              <Share2 size={18} /> ফেসবুকে শেয়ার
            </button>
          </div>
        </article>
      </main>
    </div>
  );
}