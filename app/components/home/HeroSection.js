import Link from "next/link";
import Image from "next/image";
import { Clock, PlayCircle } from "lucide-react";
import { parseNewsContent, stripHtml, getSmartExcerpt, getBanglaRelativeTime } from "../../lib/utils";

export default function HeroSection({ heroNews, sideNews }) {
    if (!heroNews) return null;

    return (
        <section className="py-4 md:py-6 border-b border-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

                {/* Main Hero Story */}
                <div className="lg:col-span-8 group relative">

                    {/* MOBILE LAYOUT: Immersive (TikTok/Insta Style) */}
                    <div className="md:hidden block">
                        <Link href={`/news/${heroNews.id}`} className="relative block w-full aspect-video rounded-2xl overflow-hidden shadow-lg active:scale-[0.98] transition-transform">
                            {/* Full Image */}
                            <Image
                                src={heroNews.imageUrl || heroNews.imageUrls?.[0] || '/placeholder.png'}
                                alt={heroNews.title}
                                fill
                                priority
                                sizes="100vw"
                                className="object-cover"
                            />

                            {/* Video Icon */}
                            {heroNews.isVideo && (
                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full p-2 text-white z-20">
                                    <PlayCircle size={24} />
                                </div>
                            )}

                            {/* Badge */}
                            <div className="absolute top-4 left-4 z-20">
                                <span className="bg-red-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">Top Story</span>
                            </div>

                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>

                            {/* Text Content Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                                    <Clock size={12} /> {getBanglaRelativeTime(heroNews.publishedAt)}
                                </div>
                                <h1 className="text-2xl font-black leading-tight text-white mb-1 shadow-black drop-shadow-md">
                                    {heroNews.title}
                                </h1>
                                <p className="text-slate-200 text-xs line-clamp-2 leading-relaxed opacity-90">
                                    {getSmartExcerpt(heroNews.content, 20)}
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* DESKTOP LAYOUT: Standard (Side by Side) */}
                    <div className="hidden md:flex flex-col gap-3 h-full">
                        {/* 1. Headline at Top */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm">Top Story</span>
                                <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                                    <Clock size={12} /> {new Date(heroNews.publishedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <Link href={`/news/${heroNews.id}`} className="hover:text-red-700 transition-colors">
                                <h1 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
                                    {heroNews.title}
                                </h1>
                            </Link>
                        </div>

                        {/* 2. Split: Image (Left) + Excerpt (Right) */}
                        <div className="grid md:grid-cols-12 gap-6 items-start">
                            <Link href={`/news/${heroNews.id}`} className="md:col-span-7 relative overflow-hidden rounded-xl aspect-video bg-slate-100 shadow-sm block">
                                <Image
                                    src={heroNews.imageUrl || heroNews.imageUrls?.[0] || '/placeholder.png'}
                                    alt={heroNews.title}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 100vw, 60vw"
                                    className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                />
                                {heroNews.isVideo && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition">
                                        <PlayCircle size={48} className="text-white opacity-80" />
                                    </div>
                                )}
                            </Link>

                            <div className="md:col-span-5 flex flex-col justify-between h-full py-1">
                                <p className="text-slate-600 text-sm leading-relaxed text-justify line-clamp-[8] select-text">
                                    {/* Smart Excerpt: Increased to 70 words to fill space */}
                                    {getSmartExcerpt(heroNews.content, 70)}
                                </p>
                                <div className="mt-3">
                                    <Link href={`/news/${heroNews.id}`} className="inline-block text-xs font-bold text-red-600 border-b-2 border-red-100 hover:border-red-600 transition-all">
                                        Read Full Story →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Stories (Ultra Compact) */}
                <div className="lg:col-span-4 flex flex-col pt-4 md:pt-0">
                    <div className="flex items-center justify-between mb-3 border-b-2 border-slate-100 pb-2">
                        <h3 className="text-xs font-bold uppercase text-red-600 tracking-widest">Latest Updates</h3>
                        <Link href="/latest" className="text-[10px] font-bold text-slate-400 hover:text-red-600">View All</Link>
                    </div>

                    <div className="flex flex-col gap-4 md:gap-3">
                        {sideNews.slice(0, 5).map((item) => (
                            <Link key={item.id} href={`/news/${item.id}`} className="group flex gap-3 items-start active:scale-[0.99] transition-transform">
                                <div className="w-24 md:w-16 h-16 md:h-12 bg-slate-100 overflow-hidden rounded-lg md:rounded shrink-0 border border-slate-100 relative">
                                    <Image
                                        src={item.imageUrl || item.imageUrls?.[0] || '/placeholder.png'}
                                        alt={item.title}
                                        fill
                                        sizes="64px"
                                        className="object-cover group-hover:scale-105 transition duration-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                                        {getBanglaRelativeTime(item.publishedAt)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Advertisement Placeholder */}
                    <div className="mt-4 p-2 bg-slate-50 border border-dashed border-slate-200 rounded text-center text-[10px] text-slate-400">
                        Advertisement Space
                    </div>
                </div>
            </div>
        </section>
    );
}
