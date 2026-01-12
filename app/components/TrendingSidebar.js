"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Eye } from 'lucide-react';
import { getBanglaRelativeTime } from '../lib/utils';

export default function TrendingSidebar() {
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch('/api/trending');
                const data = await res.json();
                if (data.success) {
                    setTrending(data.trending);
                }
            } catch (error) {
                console.error('Error fetching trending:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    if (trending.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                <TrendingUp className="text-red-600" size={20} />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                    আজকের জনপ্রিয়
                </h3>
            </div>

            <div className="space-y-4">
                {trending.map((article, index) => (
                    <Link
                        key={article.id}
                        href={`/news/${article.id}`}
                        className="block group"
                    >
                        <div className="flex gap-3">
                            {/* Rank Number */}
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2 leading-snug mb-1">
                                    {article.title}
                                </h4>

                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Eye size={12} />
                                    <span>{article.views?.toLocaleString('bn-BD')} বার</span>
                                    <span>•</span>
                                    <span>{getBanglaRelativeTime(article.publishedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <Link
                href="/category/National"
                className="mt-4 block text-center text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition-colors"
            >
                আরও দেখুন →
            </Link>
        </div>
    );
}
