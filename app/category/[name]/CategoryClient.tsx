
"use client";

import { generateBreadcrumbSchema } from "../../lib/schemas";
import { parseNewsContent, stripHtml, getBanglaRelativeTime } from "../../lib/utils";
import { Clock } from "lucide-react";


export default function CategoryClient({ name, initialNews }: { name: string, initialNews: any[] }) {
    const news = initialNews || [];

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: decodeURIComponent(name), url: `/category/${name}` }
    ]);

    return (
        <div className="max-w-5xl mx-auto p-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <h1 className="text-2xl font-black mb-4 capitalize border-b pb-2 border-red-600 inline-block text-slate-900 dark:text-white">{decodeURIComponent(name)} News</h1>

            <div className="mb-8">
                {/* Auto Ads Active */}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item: any) => {
                    const content = item.content || "";
                    const plainText = content.replace(/<[^>]+>/g, '').substring(0, 150) + "...";

                    return (
                        <a href={`/ news / ${item.id} `} key={item.id} className="block group bg-white dark:bg-slate-900 dark:border-slate-800 border border-slate-100 p-4 rounded-xl hover:shadow-lg transition">
                            <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden mb-3 relative">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                                )}
                                <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                    {(() => {
                                        const cat = item.category;
                                        const map: Record<string, string> = {
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
                                        return map[cat] || map[cat?.trim()] || cat;
                                    })()}
                                </span>
                            </div>
                            <h2 className="font-bold text-lg leading-tight text-slate-900 dark:text-slate-100 group-hover:text-red-600 transition-colors mb-2">{item.title}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{plainText}</p>
                            <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1">
                                <Clock size={12} />
                                {getBanglaRelativeTime(item.publishedAt)}
                            </p>
                        </a>
                    );
                })}
            </div>
            {news.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    No news found in this category.
                </div>
            )}
        </div>
    );
}
