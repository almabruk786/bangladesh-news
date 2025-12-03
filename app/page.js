"use client";
import { useEffect, useState } from 'react';
import { db } from './lib/firebase'; 
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import Header from '@/components/Header';
import { Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNews(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-600 flex items-center gap-3">
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">তাজা খবর</span>
          <marquee className="text-slate-700 text-sm">
            স্বাগতম! আমাদের AI নিউজ পোর্টালে প্রতি মুহূর্তে নতুন খবর আসছে...
          </marquee>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-red-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Link href={`/news/${item.id}`} key={item.id} className="group">
                <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="h-48 bg-slate-200 w-full relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                     <span className="absolute bottom-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded">
                       {item.category || "খবর"}
                     </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-red-600 leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                      {item.content ? item.content.substring(0, 150) : "বিস্তারিত পড়তে ক্লিক করুন..."}...
                    </p>
                    <div className="flex items-center text-xs text-slate-400 gap-2 mt-auto">
                      <Calendar size={14} />
                      <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('bn-BD') : ''}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}