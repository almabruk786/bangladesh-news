import { db } from '../../lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import Header from '../../components/Header'; 
import NewsSlider from '../../components/NewsSlider'; 
import { ArrowLeft, Share2, Clock, User, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// ডিফল্ট ইমেজ
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000';

// 🔥 ১. AdSense অপ্টিমাইজড মেটাডাটা 🔥
export async function generateMetadata({ params }) {
  const { id } = await params;
  
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return { title: "News Not Found | Bangladesh News" };
  }

  const article = docSnap.data();
  const mainImage = article.imageUrl || (article.imageUrls && article.imageUrls[0]) || DEFAULT_IMAGE;
  
  // Thin Content ফিক্স: ডেসক্রিপশন অন্তত ১৬০ অক্ষরের হতে হবে
  const cleanContent = article.content ? article.content.replace(/<[^>]*>?/gm, '') : ""; // HTML ট্যাগ সরানো
  const summary = cleanContent.length > 160 
    ? cleanContent.substring(0, 160) + "..." 
    : cleanContent + " - বিস্তারিত পড়ুন আমাদের ওয়েবসাইটে।";

  return {
    title: `${article.title}`, // ইউনিক টাইটেল
    description: summary,
    alternates: {
      canonical: `/news/${id}`,
    },
    openGraph: {
      title: article.title,
      description: summary,
      url: `/news/${id}`,
      siteName: 'Bangladesh News',
      locale: 'bn_BD',
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.authorName || 'News Desk'],
      images: [{ url: mainImage, width: 1200, height: 630, alt: article.title }],
    },
    // AdSense সেফটি মেটা ট্যাগ
    other: {
      "rating": "General", // সাইটটি সবার জন্য নিরাপদ
      "google-adsense-account": "ca-pub-XXXXXXXXXXXXXXXX", // (ভবিষ্যতে আপনার আইডি এখানে বসবে)
    }
  };
}

export default async function NewsDetails({ params }) {
  const { id } = await params;
  
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return <div className="text-center py-20 font-bold">খবরটি পাওয়া যায়নি!</div>;

  const article = docSnap.data();
  const imageList = article.imageUrls && article.imageUrls.length > 0 
                    ? article.imageUrls 
                    : (article.imageUrl ? [article.imageUrl] : [DEFAULT_IMAGE]);

  // 🔥 ২. গুগল নিউজ স্কিমা (Structured Data) 🔥
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://bakalia.xyz/news/${id}`
    },
    headline: article.title,
    description: article.content ? article.content.substring(0, 160) + "..." : "",
    image: imageList,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.authorName || 'News Desk',
      url: 'https://bakalia.xyz'
    },
    // Publisher Data (AdSense এর জন্য জরুরি)
    publisher: {
      '@type': 'Organization',
      name: 'Bangladesh News',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bakalia.xyz/logo.png' // লোগো না থাকলে ডিফল্ট দেখাবে
      }
    }
  };

  // সাইডবার লজিক
  let relatedNews = [];
  try {
    const q = query(collection(db, "articles"), where("category", "==", article.category), where("status", "==", "published"), limit(6));
    const snap = await getDocs(q);
    relatedNews = snap.docs.map(d => ({id: d.id, ...d.data()})).filter(n => n.id !== id);
  } catch (e) {}

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-red-600 mb-6 transition font-medium text-sm">
          <ArrowLeft size={16} className="mr-2" /> প্রচ্ছদ
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* বাম পাশ: মূল খবর */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-4 text-sm">
                 <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-xs">{article.category || "খবর"}</span>
                 <span className="flex items-center text-slate-400 gap-1"><Clock size={14} /> {new Date(article.publishedAt).toLocaleString('bn-BD')}</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">{article.title}</h1>
              <NewsSlider images={imageList} title={article.title} />
              <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-justify text-base md:text-lg">
                {article.content.split('\n').map((para, index) => (<p key={index} className="mb-4">{para}</p>))}
              </div>
              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><User size={20} /></div>
                    <div><p className="text-xs text-slate-400 font-bold uppercase">প্রতিবেদক</p><p className="text-sm font-bold text-slate-800">{article.authorName || 'ডেস্ক রিপোর্ট'}</p></div>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition shadow-md"><Share2 size={18} /> শেয়ার করুন</button>
              </div>
            </article>
          </div>

          {/* ডান পাশ: সম্পর্কিত খবর */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
              <h3 className="font-bold text-lg border-b pb-2 mb-4 flex items-center gap-2 text-slate-800"><TrendingUp size={20} className="text-red-600"/> আরো পড়ুন</h3>
              <div className="flex flex-col gap-5">
                {relatedNews.length > 0 ? relatedNews.map(item => (
                  <Link href={`/news/${item.id}`} key={item.id} className="group flex gap-3 items-start">
                    <div className="w-24 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                      <img src={item.imageUrl || (item.imageUrls && item.imageUrls[0]) || "https://via.placeholder.com/150"} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800 group-hover:text-red-600 leading-snug line-clamp-3">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{new Date(item.publishedAt).toLocaleDateString('bn-BD')}</p>
                    </div>
                  </Link>
                )) : <p className="text-sm text-slate-400">খবর পাওয়া যায়নি।</p>}
              </div>
              <div className="mt-8 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center">
                <span className="text-xs text-slate-400 uppercase tracking-widest">Advertisement</span>
                <div className="h-40 bg-slate-200 mt-2 rounded flex items-center justify-center text-slate-400 text-sm">Google Ad Space</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}