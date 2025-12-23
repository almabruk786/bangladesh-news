"use client";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function BreakingTicker({ news }) {
    const recentNews = news || [];

    // Use a mounted check to ensure client/server consistency if needed, 
    // but simply checking the prop length should be deterministic if props are deterministic.
    if (recentNews.length === 0) return null;

    return (
        <div className="bg-slate-900 border-b border-slate-800 text-white relative z-30" suppressHydrationWarning>
            <div className="container-custom flex items-center h-10">
                <div className="bg-red-600 h-full flex items-center px-4 font-bold text-xs uppercase tracking-wider shrink-0 gap-2 relative z-10">
                    <Zap size={14} className="animate-pulse" /> Breaking
                </div>

                <div className="flex-1 overflow-hidden relative h-full flex items-center bg-slate-900">
                    <div className="absolute whitespace-nowrap animate-marquee flex gap-8 items-center text-sm font-medium text-slate-300">
                        {recentNews.map((item, idx) => (
                            <Link key={idx} href={`/news/${item.id}`} className="hover:text-white transition-colors flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                                {item.title}
                                <span className="text-slate-600 pl-4 border-r border-slate-700 h-3"></span>
                            </Link>
                        ))}
                        {/* Duplicate for infinite effect */}
                        {recentNews.map((item, idx) => (
                            <Link key={`dup-${idx}`} href={`/news/${item.id}`} className="hover:text-white transition-colors flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                                {item.title}
                                <span className="text-slate-600 pl-4 border-r border-slate-700 h-3"></span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>


        </div>
    );
}
