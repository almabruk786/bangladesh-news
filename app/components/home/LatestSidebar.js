import Link from "next/link";
import { Clock } from "lucide-react";

export default function LatestSidebar({ news }) {
    if (!news || news.length === 0) return null;

    return (
        <div className="border-l border-slate-100 pl-6 h-full">
            <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Most Read</h3>
            </div>

            <div className="space-y-6">
                {news.map((item) => (
                    <Link key={item.id} href={`/news/${item.id}`} className="group block border-b border-slate-50 pb-4 last:border-0">
                        <span className="text-red-600 text-[10px] font-bold uppercase tracking-wider mb-1 block">
                            {item.category || "General"}
                        </span>
                        <h4 className="font-bold text-base text-slate-900 leading-snug group-hover:text-red-600 transition-colors mb-2">
                            {item.title}
                        </h4>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={12} /> {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </Link>
                ))}
            </div>

            <div className="mt-8 bg-slate-50 p-6 rounded-xl text-center">
                <h4 className="font-bold text-slate-800 mb-2">Subscribe to Newsletter</h4>
                <p className="text-xs text-slate-500 mb-4">Get the latest updates directly in your inbox.</p>
                <input placeholder="Email address" className="w-full p-2 text-sm border rounded mb-2" />
                <button className="w-full bg-slate-900 text-white text-sm font-bold py-2 rounded">Subscribe</button>
            </div>
        </div>
    );
}
