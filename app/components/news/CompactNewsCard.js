import Link from "next/link";
import { getBanglaRelativeTime } from "../../lib/utils";

export default function CompactNewsCard({ news, showImage = false }) {
    if (!news) return null;

    return (
        <Link href={`/news/${news.id}`} className="group block py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="flex gap-3 items-start">
                {showImage && news.imageUrl && (
                    <div className="w-16 h-12 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden shrink-0 relative">
                        <img src={news.imageUrl} alt={news.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold leading-snug group-hover:text-red-600 transition-colors line-clamp-2 mb-1 font-serif">
                        {news.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium block">
                        {getBanglaRelativeTime(news.publishedAt)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
