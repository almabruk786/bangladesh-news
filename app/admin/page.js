"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase'; 
import { collection, query, orderBy, getDocs, limit, addDoc, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { 
  Newspaper, RefreshCw, Bot, LayoutDashboard, CheckCircle, 
  Clock, Lock, PenTool, Send, Users, Trash2, Edit, LogOut, CheckSquare, XCircle, BarChart3, List, AlertCircle 
} from 'lucide-react';

const MASTER_PASSWORD = "Arif@42480"; 

export default function AdminDashboard() {
  const [user, setUser] = useState(null); 
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState("manual"); // ডিফল্ট ট্যাব

  // --- ১. সেশন ফিক্স (রিফ্রেশেও লগইন থাকবে + ১ ঘণ্টা মেয়াদ) ---
  useEffect(() => {
    const checkSession = () => {
      const storedSession = localStorage.getItem("news_session");
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        const now = new Date().getTime();
        
        // ১ ঘণ্টা (৩৬০০০০০ মিলি সেকেন্ড) এর বেশি হলে লগআউট
        if (now - sessionData.timestamp > 3600000) {
          logout();
        } else {
          // সেশন ঠিক থাকলে ইউজার সেট করো এবং সময় আপডেট করো (Inactivity Reset)
          setUser(sessionData.user);
          // ডিফল্ট ট্যাব সেট করা
          if (sessionData.user.role === 'admin') setActiveTab("pending");
          else setActiveTab("dashboard");
          
          // অ্যাক্টিভিটি থাকলে মেয়াদ বাড়িয়ে দেওয়া হচ্ছে
          localStorage.setItem("news_session", JSON.stringify({
            user: sessionData.user,
            timestamp: new Date().getTime()
          }));
        }
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    let loggedUser = null;

    // ১. এডমিন চেক
    if (usernameInput.toLowerCase() === "admin" && passwordInput === MASTER_PASSWORD) {
      loggedUser = { name: "Super Admin", role: "admin" };
    } 
    // ২. পাবলিশার চেক
    else {
      try {
        const q = query(collection(db, "users"), where("username", "==", usernameInput), where("password", "==", passwordInput));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const userData = snap.docs[0].data();
          loggedUser = { name: userData.name, role: "publisher" };
        }
      } catch (error) {
        alert("লগইন এরর!");
        return;
      }
    }

    if (loggedUser) {
      setUser(loggedUser);
      if (loggedUser.role === 'admin') setActiveTab("pending");
      else setActiveTab("dashboard");

      // লোকাল স্টোরেজে ১ ঘণ্টার টাইমস্ট্যাম্প সহ সেভ
      localStorage.setItem("news_session", JSON.stringify({
        user: loggedUser,
        timestamp: new Date().getTime()
      }));
    } else {
      alert("ভুল ইউজারনেম বা পাসওয়ার্ড!");
    }
  };

  const logout = () => {
    localStorage.removeItem("news_session");
    setUser(null);
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">নিউজ পোর্টাল লগইন</h2>
            <p className="text-sm text-slate-500">নিরাপদ লগইন ব্যবস্থা</p>
          </div>
          <input type="text" placeholder="ইউজারনেম" className="w-full p-3 border rounded-lg"
            value={usernameInput} onChange={e => setUsernameInput(e.target.value)} />
          <input type="password" placeholder="পাসওয়ার্ড" className="w-full p-3 border rounded-lg"
            value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
          <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold">প্রবেশ করুন</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r p-6 flex flex-col gap-2 shadow-sm z-10">
        <div className="mb-6">
          <h1 className="font-bold text-lg">স্বাগতম, <span className="text-red-600">{user.name}</span></h1>
          <span className="text-xs bg-slate-200 px-2 py-1 rounded uppercase font-bold">{user.role} Panel</span>
        </div>
        
        {user.role === 'admin' && (
          <>
            <NavButton icon={CheckSquare} label="পেন্ডিং নিউজ" active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} />
            <NavButton icon={Bot} label="অটোমেশন (AI)" active={activeTab === 'auto'} onClick={() => setActiveTab('auto')} />
            <NavButton icon={LayoutDashboard} label="সব খবর (Edit)" active={activeTab === 'manage'} onClick={() => setActiveTab('manage')} />
            <NavButton icon={Users} label="পাবলিশার যোগ" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          </>
        )}

        {user.role === 'publisher' && (
          <>
            <NavButton icon={BarChart3} label="ড্যাশবোর্ড" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavButton icon={List} label="আমার খবর" active={activeTab === 'my_news'} onClick={() => setActiveTab('my_news')} />
          </>
        )}

        <NavButton icon={PenTool} label="নতুন খবর লিখুন" active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} />
        
        <button onClick={logout} className="mt-auto flex items-center gap-2 text-red-600 hover:bg-red-50 p-3 rounded-lg w-full transition">
          <LogOut size={18}/> লগ আউট
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {activeTab === 'pending' && user.role === 'admin' && <PendingNews />}
        {activeTab === 'auto' && user.role === 'admin' && <AutoSection />}
        {activeTab === 'users' && user.role === 'admin' && <UserManagement />}
        {activeTab === 'manage' && user.role === 'admin' && <ManageNews />}
        {activeTab === 'dashboard' && user.role === 'publisher' && <PublisherDashboard user={user} />}
        {activeTab === 'my_news' && user.role === 'publisher' && <PublisherNewsList user={user} />}
        {activeTab === 'manual' && <ManualSection user={user} />}
      </main>
    </div>
  );
}

