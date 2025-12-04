// ... আগের ইম্পোর্ট সব ঠিক থাকবে ...
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Header from '../../components/Header'; 
import { ArrowLeft, Share2, Clock, User, PenTool } from 'lucide-react'; // PenTool যোগ করুন
import Link from 'next/link';

export async function generateMetadata({ params }) {
  // ... আগের কোড ...
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const article = docSnap.data();
    return {
      title: article.title,
      description: article.content.substring(0, 160),
      openGraph: {
        images: [article.imageUrl || ''],
        authors: [article.authorName || 'Admin'], // মেটাডাটা আপডেট
      },
    };
  }
  return { title: "News Not Found" };
}

export default async function NewsDetails({ params }) {
  // ... আগের কোড ...
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return <div>Not Found</div>;
  const article = docSnap.data();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ... হেডার ও টাইটেল ... */}
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-red-600 mb-6">
          <ArrowLeft size={16} className="mr-2" /> প্রচ্ছদ
        </Link>

        <article className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6 text-sm">
             <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full uppercase text-xs">
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
            <img src={article.imageUrl || "https://via.placeholder.com/800"} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed">
            {article.content.split('\n').map((para, index) => (
              <p key={index} className="mb-4 text-lg">{para}</p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* 🔥 লেখকের নাম দেখানো হচ্ছে 🔥 */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                    <User size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">প্রতিবেদক</p>
                    <p className="text-sm font-bold text-slate-800">
                        {article.authorName || 'ডেস্ক রিপোর্ট'}
                    </p>
                </div>
            </div>
            
            <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg">
              <Share2 size={18} /> শেয়ার
            </button>
          </div>
        </article>
      </main>
    </div>
  );
}