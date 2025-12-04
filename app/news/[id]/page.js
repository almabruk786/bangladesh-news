import { db } from '../../lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import NewsSlider from '../../components/NewsSlider'; 
import { ArrowLeft, Share2, Clock, User, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// ১. এসইও মেটাডাটা (SEO Metadata)
export async function generateMetadata({ params }) {
  // Next.js 15: params অবশ্যই await করতে হবে
  const { id } = await params;
  
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const article = docSnap.data();
    const images = article.imageUrls || [article.imageUrl] || [];
    const summary = article.content ? article.content.replace(/\n/g, ' ').substring(0, 160) + "..." : "Latest news.";

    return {
      title: article.title,
      description: summary,
      openGraph: {
        title: article.title,
        description: summary,
        images: images,
        type: 'article',
        siteName: 'Bangladesh News',
        authors: [article.authorName || 'News Desk'],
      },
    };
  }
  return { title: "News Not Found" };
}

// ২. মেইন পেজ কম্পোনেন্ট
export default async function NewsDetails({ params }) {
  const { id } = await params; // await করা হলো
  
  // মেইন খবর আনা
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return <div className="text-center py-20 font-bold text-xl text-red-500">খবরটি পাওয়া যায়নি!</div>;

  const article = docSnap.data();
  
  const imageList = article.imageUrls && article.imageUrls.length > 0 
                    ? article.imageUrls 
                    : (article.imageUrl ? [article.imageUrl] : []);

  // স্কিমা মার্কআপ (Google News Schema)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: imageList,
    datePublished: article.publishedAt,
    author: [{ '@type': 'Person', name: article.authorName || 'News Desk' }]
  };

  // ৩. সাইডবারের জন্য "সম্পর্কিত খবর" আনা
  let relatedNews = [];
  try {
    const q = query(
      collection(db, "articles"), 
      where("category", "==", article.category), // একই ক্যাটাগরির খবর
      where("status", "==", "published"), 
      limit(6)
    );
    const snap = await getDocs(q);
    // বর্তমান খবরটি বাদ দিয়ে বাকিগুলো নেওয়া
    relatedNews = snap.docs.map(d => ({id: d.id, ...d.data()})).filter(n => n.id !== id);
  } catch (e) {
    console.error("Related news error (Index might be missing):", e);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* টপ নেভিগেশন */}
        <Link href="/" className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-red-600 mb-6 transition font-medium text-sm">
          <ArrowLeft size={16} className="mr-2" /> প্রচ্ছদ
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- বাম পাশ: মূল খবর (Left Column - 70%) --- */}
          <div className="lg:col-span-2">
            <article className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700">
              
              <div className="flex items-center gap-4 mb-4 text-sm">
                 <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-xs">
                   {article.category || "খবর"}
                 </span>
                 <span className="flex items-center text-slate-400 gap-1">
                   <Clock size={14} /> 
                   {new Date(article.publishedAt).toLocaleString('bn-BD')}
                 </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                {article.title}
              </h1>

              {/* স্লাইডার কম্পোনেন্ট */}
              <NewsSlider images={imageList} title={article.title} />

              {/* খবরের বিস্তারিত */}
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-300 leading-relaxed text-justify text-base md:text-lg">
                {article.content.split('\n').map((para, index) => (
                  <p key={index} className="mb-4">{para}</p>
                ))}
              </div>

              {/* ফুটার এরিয়া */}
              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">প্রতিবেদক</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                            {article.authorName || 'ডেস্ক রিপোর্ট'}
                        </p>
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition shadow-md">
                  <Share2 size={18} /> শেয়ার করুন
                </button>
              </div>
            </article>
          </div>

          {/* --- ডান পাশ: সম্পর্কিত খবর (Right Sidebar - 30%) --- */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 sticky top-24">
              <h3 className="font-bold text-lg border-b border-slate-200 dark:border-slate-600 pb-2 mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                <TrendingUp size={20} className="text-red-600"/> আরো পড়ুন
              </h3>
              
              <div className="flex flex-col gap-5">
                {relatedNews.length > 0 ? relatedNews.map(item => (
                  <Link href={`/news/${item.id}`} key={item.id} className="group flex gap-3 items-start">
                    <div className="w-24 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0">
                      <img 
                        src={item.imageUrl || (item.imageUrls && item.imageUrls[0]) || "https://via.placeholder.com/150"} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-white group-hover:text-red-600 leading-snug line-clamp-3">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(item.publishedAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </Link>
                )) : (
                  <p className="text-sm text-slate-400">এই মুহূর্তে আর কোনো খবর নেই।</p>
                )}
              </div>

              {/* বিজ্ঞাপনের জায়গা (AdSense Placeholder) */}
              <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center">
                <span className="text-xs text-slate-400 uppercase tracking-widest">Advertisement</span>
                <div className="h-40 bg-slate-200 dark:bg-slate-800 mt-2 rounded flex items-center justify-center text-slate-400 text-sm">
                  Google Ad Space
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}