import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { parseNewsContent, stripHtml } from "../../lib/utils";

export default function CategoryBlock({ title, news, color = "border-slate-800" }) {
    if (!news || news.length === 0) return null;

    const mainStory = news[0];
    const sideStories = news.slice(1, 5);

    return (
        <div className="mb-12">
            <div className="flex justify-between items-center border-b-2 border-slate-100 mb-6">
                <h2 className={`text-xl font-bold uppercase tracking-tight pb-2 border-b-2 -mb-0.5 ${color} text-slate-800`}>
                    {title}
                </h2>
                <Link href={`/category/${title}`} className="text-xs font-bold text-slate-500 uppercase flex items-center hover:text-red-600 transition-colors">
                    View All <ChevronRight size={14} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Main large story */}
                <div className="lg:col-span-2 group">
                    <Link href={`/news/${mainStory.id}`}>
                        <div className="aspect-video bg-slate-100 overflow-hidden rounded-lg mb-3 shadow-sm border border-slate-100 relative">
                            <Image
                                src={mainStory.imageUrl || mainStory.imageUrls?.[0] || '/placeholder.png'}
                                alt={mainStory.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                                className="object-cover group-hover:scale-105 transition duration-500"
                            />
                        </div>
                        <h3 className="text-xl font-bold leading-tight group-hover:text-red-600 text-slate-900 mb-2">
                            {mainStory.title}
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-2">
                            {(() => {
                                const content = parseNewsContent(mainStory.content);
                                const plainText = stripHtml(content);
                                return plainText.substring(0, 120) + (plainText.length > 120 ? "..." : "");
                            })()}
                        </p>
                    </Link>
                </div>

                {/* Side stories */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                    {sideStories.map((item) => (
                        <Link key={item.id} href={`/news/${item.id}`} className="group flex flex-col gap-2">
                            <div className="aspect-[3/2] bg-slate-100 overflow-hidden rounded-md border border-slate-100 relative">
                                <Image
                                    src={item.imageUrl || item.imageUrls?.[0] || '/placeholder.png'}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                                    className="object-cover group-hover:scale-110 transition duration-500"
                                />
                            </div>
                            <h4 className="font-bold text-sm text-slate-800 leading-snug group-hover:text-red-600 line-clamp-3">
                                {item.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(item.publishedAt).toLocaleDateString()}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
