"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, User, TrendingUp, Copy, Share2 } from 'lucide-react';
import NewsSlider from '../../components/NewsSlider'; // Corrected path
import { parseNewsContent } from '../../lib/utils';

export default function ArticleContent({ article, relatedNews }) {
    // Functions for interaction
    const handleShare = () => {
        const url = window.location.href;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("লিংক কপি হয়েছে!"); // Link copied!
    };

    const imageList = article.imageUrls && article.imageUrls.length > 0
        ? article.imageUrls
        : (article.imageUrl ? [article.imageUrl] : []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <main className="max-w-6xl mx-auto px-4 py-8">

                <Link href="/" className="inline-flex items-center text-slate-500 hover:text-red-600 mb-6 transition font-medium text-sm">
                    <ArrowLeft size={16} className="mr-2" /> প্রচ্ছদ
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2">
                        <article className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4 mb-4 text-sm">
                                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-xs">
                                    {article.category || "খবর"}
                                </span>
                                <span className="flex items-center text-slate-400 gap-1" suppressHydrationWarning>
                                    <Clock size={14} />
                                    {new Date(article.publishedAt).toLocaleString('bn-BD')}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                                {article.title}
                            </h1>

                            <NewsSlider images={imageList} title={article.title} />

                            <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-justify text-base md:text-lg">
                                {(() => {
                                    let contentToDisplay = article.content;
                                    // Improved robust parsing using shared utility
                                    if (article.content) {
                                        contentToDisplay = parseNewsContent(article.content);
                                    }

                                    return contentToDisplay.split('\n').map((para, index) => (
                                        <p key={index} className="mb-4">{para}</p>
                                    ));
                                })()}
                            </div>

                            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">প্রতিবেদক</p>
                                        <p className="text-sm font-bold text-slate-800">
                                            {article.authorName || 'ডেস্ক রিপোর্ট'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={handleCopyLink} className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-lg transition font-medium">
                                        <Copy size={18} /> লিংক কপি
                                    </button>
                                    <button onClick={handleShare} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition shadow-md font-medium">
                                        <Share2 size={18} /> ফেসবুকে শেয়ার
                                    </button>
                                </div>
                            </div>
                        </article>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                            <h3 className="font-bold text-lg border-b pb-2 mb-4 flex items-center gap-2 text-slate-800">
                                <TrendingUp size={20} className="text-red-600" /> আরো পড়ুন
                            </h3>
                            <div className="flex flex-col gap-5">
                                {relatedNews.map(item => (
                                    <Link href={`/news/${item.id}`} key={item.id} className="group flex gap-3 items-start">
                                        <div className="w-24 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                                            <img
                                                src={item.imageUrl || (item.imageUrls && item.imageUrls[0]) || "https://via.placeholder.com/150"}
                                                alt={item.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-slate-800 group-hover:text-red-600 leading-snug line-clamp-3">
                                                {item.title}
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1">
                                                <span suppressHydrationWarning>
                                                    {new Date(article.publishedAt).toLocaleString('bn-BD')}
                                                </span>
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-8 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center">
                                <span className="text-xs text-slate-400 uppercase tracking-widest">Advertisement</span>
                                <div className="h-40 bg-slate-200 mt-2 rounded flex items-center justify-center text-slate-400 text-sm">Google Ad Space</div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