// --- ১. আপডেট: পেন্ডিং নিউজ (টাইমার সহ) ---
function PendingNews() {
  const [news, setNews] = useState([]);

  const fetchPending = async () => {
    const q = query(collection(db, "articles"), where("status", "==", "pending"), orderBy("publishedAt", "desc"));
    const snap = await getDocs(q);
    setNews(snap.docs.map(d => ({id: d.id, ...d.data()})));
  };
  useEffect(() => { fetchPending(); }, []);

  const updateStatus = async (id, status) => {
    if(confirm(status === 'published' ? "প্রকাশ করবেন?" : "বাতিল করবেন?")) {
      if(status === 'deleted') await deleteDoc(doc(db, "articles", id));
      else await updateDoc(doc(db, "articles", id), { status });
      fetchPending();
    }
  };

  // কতক্ষণ আগে পোস্ট হয়েছে তার হিসাব
  const getTimeAgo = (dateString) => {
    const diff = new Date() - new Date(dateString);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours} ঘণ্টা ${minutes % 60} মিনিট`;
    return `${minutes} মিনিট`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-amber-600">
        <Clock /> অনুমোদনের অপেক্ষায় ({news.length})
      </h2>
      {news.length === 0 ? <p className="text-slate-500 bg-white p-6 rounded-xl">কোনো পেন্ডিং খবর নেই। সব ক্লিয়ার! ✅</p> : (
        <div className="grid gap-4">
          {news.map(n => (
            <div key={n.id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{n.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    <Users size={14}/> {n.authorName}
                  </span>
                  <span className="flex items-center gap-1 text-red-500 font-medium">
                    <AlertCircle size={14}/> অপেক্ষা করছে: {getTimeAgo(n.publishedAt)}
                  </span>
                  <span>তারিখ: {new Date(n.publishedAt).toLocaleDateString('bn-BD')}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => updateStatus(n.id, 'published')} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-sm font-bold">
                  <CheckCircle size={18}/> Approve
                </button>
                <button onClick={() => updateStatus(n.id, 'deleted')} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-200 font-bold">
                  <XCircle size={18}/> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- বাকি কম্পোনেন্টগুলো অপরিবর্তিত (শুধু সংক্ষেপে দেওয়া হলো) ---

function PublisherDashboard({ user }) {
  const [stats, setStats] = useState({ total: 0, published: 0, pending: 0 });
  useEffect(() => {
    const fetchStats = async () => {
      const q = query(collection(db, "articles"), where("authorName", "==", user.name));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data());
      setStats({
        total: docs.length,
        published: docs.filter(d => d.status === 'published').length,
        pending: docs.filter(d => d.status === 'pending').length
      });
    };
    fetchStats();
  }, [user]);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">আমার পারফরম্যান্স</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100"><p className="text-sm font-bold text-slate-500">মোট পোস্ট</p><h3 className="text-3xl font-bold text-blue-600">{stats.total}</h3></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100"><p className="text-sm font-bold text-slate-500">প্রকাশিত (Live)</p><h3 className="text-3xl font-bold text-green-600">{stats.published}</h3></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100"><p className="text-sm font-bold text-slate-500">অপেক্ষমান</p><h3 className="text-3xl font-bold text-amber-600">{stats.pending}</h3></div>
      </div>
    </div>
  );
}

function PublisherNewsList({ user }) {
  const [news, setNews] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "articles"), where("authorName", "==", user.name), orderBy("publishedAt", "desc"));
    getDocs(q).then(snap => setNews(snap.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [user]);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <h3 className="p-6 font-bold border-b text-lg">আমার খবরের তালিকা</h3>
      <table className="w-full text-left"><thead className="bg-slate-50"><tr><th className="p-4">শিরোনাম</th><th className="p-4">স্ট্যাটাস</th></tr></thead><tbody>{news.map(n => (<tr key={n.id} className="border-b"><td className="p-4">{n.title}</td><td className="p-4"><span className={`text-xs px-2 py-1 rounded font-bold ${n.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{n.status === 'published' ? 'Live' : 'Pending'}</span></td></tr>))}</tbody></table>
    </div>
  );
}

