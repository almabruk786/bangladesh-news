"use client";

import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export default function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const [news, setNews] = useState([]);

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "articles"),
        where("category", "==", name),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      let data: any = [];
      snap.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setNews(data);
    };
    load();
  }, [name]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-black mb-4 capitalize border-b pb-2 border-red-600 inline-block">{decodeURIComponent(name)} News</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item: any) => {
          // Safe extraction and stripping
          const content = item.content || "";
          const plainText = content.replace(/<[^>]+>/g, '').substring(0, 150) + "...";

          return (
            <a href={`/news/${item.id}`} key={item.id} className="block group bg-white border border-slate-100 p-4 rounded-xl hover:shadow-lg transition">
              <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-3 relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                )}
                <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">{item.category}</span>
              </div>
              <h2 className="font-bold text-lg leading-tight text-slate-900 group-hover:text-red-600 transition-colors mb-2">{item.title}</h2>
              <p className="text-sm text-slate-500 line-clamp-3">{plainText}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">{new Date(item.publishedAt?.seconds * 1000 || item.publishedAt || Date.now()).toLocaleDateString()}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
