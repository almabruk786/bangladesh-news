"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, User, TrendingUp, Copy, Share2 } from 'lucide-react';
import NewsSlider from '../../components/NewsSlider'; // Corrected path
import LiveBlogFeed from '../../components/LiveBlogFeed'; // Live Blog Component
import CommentSection from '../../components/comments/CommentSection'; // Comment Component
import { parseNewsContent, stripHtml } from '../../lib/utils';
import FollowButtons from '../../components/FollowButtons';

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
        "datePublished": article.publishedAt,
        "dateModified": article.updatedAt || article.publishedAt,
        "author": [{
            "@type": "Person",
            "name": article.authorName || "Desk Report",
            "url": "https://bakalia.xyz/about"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "Bakalia News",
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
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
                    <Link href={`/category/${article.category}`} className="hover:text-red-600 transition">{article.category === "Auto-Imported" ? "General" : article.category}</Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[200px] md:max-w-md">{article.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2">
                        <article className="bg-white dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100 transition-colors duration-300">
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 text-sm">
                                {(() => {
                                    const translateCategory = (cat) => {
                                        const map = {
                                            "National": "জাতীয়", "national": "জাতীয়", "NATIONAL": "জাতীয়",
                                            "International": "আন্তর্জাতিক", "international": "আন্তর্জাতিক", "INTERNATIONAL": "আন্তর্জাতিক",
                                            "Politics": "রাজনীতি", "politics": "রাজনীতি", "POLITICS": "রাজনীতি",
                                            "Sports": "খেলা", "sports": "খেলা", "SPORTS": "খেলা",
                                            "Health": "স্বাস্থ্য", "health": "স্বাস্থ্য", "HEALTH": "স্বাস্থ্য",
                                            "Technology": "প্রযুক্তি", "technology": "প্রযুক্তি", "TECHNOLOGY": "প্রযুক্তি",
                                            "Business": "বাণিজ্য", "business": "বাণিজ্য", "BUSINESS": "বাণিজ্য",
                                            "Entertainment": "বিনোদন", "entertainment": "বিনোদন", "ENTERTAINMENT": "বিনোদন",
                                            "Lifestyle": "জীবনযাপন", "lifestyle": "জীবনযাপন", "LIFESTYLE": "জীবনযাপন",
                                            "Education": "শিক্ষা", "education": "শিক্ষা", "EDUCATION": "শিক্ষা",
                                            "Opinion": "মতামত", "opinion": "মতামত", "OPINION": "মতামত",
                                            "Bangladesh": "বাংলাদেশ", "bangladesh": "বাংলাদেশ", "BANGLADESH": "বাংলাদেশ"
                                        };
                                        return map[cat] || (cat && map[cat.trim()]) || cat;
                                    };

                                    return article.categories && article.categories.length > 0 ? (
                                        [...new Set(article.categories.map(cat => translateCategory(cat)))].map((translatedCat, i) => (
                                            <Link key={i} href={`/category/${translatedCat}`}>
                                                <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-xs hover:bg-red-200 transition-colors">
                                                    {translatedCat}
                                                </span>
                                            </Link>
                                        ))
                                    ) : (
                                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-xs">
                                            {translateCategory(article.category === "Auto-Imported" ? "General" : (article.category || "খবর"))}
                                        </span>
                                    );
                                })()}
                                <span className="flex items-center text-slate-400 space-x-1" suppressHydrationWarning>
                                    <Clock size={14} />
                                    <time dateTime={article.publishedAt}>
                                        {new Date(article.publishedAt).toLocaleString('bn-BD')}
                                    </time>
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                                {article.title}
                            </h1>

                            <NewsSlider images={imageList} title={article.title} />

                            {/* --- High-Performance Manual Ad Unit (CLS Protected) - REMOVED for Auto Ads --- */}
                            {/* 
                               Manual ad unit removed as Auto Ads are enabled and the slot ID was missing.
                               To re-enable, add a valid slot ID or use the GoogleAd component.
                            */}
                            {/* ------------------------------------------------------- */}

                            {/* Main Image Caption */}
                            {article.imageCaption && (
                                <p className="text-sm text-slate-700 bg-slate-50 py-2 px-3 rounded-lg border border-slate-200 text-center mt-1.5 italic font-medium">
                                    {article.imageCaption}
                                </p>
                            )}

                            {/* Spacing after image section */}
                            <div className="mb-8"></div>

                            {/* Social Share Buttons */}
                            <div className="my-6">
                                <ShareButtons title={article.title} />
                            </div>

                            {/* Live Blog Feed Integration */}
                            {article.isLive && (
                                <div className="my-8">
                                    <LiveBlogFeed articleId={article.id} />
                                </div>
                            )}

                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-justify text-base md:text-lg">
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

                                            {/* Follow Buttons */}


                                            {/* Fallback for Short/Broken Content */}
                                            {isShortContent && article.originalLink && (article.originalLink.startsWith('http') || article.originalLink.startsWith('https')) && (
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

                            {/* Moved Follow Buttons to Bottom (Better UX) */}
                            <div className="mt-8 mb-6">
                                <FollowButtons
                                    whatsappLink="https://whatsapp.com/channel/0029VaXjY5k59PwLs0PSQ03L"
                                    facebookLink="https://www.facebook.com/bakalianews"
                                />
                            </div>

                            {/* Tags Display */}
                            {article.tags && article.tags.length > 0 && (
                                <div className="mt-8 pt-4 border-t border-slate-100">
                                    <div className="flex flex-wrap">
                                        {article.tags.map((tag, idx) => (
                                            <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-slate-200 cursor-pointer transition-colors mr-2 mb-2">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
                                <div className="flex items-center space-x-3">
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

                                <div className="flex space-x-2">
                                    <button onClick={handleCopyLink} className="flex items-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-lg transition font-medium">
                                        <Copy size={18} /> লিংক কপি
                                    </button>

                                </div>
                            </div>
                        </article>

                        {/* Comment Section */}
                        <CommentSection articleId={article.id} />
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 dark:border-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24 transition-colors duration-300">
                            <h3 className="font-bold text-lg border-b dark:border-slate-800 pb-2 mb-4 flex items-center space-x-2 text-slate-800 dark:text-white">
                                <TrendingUp size={20} className="text-red-600" /> আরো পড়ুন
                            </h3>
                            <div className="flex flex-col space-y-5">
                                {relatedNews.map(item => (
                                    <Link href={`/news/${item.id}`} key={item.id} className="group flex space-x-3 items-start">
                                        <div className="w-24 h-20 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 relative">
                                            <img
                                                src={item.imageUrl || (item.imageUrls && item.imageUrls[0]) || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=200"}
                                                alt={item.title}
                                                loading="lazy"
                                                onError={(e) => e.target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=200"}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-red-600 leading-snug line-clamp-3">
                                                {item.title}
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1">
                                                <span suppressHydrationWarning>
                                                    {new Date(item.publishedAt).toLocaleString('bn-BD')}
                                                </span>
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-8">
                                <span className="text-xs text-slate-400 uppercase tracking-widest block text-center mb-1">Advertisement</span>
                                {/* Manual Ad Removed - Auto Ads Active */}
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}

function ShareButtons({ title }) {
    const [url, setUrl] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setUrl(window.location.href);
        }
    }, []);

    if (!url) return null; // Wait for hydration

    return (
        <div className="flex flex-col gap-3 w-full">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Share2 size={16} /> Share this article
            </span>
            <div className="flex gap-2">
                <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] text-white py-2.5 rounded-lg hover:bg-[#166fe5] transition shadow-sm font-medium text-sm"
                    title="Share on Facebook"
                >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    <span className="hidden sm:inline">Facebook</span>
                </a>
                <a
                    href={`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-lg hover:bg-[#20bd5a] transition shadow-sm font-medium text-sm"
                    title="Share on WhatsApp"
                >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                    <span className="hidden sm:inline">WhatsApp</span>
                </a>
                <a
                    href={`https://t.me/share/url?url=${url}&text=${encodeURIComponent(title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#24A1DE] text-white py-2.5 rounded-lg hover:bg-[#1f8edb] transition shadow-sm font-medium text-sm"
                    title="Share on Telegram"
                >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                    <span className="hidden sm:inline">Telegram</span>
                </a>
            </div>
        </div>
    );
}
