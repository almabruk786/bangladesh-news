"use client";
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_accepted");
    if (!accepted) {
      setTimeout(() => setShow(true), 2000); // ২ সেকেন্ড পর দেখাবে
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_accepted", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900 text-white p-6 rounded-xl shadow-2xl z-50 border border-slate-700 animate-in slide-in-from-bottom-10">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg">🍪 কুকি পলিসি</h3>
        <button onClick={() => setShow(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
      </div>
      <p className="text-sm text-slate-300 mb-4">
        আমরা আপনার অভিজ্ঞতা উন্নত করতে এবং বিজ্ঞাপন দেখাতে কুকি ব্যবহার করি। আমাদের সাইট ব্যবহার করে আপনি এতে সম্মতি দিচ্ছেন।
      </p>
      <div className="flex gap-3">
        <button onClick={acceptCookies} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm transition">
          মেনে নিলাম
        </button>
        <a href="/privacy-policy" className="flex-1 border border-slate-600 hover:bg-slate-800 text-center py-2 rounded-lg text-sm transition">
          পলিসি পড়ুন
        </a>
      </div>
    </div>
  );
}