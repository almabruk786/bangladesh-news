import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
// components ফোল্ডার app এর ভেতরে, তাই ২ ঘর পেছনে (../../)
import Header from '../../components/Header'; 
import { ArrowLeft, Share2, Clock } from 'lucide-react';
import Link from 'next/link';

// ১. ডাইনামিক মেটাডাটা (ফেসবুক/গুগল এর জন্য)
export async function generateMetadata({ params }) {
  // Next.js 15 এ params একটি Promise, তাই await করতে হবে
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const article = docSnap.data();
    return {
      title: article.title + " | Bangladesh News",
      description: article.content.substring(0, 160),
      openGraph: {
        title: article.title,
        description: article.content.substring(0, 160),
        siteName: 'Bangladesh News',
        type: 'article',
      },
    };
  }
  return { title: "News Not Found" };
}

// ২. মেইন পেজ কম্পোনেন্ট
export default async function NewsDetails({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // সার্ভার সাইডেই ডাটা আনা হচ্ছে (SEO এর জন্য এটি সেরা)
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return <div className="text-center py-20 font-bold text-xl">খবরটি পাওয়া যায়নি!</div>;
  }

  const article = docSnap.data();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* ব্রেডকাম্ব / ব্যাক বাটন */}
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-red-600 mb-6 transition font-medium text-sm">
          <ArrowLeft size={16} className="mr-2" /> প্রচ্ছদ
        </Link>

        <article className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100">
          
          {/* ক্যাটাগরি ও তারিখ */}
          <div className="flex items-center gap-4 mb-6 text-sm">
             <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-xs">
               {article.category || "বাংলাদেশ"}
             </span>
             <span className="flex items-center text-slate-400 gap-1">
               <Clock size={14} /> 
               {new Date(article.publishedAt).toLocaleString('bn-BD')}
             </span>
          </div>

          {/* শিরোনাম */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-8 leading-tight">
            {article.title}
          </h1>

          {/* ফিচার ইমেজ (যদি থাকে) */}
          <div className="w-full h-[300px] md:h-[450px] bg-slate-200 rounded-xl mb-10 flex items-center justify-center text-slate-400 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-50" />
            <span className="relative z-10 font-medium">খবরের ছবি (শীঘ্রই আসছে)</span>
          </div>

          {/* মূল খবর */}
          <div className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed">
            {/* প্যারাগ্রাফ আকারে টেক্সট দেখানোর জন্য */}
            {article.content.split('\n').map((para, index) => (
              <p key={index} className="mb-4 text-lg">{para}</p>
            ))}
          </div>

          {/* ফুটার এরিয়া */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 font-medium bg-slate-50 px-4 py-2 rounded-lg">
              সংবাদ সূত্র: <span className="text-slate-800">{article.source}</span>
            </p>
            
            {/* শেয়ার বাটন (ভবিষ্যতে ফাংশনাল করা হবে) */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition font-medium shadow-md shadow-blue-200">
                <Share2 size={18} /> ফেসবুকে শেয়ার
              </button>
            </div>
          </div>

        </article>
      </main>
    </div>
  );
}