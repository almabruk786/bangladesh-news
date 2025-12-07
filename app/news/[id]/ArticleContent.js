"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, User, TrendingUp, Copy, Share2 } from 'lucide-react';
import NewsSlider from '../../components/NewsSlider'; // Corrected path
import LiveBlogFeed from '../../components/LiveBlogFeed'; // Live Blog Component
import { parseNewsContent, stripHtml } from '../../lib/utils';

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

    // JSON-LD Schema
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "image": imageList,
        "datePublished": article.publishedAt,
        "dateModified": article.publishedAt,
        "author": [{
            "@type": "Person",
            "name": article.authorName || "Desk Report",
            "url": "https://bakalia.xyz/about"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "Bangladesh News",
            "logo": {
                "@type": "ImageObject",
                "url": "https://bakalia.xyz/icon.png"
            }
        },
        "description": stripHtml(parseNewsContent(article.content)).substring(0, 160)
    };

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://bakalia.xyz"
        }, {
            "@type": "ListItem",
            "position": 2,
            "name": article.category || "News",
            "item": `https://bakalia.xyz/category/${article.category}`
        }, {
            "@type": "ListItem",
            "position": 3,
            "name": article.title,
            "item": `https://bakalia.xyz/news/${article.id}`
        }]
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <main className="max-w-6xl mx-auto px-4 py-8">

                <nav className="flex items-center text-sm font-medium text-slate-500 mb-6 flex-wrap gap-2">
                    <Link href="/" className="hover:text-red-600 transition">Home</Link>
                    <span className="text-slate-300">/</span>
                    <Link href={`/category/${article.category}`} className="hover:text-red-600 transition">{article.category}</Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-800 line-clamp-1 max-w-[200px] md:max-w-md">{article.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2">
                        <article className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4 mb-4 text-sm">
                                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-xs">
                                    {article.category === "Auto-Imported" ? "General" : (article.category || "খবর")}
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

                            {/* Live Blog Feed Integration */}
                            {article.isLive && (
                                <div className="my-8">
                                    <LiveBlogFeed articleId={article.id} />
                                </div>
                            )}

                            <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-justify text-base md:text-lg">
                                {(() => {
                                    let contentToDisplay = article.content;
                                    const isShortContent = !article.content || article.content.length < 200 || article.content.includes("বিস্তারিত লিংকে");

                                    if (article.content) {
                                        contentToDisplay = parseNewsContent(article.content);
                                    }

                                    // HTML Rendering
                                    return (
                                        <>
                                            <div dangerouslySetInnerHTML={{ __html: contentToDisplay }} />

                                            {/* Fallback for Short/Broken Content */}
                                            {isShortContent && article.originalLink && (
                                                <div className="mt-6 p-6 bg-red-50 rounded-xl border border-red-100 text-center">
                                                    <p className="font-bold text-red-800 mb-3">বিস্তারিত জানতে মূল সংবাদের লিংকে ক্লিক করুন</p>
                                                    <a href={article.originalLink} target="_blank" rel="nofollow noopener" className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition">
                                                        মূল সংবাদ পড়ুন (Read Source)
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Tags Display */}
                            {article.tags && article.tags.length > 0 && (
                                <div className="mt-8 pt-4 border-t border-slate-100">
                                    <div className="flex flex-wrap gap-2">
                                        {article.tags.map((tag, idx) => (
                                            <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-slate-200 cursor-pointer transition-colors">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">প্রতিবেদক</p>
                                        <p className="text-sm font-bold text-slate-800">
                                            {article.authorName === 'Auto-Imported' ? 'Desk Report' : (article.authorName || 'ডেস্ক রিপোর্ট')}
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
                                        <div className="w-24 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0 relative">
                                            <img
                                                src={item.imageUrl || (item.imageUrls && item.imageUrls[0]) || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=200"}
                                                alt={item.title}
                                                loading="lazy"
                                                onError={(e) => e.target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=200"}
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
