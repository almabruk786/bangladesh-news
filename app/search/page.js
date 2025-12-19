"use client";
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search } from 'lucide-react';
import { parseNewsContent, stripHtml } from '../lib/utils';
import Image from 'next/image';

function SearchResults() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q');
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!q) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Firestore doesn't support full-text search natively.
                // We will fetch recent articles and filter client-side for this MVP.
                // For production with massive data, Algolia or Typesense is recommended.

                const newsRef = collection(db, "articles");
                const qRef = query(newsRef, orderBy("publishedAt", "desc"), limit(200)); // Fetch last 200 items to search within
                const querySnapshot = await getDocs(qRef);

                const lowerQ = q.toLowerCase().trim();

                const results = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(item => {
                        const titleMatch = item.title?.toLowerCase().includes(lowerQ);
                        const bodyMatch = item.content?.toLowerCase().includes(lowerQ);
                        const catMatch = item.category?.toLowerCase().includes(lowerQ);
                        return titleMatch || bodyMatch || catMatch;
                    });

                setNews(results);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [q]);

    if (!q) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400">
                <Search size={48} className="mb-4 opacity-50" />
                <h2 className="text-xl font-bold">Search for any news...</h2>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 border-b pb-4 flex items-center gap-2">
                <Search className="text-red-600" />
                Search Results for "<span className="text-red-600">{q}</span>"
            </h1>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                </div>
            ) : news.length > 0 ? (
                <div className="grid gap-6">
                    {news.map((item) => (
                        <Link href={`/news/${item.id}`} key={item.id} className="block group bg-white dark:bg-slate-900 dark:border-slate-800 border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-48 h-32 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                    <img
                                        src={item.imageUrl || item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=300'}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-red-600 mb-2 leading-tight">
                                        {item.title}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                        {(() => {
                                            const plain = stripHtml(parseNewsContent(item.content));
                                            return plain.substring(0, 150) + "...";
                                        })()}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                        <span className="bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-1 rounded text-slate-600 uppercase">{item.category}</span>
                                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400">No results found for "{q}". Try a different keyword.</p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <SearchResults />
        </Suspense>
    );
}
