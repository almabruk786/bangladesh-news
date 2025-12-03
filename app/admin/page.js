"use client";
import React, { useState, useEffect } from 'react';
// সঠিক পাথ নিশ্চিত করুন: (app ফোল্ডারের ভেতর lib থাকলে '../lib/firebase')
import { db } from '../lib/firebase'; 
import { collection, query, orderBy, getDocs, limit, addDoc } from 'firebase/firestore';
import { 
  Newspaper, RefreshCw, Bot, LayoutDashboard, CheckCircle, 
  Clock, Lock, ArrowRight, PenTool, Image as ImageIcon, Send 
} from 'lucide-react';

const ADMIN_PASSWORD = "Arif@42480"; 

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState("auto"); // 'auto' or 'manual'

  // সেশন চেক
  useEffect(() => {
    if (sessionStorage.getItem("admin_session") === "true") setIsAuthenticated(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_session", "true");
      setIsAuthenticated(true);
    } else {
      alert("ভুল পাসওয়ার্ড!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center space-y-4">
          <div className="bg-red-100 p-4 rounded-full inline-block"><Lock className="w-8 h-8 text-red-600" /></div>
          <h2 className="text-xl font-bold">এডমিন লগইন</h2>
          <input type="password" placeholder="গোপন কোড" className="w-full p-3 border rounded-lg" 
            value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
          <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded-lg">প্রবেশ করুন</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      {/* সাইডবার */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white"><Bot size={20}/></div>
          <h1 className="font-bold text-lg">Admin Panel</h1>
        </div>
        
        <button 
          onClick={() => setActiveTab("auto")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'auto' ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <RefreshCw size={20} /> অটোমেটিক পোস্ট
        </button>
        
        <button 
          onClick={() => setActiveTab("manual")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'manual' ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <PenTool size={20} /> ম্যানুয়াল পোস্ট
        </button>
      </aside>

      {/* মেইন এরিয়া */}
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        {activeTab === 'auto' ? <AutoSection /> : <ManualSection />}
      </main>
    </div>
  );
}

// --- অটোমেটিক সেকশন ---
function AutoSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(10));
    const snap = await getDocs(q);
    setArticles(snap.docs.map(d => ({id: d.id, ...d.data()})));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const runBot = async () => {
    setIsSyncing(true);
    setMessage("AI খবর খোঁজা শুরু করেছে...");
    try {
      const res = await fetch(`/api/cron?key=${ADMIN_PASSWORD}`);
      const data = await res.json();
      setMessage(data.success ? `সফল! ${data.message}` : "সমস্যা হয়েছে!");
      fetchData();
    } catch (e) { setMessage("সার্ভার এরর!"); }
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold">অটোমেটিক নিউজ রোবট</h2>
          <p className="text-slate-500 text-sm">AI বিভিন্ন পোর্টাল থেকে খবর সংগ্রহ করবে</p>
        </div>
        <button onClick={runBot} disabled={isSyncing} className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50">
          <RefreshCw className={isSyncing ? "animate-spin" : ""} /> {isSyncing ? "চলছে..." : "রোবট চালু করুন"}
        </button>
      </div>
      {message && <div className="p-4 bg-green-100 text-green-700 rounded-xl">{message}</div>}
      
      {/* খবরের তালিকা */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-sm font-bold text-slate-500">শিরোনাম</th>
              <th className="p-4 text-sm font-bold text-slate-500">সোর্স</th>
              <th className="p-4 text-sm font-bold text-slate-500">তারিখ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td className="p-4">লোডিং...</td></tr> : articles.map(a => (
              <tr key={a.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-medium">{a.title}</td>
                <td className="p-4 text-sm text-slate-500">{a.source}</td>
                <td className="p-4 text-sm text-slate-500">{new Date(a.publishedAt).toLocaleDateString('bn-BD')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- ম্যানুয়াল সেকশন (নিউজ লেখার ফর্ম) ---
function ManualSection() {
  const [form, setForm] = useState({ title: '', content: '', imageUrl: '', category: 'জাতীয়' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, "articles"), {
        ...form,
        source: "Editor Desk", // ম্যানুয়াল সোর্স
        publishedAt: new Date().toISOString(),
        status: "published",
        originalLink: "https://bakalia.xyz"
      });
      alert("খবর সফলভাবে পোস্ট হয়েছে! 🎉");
      setForm({ title: '', content: '', imageUrl: '', category: 'জাতীয়' }); // রিসেট
    } catch (e) {
      alert("সমস্যা হয়েছে: " + e.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <PenTool className="text-red-600" /> নতুন খবর লিখুন
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">খবরের শিরোনাম</label>
          <input required type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="একটি আকর্ষণীয় শিরোনাম দিন..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
            <select className="w-full p-3 border rounded-lg" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option>জাতীয়</option>
              <option>রাজনীতি</option>
              <option>খেলাধুলা</option>
              <option>আন্তর্জাতিক</option>
              <option>বিনোদন</option>
              <option>প্রযুক্তি</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ছবির লিংক (URL)</label>
            <input type="text" className="w-full p-3 border rounded-lg" 
              value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://example.com/image.jpg" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">বিস্তারিত খবর</label>
          <textarea required rows="8" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="এখানে বিস্তারিত খবর লিখুন..." />
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition flex justify-center items-center gap-2">
          {submitting ? "পোস্ট হচ্ছে..." : <><Send size={18} /> খবর প্রকাশ করুন</>}
        </button>
      </form>
    </div>
  );
}