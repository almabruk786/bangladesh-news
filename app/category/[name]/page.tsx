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
      <h1 className="text-2xl font-black mb-4">{decodeURIComponent(name)} সংবাদ</h1>
      {news.map((item: any) => (
        <a href={`/news/${item.id}`} key={item.id} className="block bg-white shadow p-4 mb-4 rounded-lg">
          <h2 className="font-bold">{item.title}</h2>
        </a>
      ))}
    </div>
  );
}
