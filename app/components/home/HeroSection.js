import Link from "next/link";
import { Clock } from "lucide-react";

export default function HeroSection({ heroNews, sideNews }) {
    if (!heroNews) return null;

    return (
        <section className="mb-6 mt-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Hero Story - Compact Split Layout */}
                <div className="lg:col-span-8 group flex flex-col md:flex-row gap-6">
                    <Link href={`/news/${heroNews.id}`} className="contents">
                        {/* Image container - Fixed Height for compactness */}
                        <div className="relative overflow-hidden rounded-xl shadow-sm bg-slate-100 flex-1 h-[300px] md:h-[350px]">
                            <img
                                src={heroNews.imageUrl || heroNews.imageUrls?.[0]}
                                alt={heroNews.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                            />
                            <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded shadow-md">
                                Top Story
                            </span>
                        </div>

                        {/* Text Content - Right side or Bottom */}
                        <div className="flex-1 space-y-2 flex flex-col justify-center">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight group-hover:text-red-600 transition-colors">
                                {heroNews.title}
                            </h1>
                            <p className="text-slate-600 text-sm line-clamp-3 md:w-11/12">
                                {heroNews.content ? heroNews.content.substring(0, 150) : ""}...
                            </p>
                            <div className="flex items-center gap-3 text-slate-500 text-xs font-medium pt-2">
                                <span className="flex items-center gap-1"><Clock size={14} className="text-red-500" /> {new Date(heroNews.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="uppercase tracking-widest font-bold">{heroNews.authorName || "Editor Desk"}</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Side Stories - More Compact */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1 mb-1">
                        <h3 className="text-xs font-bold uppercase text-red-600 tracking-widest">Latest Updates</h3>
                    </div>
                    {sideNews.slice(0, 4).map((item, idx) => (
                        <Link key={item.id} href={`/news/${item.id}`} className="group flex gap-3 items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                            <div className="w-24 h-16 bg-slate-100 overflow-hidden rounded shrink-0">
                                <img
                                    src={item.imageUrl || item.imageUrls?.[0]}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                                    <Clock size={10} /> {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
