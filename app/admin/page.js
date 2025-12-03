"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase'; 
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { 
  Newspaper, 
  RefreshCw, 
  Bot, 
  LayoutDashboard, 
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';

// --- ১. সিকিউরিটি কনফিগারেশন ---
// এখানে আপনার গোপন পাসওয়ার্ডটি দিন (আপনার CRON_SECRET টাই দিতে পারেন)
const ADMIN_PASSWORD = "Arif@42480"; 

export default function AdminDashboard() {
  // --- ২. লগইন লজিক ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // চেক করি আগে লগইন করা ছিল কিনা
  useEffect(() => {
    const session = sessionStorage.getItem("admin_session");
    if (session === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_session", "true"); // ব্রাউজারে মনে রাখবে
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
    }
  };

  // --- ৩. ড্যাশবোর্ড লজিক (আগের কোড) ---
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0 });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState("");

  const fetchDashboardData = async () => {
    try {
      const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(20));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArticles(data);
      setStats({
        total: snapshot.size, 
        published: data.filter(a => a.status === 'published').length
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const triggerManualSync = async () => {
    setIsSyncing(true);
    setMessage("AI খবর খোঁজা শুরু করেছে...");
    try {
      // পাসওয়ার্ড দিয়েই API কল করা হচ্ছে
      const res = await fetch(`/api/cron?key=${ADMIN_PASSWORD}`);
      const data = await res.json();
      if (data.success) {
        setMessage(`সফল! ${data.message}`);
        fetchDashboardData();
      } else {
        setMessage(`সমস্যা: ${data.error}`);
      }
    } catch (error) {
      setMessage("সার্ভারে সমস্যা হয়েছে।");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // --- ৪. যদি লগইন না থাকে, তবে লগইন পেজ দেখাবে ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">এডমিন প্যানেল</h2>
          <p className="text-center text-slate-500 mb-6 text-sm">প্রবেশ করতে গোপন কোডটি দিন</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                placeholder="Secret Code"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              প্রবেশ করুন <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- ৫. লগইন সফল হলে ড্যাশবোর্ড দেখাবে ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* সাইডবার */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:block">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AutoNews<span className="text-indigo-600">.ai</span></h1>
            <p className="text-[10px] uppercase text-slate-400 font-bold">Secure Admin</p>
          </div>
        </div>
        <nav className="mt-6 px-3">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </button>
        </nav>
      </aside>

      {/* মেইন কন্টেন্ট */}
      <main className="flex-1 h-screen overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">System Overview</h2>
          <div className="flex items-center space-x-4">
            {message && <span className="text-sm text-indigo-600 font-medium animate-pulse">{message}</span>}
            
            <button 
              onClick={triggerManualSync}
              disabled={isSyncing}
              className={`flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all ${isSyncing ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">{isSyncing ? 'Running AI...' : 'Run Cron Job'}</span>
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* স্ট্যাটাস কার্ড */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Articles" value={stats.total} icon={Newspaper} color="bg-indigo-500" />
            <StatCard title="Published" value={stats.published} icon={CheckCircle} color="bg-emerald-500" />
            <StatCard title="AI Status" value="Active" icon={Bot} color="bg-amber-500" />
            <StatCard title="Security" value="Locked" icon={Lock} color="bg-rose-500" />
          </div>

          {/* খবরের টেবিল */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="font-bold text-lg">Recent Articles (Live DB)</h3>
            </div>
            
            {loading ? (
              <div className="p-10 text-center text-slate-500">Loading data...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-100">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {articles.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                        কোনো খবর পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    articles.map((article) => (
                      <tr key={article.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 line-clamp-1">{article.title}</p>
                          <p className="text-xs text-slate-500">{article.source}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center text-emerald-600 text-xs font-bold">
                            <CheckCircle className="w-3 h-3 mr-1" /> Published
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm bg-slate-100 px-2 py-1 rounded-md">{article.category}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-500">
                          {new Date(article.publishedAt).toLocaleDateString('bn-BD')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ছোট কম্পোনেন্টগুলো (আগের মতোই)
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);