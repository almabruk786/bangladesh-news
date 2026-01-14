import Link from 'next/link';
import Image from 'next/image';
import { getNews } from './lib/firebaseServer';
import { getBanglaRelativeTime, getSmartExcerpt } from './lib/utils';
import { generateItemListSchema } from './lib/schemas';

// Modern Components
import BreakingTicker from './components/home/BreakingTicker';
import HeroSection from './components/home/HeroSection';
import CategoryBlock from './components/home/CategoryBlock';
import LatestSidebar from './components/home/LatestSidebar';
import AdPopup from './components/AdPopup';

// Force revalidation every 5 minutes (300 seconds)
export const revalidate = 300;

export const metadata = {
  alternates: {
    canonical: '/',
  },
};


export default async function Home() {
  // 1. Fetch Data on Server
  const rawDocs = await getNews();

  // OPTIMIZATION: Stripping content is now done in getNews(), but we ensure excerpt exists here
  const allDocs = rawDocs.map(item => ({
    ...item,
    excerpt: item.excerpt || getSmartExcerpt(item.content, 60),
    content: undefined,
  }));

  // 2. Logic for Categorization (Moved from Client to Server)
  const pinned = allDocs.filter(n => n.isPinned);
  const heroNews = pinned.length > 0 ? pinned[0] : allDocs[0];

  // Sidebar: Most Read (Sort by Views) - Create a copy to sort
  // Note: views might be undefined, handle gracefully
  const latestNews = [...allDocs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);

  const realLatestNews = allDocs.filter(n => n.id !== heroNews?.id).slice(0, 10);

  const others = allDocs.filter(n => n.id !== heroNews?.id);
  const politicsNews = others.filter(n => ["Politics", "রাজনীতি"].includes(n.category)).slice(0, 5);
  const sportsNews = others.filter(n => ["Sports", "খেলা", "খেলাধুলা"].includes(n.category)).slice(0, 7);
  const allNews = others;


  return (
    <>

      <div className="min-h-screen" suppressHydrationWarning>
        <AdPopup />

        {/* 1. Breaking Ticker */}
        <BreakingTicker news={realLatestNews.slice(0, 5)} />

        <main className="container-custom py-8">
          {/* 2. Hero Section */}
          <HeroSection heroNews={heroNews} sideNews={realLatestNews.slice(0, 4)} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content Area */}
            <div className="lg:col-span-9">
              {/* 3. Category Blocks */}
              <CategoryBlock title="Politics" news={politicsNews} color="border-red-600" />
              <CategoryBlock title="Sports" news={sportsNews} color="border-green-600" />

              {/* 4. More News Grid */}
              <div className="mt-12">
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6 border-l-4 border-slate-900 pl-4">
                  More Top Stories
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allNews.slice(10, 19).map(item => (
                    <Link href={`/news/${item.id}`} key={item.id} className="group block">
                      <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-3 relative">
                        <Image
                          src={item.imageUrl || (item.imageUrls && item.imageUrls[0]) || '/placeholder.png'}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                      <h3 className="font-bold leading-tight group-hover:text-red-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{getBanglaRelativeTime(item.publishedAt)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-3">
              <LatestSidebar news={latestNews} />
              {/* Sticky Ad Placeholder */}
              <div className="sticky top-24 mt-8">
                {/* Auto Ads will fill here if needed */}
              </div>
            </div>
          </div>
        </main>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateItemListSchema(realLatestNews)) }}
          suppressHydrationWarning
        />
      </div>
    </>
  );
}