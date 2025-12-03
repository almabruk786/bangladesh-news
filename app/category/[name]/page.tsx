"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export default function CategoryPage({ params }: any) {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "articles"),
        where("category", "==", params.name),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      let data: any = [];
      snap.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setNews(data);
    };
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-black mb-4">{params.name} সংবাদ</h1>
      {news.map((item: any) => (
        <a href={`/news/${item.slug}`} key={item.id} className="block bg-white shadow p-4 mb-4 rounded-lg">
          <h2 className="font-bold">{item.title}</h2>
        </a>
      ))}
    </div>
  );
}
