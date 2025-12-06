import Link from "next/link";
import { Clock, PlayCircle } from "lucide-react";
import { parseNewsContent } from "../../lib/utils";

export default function HeroSection({ heroNews, sideNews }) {
    if (!heroNews) return null;

    return (
        <section className="py-8 border-b border-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Main Hero Story */}
                <div className="lg:col-span-8 group">
                    <Link href={`/news/${heroNews.id}`} className="block">
                        <div className="flex flex-col">
                            {/* Image */}
                            <div className="relative overflow-hidden rounded-xl aspect-[16/9] bg-slate-100 mb-5 shadow-sm">
                                <img
                                    src={heroNews.imageUrl || heroNews.imageUrls?.[0]}
                                    alt={heroNews.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                />
                                {heroNews.isVideo && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition">
                                        <PlayCircle size={64} className="text-white opacity-80" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-red-600 text-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-sm">Top Story</span>
                                    <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                                        <Clock size={14} /> {new Date(heroNews.publishedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-3 group-hover:text-red-700 transition-colors">
                                    {heroNews.title}
                                </h1>
                                <p className="text-slate-600 text-lg leading-relaxed line-clamp-3 md:w-5/6">
                                    {(() => {
                                        const content = parseNewsContent(heroNews.content);
                                        return content.substring(0, 180) + (content.length > 180 ? "..." : "");
                                    })()}
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Side Stories (Cleaner list) */}
                <div className="lg:col-span-4 flex flex-col">
                    <div className="flex items-center justify-between mb-5 border-b-2 border-slate-100 pb-2">
                        <h3 className="text-sm font-bold uppercase text-red-600 tracking-widest">Latest Updates</h3>
                        <Link href="/latest" className="text-xs font-bold text-slate-400 hover:text-red-600">View All</Link>
                    </div>

                    <div className="flex flex-col gap-5">
                        {sideNews.slice(0, 4).map((item) => (
                            <Link key={item.id} href={`/news/${item.id}`} className="group flex gap-4 items-start">
                                <div className="flex-1 space-y-1">
                                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <span className="text-xs text-slate-400 font-medium">
                                        {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="w-20 h-16 bg-slate-100 overflow-hidden rounded-md shrink-0 border border-slate-100 relative top-1">
                                    <img
                                        src={item.imageUrl || item.imageUrls?.[0]}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Advertisement Placeholder - Common in Prothom Alo Sidebar */}
                    <div className="mt-8 p-4 bg-slate-50 border border-dashed border-slate-200 rounded text-center text-xs text-slate-400">
                        Advertisement Space
                    </div>
                </div>
            </div>
        </section>
    );
}
