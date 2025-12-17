"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from './lib/firebase';
import { collection, getDocs, orderBy, query, limit, where, doc, getDoc } from 'firebase/firestore';
import { Loader2, X } from 'lucide-react';

// Modern Components
import BreakingTicker from './components/home/BreakingTicker';
import HeroSection from './components/home/HeroSection';
import CategoryBlock from './components/home/CategoryBlock';
import LatestSidebar from './components/home/LatestSidebar';
import { generateItemListSchema } from './lib/schemas';

export default function Home() {
  const [data, setData] = useState({
    heroNews: null,
    latestNews: [],
    realLatestNews: [],
    politicsNews: [],
    sportsNews: [],
    allNews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const articlesRef = collection(db, "articles");

        // 1. Fetch Latest & Pinned for Hero
        const qLatest = query(articlesRef, where("status", "==", "published"), orderBy("publishedAt", "desc"), limit(50));
        const snapLatest = await getDocs(qLatest);
        const allDocs = snapLatest.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Categorize Data
        // Slider: Show Pinned (Breaking) First, else recent
        const pinned = allDocs.filter(n => n.isPinned);
        const hero = pinned.length > 0 ? pinned[0] : allDocs[0];
        const sliderNews = pinned.length > 0 ? pinned.slice(0, 5) : allDocs.slice(0, 5);

        // Sidebar: Most Read (Sort by Views)
        const mostRead = [...allDocs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);

        const others = allDocs.filter(n => n.id !== hero?.id);

        setData({
          heroNews: hero,
          latestNews: mostRead, // Keep key for Sidebar (which expects Most Read)
          realLatestNews: allDocs.filter(n => n.id !== hero?.id).slice(0, 10), // True Latest for Hero Side
          politicsNews: others.filter(n => n.category === "Politics" || n.category === "রাজনীতি").slice(0, 5),
          sportsNews: others.filter(n => n.category === "Sports" || n.category === "খেলাধুলা").slice(0, 5),
          allNews: others,
        });

      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchNews();
  }, []);

  if (loading) return (
    <div className="flex flex-col h-screen justify-center items-center bg-white">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-slate-400">NEWS</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateItemListSchema(data.realLatestNews)) }}
      />
      <AdPopup />

      {/* 1. Breaking Ticker */}
      <BreakingTicker news={data.realLatestNews.slice(0, 5)} />

      <main className="container-custom py-8">
        {/* 2. Hero Section */}
        <HeroSection heroNews={data.heroNews} sideNews={data.realLatestNews.slice(0, 4)} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {/* 3. Category Blocks */}
            <CategoryBlock title="Politics" news={data.politicsNews} color="border-red-600" />
            <CategoryBlock title="Sports" news={data.sportsNews} color="border-green-600" />

            {/* 4. More News Grid */}
            <div className="mt-12">
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6 border-l-4 border-slate-900 pl-4">
                More Top Stories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.allNews.slice(10, 19).map(item => (
                  <Link href={`/news/${item.id}`} key={item.id} className="group block">
                    <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-3 relative">
                      <Image
                        src={item.imageUrl || item.imageUrls?.[0] || '/placeholder.png'}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                    <h3 className="font-bold leading-tight group-hover:text-red-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{new Date(item.publishedAt).toLocaleDateString()}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <LatestSidebar news={data.latestNews} />
            {/* Sticky Ad Placeholder */}
            <div className="sticky top-24 mt-8 bg-slate-50 h-[600px] flex items-center justify-center text-slate-300 font-bold border border-dashed border-slate-200 rounded-xl">
              AD SPACE
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Optimized AdPopup (Moved here for co-location, or could be separate)
function AdPopup() {
  const [ad, setAd] = useState(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      getDoc(doc(db, "ads", "popup")).then(snap => {
        // Explicitly check for boolean true to avoid falsy string issues
        if (snap.exists() && snap.data().isActive === true) { setAd(snap.data()); setShow(true); }
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show || !ad) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={() => setShow(false)}>
      <div className="relative bg-white p-2 rounded-2xl shadow-2xl max-w-lg w-full scale-100 transition-transform" onClick={e => e.stopPropagation()}>
        <button onClick={() => setShow(false)} className="absolute -top-4 -right-4 bg-white text-slate-900 rounded-full p-2 shadow-lg hover:bg-slate-100 z-10">
          <X size={24} />
        </button>
        <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl">
          <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto max-h-[80vh] object-contain" />
        </a>
      </div>
    </div>
  );
}