function ManualSection({ user }) {
  const [form, setForm] = useState({ title: '', content: '', imageUrl: '', category: 'জাতীয়' });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET); 
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.secure_url) { setForm({ ...form, imageUrl: data.secure_url }); alert("ছবি আপলোড সফল! ✅"); }
    } catch (error) { alert("নেটওয়ার্ক সমস্যা!"); }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const status = user.role === 'admin' ? 'published' : 'pending';
      await addDoc(collection(db, "articles"), { ...form, source: "Editor Desk", publishedAt: new Date().toISOString(), status: status, authorName: user.name, authorRole: user.role, originalLink: "https://bakalia.xyz" });
      alert(user.role === 'admin' ? "প্রকাশিত হয়েছে!" : "অনুমোদনের জন্য পাঠানো হয়েছে।");
      setForm({ title: '', content: '', imageUrl: '', category: 'জাতীয়' });
    } catch (e) { alert("সমস্যা: " + e.message); }
    setSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6">নতুন খবর লিখুন</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input required placeholder="শিরোনাম" className="w-full p-3 border rounded" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <select className="w-full p-3 border rounded" value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option>জাতীয়</option><option>রাজনীতি</option><option>খেলাধুলা</option><option>আন্তর্জাতিক</option><option>বিনোদন</option></select>
          <div><label className="w-full p-3 border border-dashed rounded flex justify-center items-center gap-2 cursor-pointer hover:bg-slate-50">{uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড"}<input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" /></label></div>
        </div>
        {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded bg-slate-100" />}
        <textarea required rows="8" placeholder="বিস্তারিত খবর..." className="w-full p-3 border rounded" value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
        <button disabled={submitting} className="w-full bg-slate-900 text-white p-3 rounded font-bold">{submitting ? "প্রসেসিং..." : "জমা দিন"}</button>
      </form>
    </div>
  );
}

function AutoSection() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const runBot = async () => {
    setLoading(true); setMessage("AI কাজ শুরু করেছে...");
    try { const res = await fetch(`/api/cron?key=${MASTER_PASSWORD}`); const data = await res.json(); setMessage(data.success ? `সফল! ${data.message}` : "ব্যর্থ!"); } catch (e) { setMessage("এরর!"); }
    setLoading(false);
  };
  return (<div className="bg-white p-6 rounded-xl shadow-sm"><h2 className="text-xl font-bold mb-4">AI কন্ট্রোল রুম</h2><button onClick={runBot} disabled={loading} className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"><RefreshCw className={loading ? "animate-spin" : ""} /> {loading ? "চলছে..." : "রোবট চালু করুন"}</button>{message && <p className="mt-4 text-green-600 font-bold">{message}</p>}</div>);
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '' });
  useEffect(() => { getDocs(collection(db, "users")).then(snap => setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, []);
  const createUser = async (e) => { e.preventDefault(); await addDoc(collection(db, "users"), { ...newUser, role: 'publisher' }); alert("পাবলিশার তৈরি!"); window.location.reload(); };
  const deleteUser = async (id) => { if(confirm("মুছবেন?")) { await deleteDoc(doc(db, "users", id)); setUsers(users.filter(u => u.id !== id)); } };
  return (<div className="space-y-8"><div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="font-bold mb-4">নতুন পাবলিশার</h3><form onSubmit={createUser} className="flex gap-4"><input required placeholder="নাম" className="border p-2 rounded flex-1" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} /><input required placeholder="ইউজারনেম" className="border p-2 rounded flex-1" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} /><input required placeholder="পাসওয়ার্ড" className="border p-2 rounded flex-1" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /><button className="bg-green-600 text-white px-4 rounded">Add</button></form></div><div className="bg-white rounded-xl overflow-hidden shadow-sm"><table className="w-full text-left"><thead className="bg-slate-100"><tr><th className="p-4">নাম</th><th className="p-4">ইউজারনেম</th><th className="p-4">Action</th></tr></thead><tbody>{users.map(u => (<tr key={u.id} className="border-b"><td className="p-4">{u.name}</td><td className="p-4">{u.username}</td><td className="p-4"><button onClick={() => deleteUser(u.id)} className="text-red-500"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div></div>);
}

function ManageNews() {
  const [news, setNews] = useState([]);
  useEffect(() => { const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(20)); getDocs(q).then(snap => setNews(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, []);
  const deleteNews = async (id) => { if(confirm("মুছবেন?")) { await deleteDoc(doc(db, "articles", id)); setNews(news.filter(n => n.id !== id)); } };
  return (<div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-100"><tr><th className="p-4">শিরোনাম</th><th className="p-4">লেখক</th><th className="p-4">Action</th></tr></thead><tbody>{news.map(n => (<tr key={n.id} className="border-b"><td className="p-4 truncate max-w-xs">{n.title}</td><td className="p-4 text-blue-600 font-bold">{n.authorName}</td><td className="p-4"><button onClick={() => deleteNews(n.id)} className="text-red-500"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div>);
}

const NavButton = ({icon: Icon, label, active, onClick}) => (<button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition ${active ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}><Icon size={18} /> {label}</button>);