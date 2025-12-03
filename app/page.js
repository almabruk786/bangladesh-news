"use client";
import { useEffect, useState } from 'react';
import { db } from './lib/firebase'; 
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
// আপডেট: 'Clock' আইকনটি এখানে যোগ করা হয়েছে
import { Loader2, Calendar, Newspaper, ArrowRight, Share2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        // প্রথম ২০টি খবর আনছি
        const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(20));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNews(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-red-600" size={40}/></div>;
  }

  // খবরগুলো ভাগ করে নিচ্ছি (১ম টি প্রধান, পরের ৪টি সাইডবার, বাকিগুলো গ্রিড)
  const heroNews = news[0];
  const sideNews = news.slice(1, 5);
  const gridNews = news.slice(5);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* 🔥 ব্রেকিং নিউজ টিকার 🔥 */}
        <div className="mb-8 flex items-center bg-white border-l-4 border-red-600 shadow-sm rounded-r-lg overflow-hidden">
          <div className="bg-red-600 text-white px-4 py-2 text-sm font-bold animate-pulse">ব্রেকিং</div>
          <marquee className="text-slate-700 text-sm font-medium py-2" behavior="scroll" direction="left">
            {news.map(n => `🔴 ${n.title}   `).join("   ")}
          </marquee>
        </div>

        {/* 📰 হিরো সেকশন (Top Section) */}
        {heroNews && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* বাম পাশে বড় খবর (Hero) */}
            <div className="lg:col-span-2 group cursor-pointer">
              <Link href={`/news/${heroNews.id}`}>
                <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"/>
                  {/* ইমেজ প্লেসহোল্ডার (বাস্তবে ইমেজ থাকলে src বসবে) */}
                  <div className="w-full h-full bg-slate-300 group-hover:scale-105 transition-transform duration-700"></div>
                  
                  <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">
                      {heroNews.category || "Lead News"}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2 hover:underline">
                      {heroNews.title}
                    </h1>
                    <p className="text-slate-200 line-clamp-2 text-sm md:text-base">
                      {heroNews.content ? heroNews.content.substring(0, 150) : ""}...
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* ডান পাশে ছোট খবরের লিস্ট (Side List) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center">
                <TrendingUp size={20} className="mr-2 text-red-600" /> শীর্ষ সংবাদ
              </h3>
              <div className="space-y-5">
                {sideNews.map((item) => (
                  <Link href={`/news/${item.id}`} key={item.id} className="flex gap-3 group">
                    <div className="h-20 w-24 bg-slate-200 rounded-lg shrink-0 overflow-hidden">
                       {/* থাম্বনেইল */}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-red-600 line-clamp-2 transition">
                        {item.title}
                      </h4>
                      <span className="text-xs text-slate-400 mt-1 flex items-center">
                        <Clock size={10} className="mr-1"/> 
                        {new Date(item.publishedAt).toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-center text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                আরও পড়ুন
              </button>
            </div>
          </div>
        )}

        {/* 🗞️ লেটেস্ট নিউজ গ্রিড (AdSense এর জন্য সেরা জায়গা) */}
        <h2 className="text-2xl font-bold text-slate-800 mb-6 border-l-4 border-slate-800 pl-3">
          সর্বশেষ খবর
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridNews.map((item) => (
            <Link href={`/news/${item.id}`} key={item.id} className="group h-full">
              <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className="h-48 bg-slate-200 w-full relative overflow-hidden">
                   <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-slate-800">
                     {item.source ? item.source.split(' ')[0] : 'Desk'}
                   </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wider">
                    {item.category || "News"}
                  </span>
                  <h2 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-red-600 leading-snug line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                    {item.content ? item.content.substring(0, 100) : ""}...
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-4 border-t border-slate-50">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(item.publishedAt).toLocaleDateString('bn-BD')}
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}

function TrendingUp({size, className}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
    )
}