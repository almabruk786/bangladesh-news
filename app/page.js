"use client";
import { useEffect, useState } from 'react';
import { db } from './lib/firebase'; 
import { collection, getDocs, orderBy, query, limit, where, doc, getDoc } from 'firebase/firestore';
import { Loader2, Calendar, TrendingUp, X, Pin } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from './context/ThemeContext'; // ভাষা আনার জন্য

export default function Home() {
  const { t } = useTheme(); // ভাষা ভেরিয়েবল
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const pinnedQuery = query(collection(db, "articles"), where("status", "==", "published"), where("isPinned", "==", true), limit(5));
        const pinnedSnap = await getDocs(pinnedQuery);
        const pinnedNews = pinnedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const latestQuery = query(collection(db, "articles"), where("status", "==", "published"), orderBy("publishedAt", "desc"), limit(30));
        const latestSnap = await getDocs(latestQuery);
        let latestNews = latestSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const pinnedIds = new Set(pinnedNews.map(n => n.id));
        setNews([...pinnedNews, ...latestNews.filter(n => !pinnedIds.has(n.id))]);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchNews();
  }, []);

  if (loading) return <div className="flex h-screen justify-center items-center"><Loader2 className="animate-spin text-red-600"/></div>;

  const heroNews = news[0];
  const leftNews = news.slice(1, 6);
  const rightNews = news.slice(6, 12);
  const bottomGrid = news.slice(12);

  return (
    // dark:bg-slate-900 যোগ করা হয়েছে
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white transition-colors duration-300">
      <AdPopup />

      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* ব্রেকিং নিউজ */}
        <div className="mb-8 flex items-center bg-white dark:bg-slate-800 border-l-4 border-red-600 shadow-sm rounded-r-lg overflow-hidden">
          <div className="bg-red-600 text-white px-4 py-2 text-sm font-bold animate-pulse">{t?.breaking || 'Breaking'}</div>
          <marquee className="text-slate-700 dark:text-slate-300 text-sm font-medium py-2" behavior="scroll" direction="left">
            {news.map(n => `🔴 ${n.title}   `).join("   ")}
          </marquee>
        </div>

        {/* টপ সেকশন */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 border-b border-slate-200 dark:border-slate-700 pb-8 mb-8">
          
          <div className="lg:col-span-1 space-y-4 border-r border-slate-200 dark:border-slate-700 pr-4">
            <h3 className="font-bold text-red-600 uppercase text-sm border-b border-red-600 pb-1 mb-3">{t?.latest || 'Latest'}</h3>
            {leftNews.map(item => (
              <Link href={`/news/${item.id}`} key={item.id} className="block group border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-200 group-hover:text-red-600 leading-snug mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400">{new Date(item.publishedAt).toLocaleTimeString('bn-BD', {hour:'2-digit', minute:'2-digit'})}</p>
              </Link>
            ))}
          </div>

          <div className="lg:col-span-2 px-2">
            {heroNews && (
              <Link href={`/news/${heroNews.id}`} className="group block">
                <div className="relative overflow-hidden mb-4 rounded-lg shadow-sm">
                  <img src={heroNews.imageUrl || heroNews.imageUrls?.[0]} alt={heroNews.title} className="w-full h-auto object-cover group-hover:scale-105 transition duration-500" />
                  {heroNews.isPinned && <div className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full"><Pin size={16} fill="white" /></div>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3 text-slate-900 dark:text-white group-hover:text-red-600">{heroNews.title}</h1>
                <p className="text-base text-slate-600 dark:text-slate-400 line-clamp-3">{heroNews.content?.substring(0, 200)}...</p>
              </Link>
            )}
          </div>

          <div className="lg:col-span-1 border-l border-slate-200 dark:border-slate-700 pl-4 space-y-6">
             <h3 className="font-bold text-blue-600 uppercase text-sm border-b border-blue-600 pb-1 mb-3">{t?.popular || 'Popular'}</h3>
             {rightNews.map(item => (
               <Link href={`/news/${item.id}`} key={item.id} className="flex gap-3 group">
                 <div className="w-20 h-16 bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden rounded">
                   <img src={item.imageUrl || item.imageUrls?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition"/>
                 </div>
                 <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200 leading-snug group-hover:text-blue-600 line-clamp-3">{item.title}</h4>
               </Link>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {bottomGrid.map(item => (
            <Link href={`/news/${item.id}`} key={item.id} className="group h-full flex flex-col">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2 rounded">
                <img src={item.imageUrl || item.imageUrls?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition"/>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug group-hover:text-red-600 line-clamp-2">{item.title}</h3>
              <div className="mt-auto pt-2 text-xs text-slate-400"><Calendar size={12} className="inline mr-1"/>{new Date(item.publishedAt).toLocaleDateString('bn-BD')}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

function AdPopup() {
  const [ad, setAd] = useState(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      getDoc(doc(db, "ads", "popup")).then(snap => { if(snap.exists() && snap.data().isActive) { setAd(snap.data()); setShow(true); } });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  if (!show || !ad) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShow(false)}>
      <div className="relative bg-white dark:bg-slate-800 p-2 rounded-xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <button onClick={() => setShow(false)} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1.5"><X size={20} /></button>
        <a href={ad.link} target="_blank" rel="noopener noreferrer"><img src={ad.imageUrl} className="w-full h-auto max-h-[80vh] object-contain rounded" /></a>
        <p className="text-center text-[10px] text-slate-400 mt-2">ADVERTISEMENT</p>
      </div>
    </div>
  );
}