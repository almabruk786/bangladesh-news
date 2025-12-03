"use client";
import { useEffect, useState, use } from 'react'; // 'use' ইম্পোর্ট করা হলো
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Header from '../../components/Header';
import Link from 'next/link';
import { ArrowLeft, Share2, Clock } from 'lucide-react';

export default function NewsDetails({ params }) {
  // ১. Next.js 15 এর নিয়ম অনুযায়ী params আনব্রেপ (unwrap) করা হচ্ছে
  // আগে ছিল: const articleId = params.id;
  const { id } = use(params); 

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSingleNews() {
      if (!id) return; // 'id' ব্যবহার করছি
      try {
        const docRef = doc(db, "articles", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setArticle(docSnap.data());
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSingleNews();
  }, [id]);

  if (loading) return <div className="text-center py-20">লোড হচ্ছে...</div>;
  if (!article) return <div className="text-center py-20">খবরটি পাওয়া যায়নি!</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-red-600 mb-6 transition">
          <ArrowLeft size={16} className="mr-2" /> সব খবর
        </Link>

        <article className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
             <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
               {article.category || "বাংলাদেশ"}
             </span>
             <span className="flex items-center text-slate-400 text-xs gap-1">
               <Clock size={14} /> 
               {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('bn-BD') : ''}
             </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="w-full h-64 bg-slate-200 rounded-xl mb-8 flex items-center justify-center text-slate-400 overflow-hidden">
            {/* যদি ইমেজ থাকে দেখাবে, না থাকলে ডিফল্ট */}
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <span className="text-slate-400">খবরের ছবি</span>
            </div>
          </div>

          <div className="prose prose-lg text-slate-700 leading-relaxed whitespace-pre-line">
            {article.content}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
            <p className="text-sm text-slate-500">
              উৎস: <span className="font-semibold">{article.source}</span>
            </p>
            <button className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition">
              <Share2 size={18} /> শেয়ার করুন
            </button>
          </div>
        </article>
      </main>
    </div>
  );
}