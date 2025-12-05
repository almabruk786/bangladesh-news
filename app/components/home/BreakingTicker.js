import Link from "next/link";
import { Zap } from "lucide-react";

export default function BreakingTicker({ news }) {
    if (!news || news.length === 0) return null;

    return (
        <div className="bg-slate-900 border-b border-slate-800 text-white sticky top-[72px] z-30">
            <div className="container-custom flex items-center h-10">
                <div className="bg-red-600 h-full flex items-center px-4 font-bold text-xs uppercase tracking-wider shrink-0 gap-2 relative z-10">
                    <Zap size={14} className="animate-pulse" /> Breaking
                </div>

                <div className="flex-1 overflow-hidden relative h-full flex items-center bg-slate-900">
                    <div className="absolute whitespace-nowrap animate-marquee flex gap-8 items-center text-sm font-medium text-slate-300">
                        {news.map((item, idx) => (
                            <Link key={idx} href={`/news/${item.id}`} className="hover:text-white transition-colors flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                                {item.title}
                                <span className="text-slate-600 pl-4 border-r border-slate-700 h-3"></span>
                            </Link>
                        ))}
                        {/* Duplicate for infinite effect */}
                        {news.map((item, idx) => (
                            <Link key={`dup-${idx}`} href={`/news/${item.id}`} className="hover:text-white transition-colors flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                                {item.title}
                                <span className="text-slate-600 pl-4 border-r border-slate-700 h-3"></span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Marquee Animation CSS added via style jsx or globals normally, ensuring inline here for portability */}
            <style jsx>{`
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
}
