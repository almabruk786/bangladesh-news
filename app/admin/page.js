"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase'; 
import { collection, query, orderBy, getDocs, limit, addDoc, deleteDoc, doc, updateDoc, where, setDoc, getDoc } from 'firebase/firestore';
import { 
  Newspaper, RefreshCw, Bot, LayoutDashboard, CheckSquare, 
  PenTool, Users, Trash2, Edit, LogOut, Upload, XCircle, Pin, Eye, List, BarChart3, Megaphone, X
} from 'lucide-react';

const MASTER_PASSWORD = "Arif@42480"; 

export default function AdminDashboard() {
  const [user, setUser] = useState(null); 
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState("manual");
  
  const [editingArticle, setEditingArticle] = useState(null);
  const [viewingArticle, setViewingArticle] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("news_session");
    if(stored) {
       const data = JSON.parse(stored);
       if(new Date().getTime() - data.timestamp < 3600000) {
         setUser(data.user);
         if (!activeTab) setActiveTab(data.user.role === 'admin' ? "pending" : "dashboard");
       }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    let loggedUser = null;
    if (usernameInput.toLowerCase() === "admin" && passwordInput === MASTER_PASSWORD) {
      loggedUser = { name: "Md Arif Mainuddin", role: "admin" }; 
    } else {
      try {
        const q = query(collection(db, "users"), where("username", "==", usernameInput), where("password", "==", passwordInput));
        const snap = await getDocs(q);
        if (!snap.empty) loggedUser = { ...snap.docs[0].data(), role: "publisher" };
      } catch (e) { alert("Login Error"); }
    }

    if (loggedUser) {
      setUser(loggedUser);
      localStorage.setItem("news_session", JSON.stringify({ user: loggedUser, timestamp: Date.now() }));
      setActiveTab(loggedUser.role === 'admin' ? "pending" : "dashboard");
    } else alert("ভুল তথ্য!");
  };

  const logout = () => { localStorage.removeItem("news_session"); setUser(null); window.location.reload(); };

  if (!user) return <LoginScreen onLogin={handleLogin} u={usernameInput} p={passwordInput} setU={setUsernameInput} setP={setPasswordInput} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />
      
      <main className="flex-1 p-6 overflow-y-auto h-screen">
        {editingArticle ? (
           <ManualSection user={user} existingData={editingArticle} onCancel={() => setEditingArticle(null)} />
        ) : viewingArticle ? (
           <ViewModal article={viewingArticle} onClose={() => setViewingArticle(null)} />
        ) : (
          <>
            {activeTab === 'pending' && user.role === 'admin' && <PendingNews onView={setViewingArticle} onEdit={setEditingArticle} />}
            {activeTab === 'ads' && user.role === 'admin' && <AdManager />} 
            {activeTab === 'auto' && user.role === 'admin' && <AutoSection />}
            {activeTab === 'users' && user.role === 'admin' && <UserManagement />}
            {activeTab === 'manage' && user.role === 'admin' && <ManageNews onEdit={setEditingArticle} />}
            
            {activeTab === 'dashboard' && user.role === 'publisher' && <PublisherDashboard user={user} />}
            {activeTab === 'my_news' && user.role === 'publisher' && <PublisherNewsList user={user} />}
            
            {activeTab === 'manual' && <ManualSection user={user} />}
          </>
        )}
      </main>
    </div>
  );
}

// --- ফিক্সড: খবর ম্যানেজ সেকশন ---
function ManageNews({ onEdit }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // আমরা এখন শুধু তারিখ দিয়ে সর্ট করছি, যাতে সব খবর আসে (পিন করা হোক বা না হোক)
      const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(50));
      const snap = await getDocs(q);
      setNews(snap.docs.map(d => ({id: d.id, ...d.data()})));
    } catch(e) { 
      console.error(e); 
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const deleteNews = async (id) => {
    if(confirm("মুছবেন?")) { await deleteDoc(doc(db, "articles", id)); fetchData(); }
  };

  const togglePin = async (item) => {
    // পিন টগল করা হচ্ছে
    await updateDoc(doc(db, "articles", item.id), { isPinned: !item.isPinned });
    fetchData(); 
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-slate-50 font-bold text-slate-700">সকল খবর ({news.length})</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">শিরোনাম</th>
              <th className="p-4">লেখক</th>
              <th className="p-4 text-center">পিন</th>
              <th className="p-4">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" className="p-4 text-center">লোডিং...</td></tr> : news.map(n => (
              <tr key={n.id} className={`border-b ${n.isPinned ? 'bg-yellow-50' : 'hover:bg-slate-50'}`}>
                <td className="p-4 max-w-md truncate">
                  {n.isPinned && <Pin size={12} className="inline mr-2 text-red-600 fill-red-600"/>}
                  {n.title}
                </td>
                <td className="p-4 text-sm text-blue-600">{n.authorName}</td>
                <td className="p-4 text-center">
                  <button onClick={() => togglePin(n)} className={`p-2 rounded-full transition ${n.isPinned ? 'bg-yellow-200 text-yellow-800' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'}`}>
                    <Pin size={16}/>
                  </button>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => onEdit(n)} className="bg-slate-100 text-slate-600 p-2 rounded hover:bg-blue-100 hover:text-blue-600"><Edit size={16}/></button>
                  <button onClick={() => deleteNews(n.id)} className="bg-slate-100 text-red-500 p-2 rounded hover:bg-red-100"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- বাকি কম্পোনেন্টগুলো (সোজাসুজি আগের মতোই) ---
const LoginScreen = ({onLogin, u, p, setU, setP}) => (<div className="min-h-screen bg-slate-100 flex items-center justify-center p-4"><form onSubmit={onLogin} className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full space-y-4"><h2 className="text-xl font-bold text-center">নিউজ পোর্টাল লগইন</h2><input type="text" placeholder="ইউজারনেম" className="w-full p-3 border rounded" value={u} onChange={e => setU(e.target.value)} /><input type="password" placeholder="পাসওয়ার্ড" className="w-full p-3 border rounded" value={p} onChange={e => setP(e.target.value)} /><button className="w-full bg-slate-900 text-white p-3 rounded font-bold">প্রবেশ করুন</button></form></div>);
function AdManager() { const [adData, setAdData] = useState({ imageUrl: '', link: '', isActive: false }); const [uploading, setUploading] = useState(false); useEffect(() => { getDoc(doc(db, "ads", "popup")).then(snap => { if(snap.exists()) setAdData(snap.data()); }); }, []); const handleImageUpload = async (e) => { const file = e.target.files[0]; if (!file) return; setUploading(true); const formData = new FormData(); formData.append("file", file); formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET); try { const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData }); const data = await res.json(); if (data.secure_url) setAdData({ ...adData, imageUrl: data.secure_url }); } catch (error) { alert("আপলোড হয়নি"); } setUploading(false); }; const saveAd = async () => { await setDoc(doc(db, "ads", "popup"), adData); alert("বিজ্ঞাপন আপডেট হয়েছে! ✅"); }; return (<div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm"><h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-600"><Megaphone /> বিজ্ঞাপন সেটআপ</h2><div className="space-y-6"><div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg"><span className="font-bold">চালু আছে?</span><button onClick={() => setAdData({...adData, isActive: !adData.isActive})} className={`px-4 py-2 rounded-lg font-bold ${adData.isActive ? 'bg-green-600 text-white' : 'bg-slate-300 text-slate-600'}`}>{adData.isActive ? "ON" : "OFF"}</button></div><div><label className="block font-bold mb-2">ছবি</label><div className="flex gap-2"><label className="w-full p-3 border border-dashed rounded flex justify-center items-center gap-2 cursor-pointer hover:bg-slate-50">{uploading ? <RefreshCw className="animate-spin"/> : <Upload/>} Upload Image<input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" /></label></div>{adData.imageUrl && (<img src={adData.imageUrl} className="mt-4 w-full h-48 object-contain bg-slate-100 rounded" />)}</div><div><label className="block font-bold mb-2">লিংক</label><input className="w-full p-3 border rounded" placeholder="https://example.com" value={adData.link} onChange={e => setAdData({...adData, link: e.target.value})} /></div><button onClick={saveAd} className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700">সেভ করুন</button></div></div>); }
function PendingNews({ onView, onEdit }) { const [news, setNews] = useState([]); const fetchPending = async () => { const q = query(collection(db, "articles"), where("status", "==", "pending"), orderBy("publishedAt", "desc")); const snap = await getDocs(q); setNews(snap.docs.map(d => ({id: d.id, ...d.data()}))); }; useEffect(() => { fetchPending(); }, []); const updateStatus = async (id, status) => { if(confirm(status === 'published' ? "প্রকাশ করবেন?" : "বাতিল করবেন?")) { if(status === 'deleted') await deleteDoc(doc(db, "articles", id)); else await updateDoc(doc(db, "articles", id), { status }); fetchPending(); } }; return (<div className="space-y-4"><h2 className="text-2xl font-bold text-amber-600 mb-4">অনুমোদনের অপেক্ষায়</h2>{news.length === 0 ? <p>কোনো পেন্ডিং খবর নেই।</p> : news.map(n => (<div key={n.id} className="bg-white p-4 rounded-lg shadow border border-amber-200 flex justify-between items-center"><div><h3 className="font-bold text-lg">{n.title}</h3><p className="text-sm text-slate-500">লেখক: {n.authorName}</p></div><div className="flex gap-2"><button onClick={() => onView(n)} className="bg-blue-100 text-blue-600 p-2 rounded"><Eye size={18}/></button><button onClick={() => onEdit(n)} className="bg-slate-100 text-slate-600 p-2 rounded"><Edit size={18}/></button><button onClick={() => updateStatus(n.id, 'published')} className="bg-green-600 text-white p-2 rounded">Approve</button><button onClick={() => updateStatus(n.id, 'deleted')} className="bg-red-100 text-red-600 p-2 rounded"><Trash2 size={18}/></button></div></div>))}</div>); }
function ManualSection({ user, existingData, onCancel }) { const [form, setForm] = useState({ title: '', content: '', imageUrls: [], category: 'জাতীয়' }); const [submitting, setSubmitting] = useState(false); const [uploading, setUploading] = useState(false); useEffect(() => { if (existingData) { setForm({ title: existingData.title, content: existingData.content, imageUrls: existingData.imageUrls || (existingData.imageUrl ? [existingData.imageUrl] : []), category: existingData.category || 'জাতীয়' }); } }, [existingData]); const handleImageUpload = async (e) => { const files = Array.from(e.target.files); if (files.length === 0) return; setUploading(true); const newUrls = []; for (const file of files) { const formData = new FormData(); formData.append("file", file); formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET); try { const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData }); const data = await res.json(); if (data.secure_url) newUrls.push(data.secure_url); } catch (error) { alert("আপলোড সমস্যা"); } } setForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...newUrls] })); setUploading(false); }; const handleSubmit = async (e) => { e.preventDefault(); setSubmitting(true); try { let status = user.role === 'admin' ? 'published' : 'pending'; const payload = { ...form, imageUrl: form.imageUrls[0] || "", imageUrls: form.imageUrls, status: status, updatedAt: new Date().toISOString() }; if (!existingData) { payload.source = "Editor Desk"; payload.publishedAt = new Date().toISOString(); payload.authorName = user.role === 'admin' ? "Md Arif Mainuddin" : user.name; payload.authorRole = user.role; payload.isPinned = false; await addDoc(collection(db, "articles"), payload); alert(user.role === 'admin' ? "প্রকাশিত হয়েছে!" : "অনুমোদনের জন্য জমা হয়েছে।"); } else { await updateDoc(doc(db, "articles", existingData.id), payload); alert("আপডেট সফল! ✅"); if(onCancel) onCancel(); } if(!existingData) setForm({ title: '', content: '', imageUrls: [], category: 'জাতীয়' }); } catch (e) { alert("সমস্যা: " + e.message); } setSubmitting(false); }; return (<div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold flex items-center gap-2"><PenTool className="text-red-600" /> {existingData ? "এডিট" : "নতুন খবর"}</h2>{onCancel && <button onClick={onCancel} className="text-red-500 underline">বাতিল</button>}</div><form onSubmit={handleSubmit} className="space-y-5"><input required placeholder="শিরোনাম" className="w-full p-3 border rounded text-lg font-bold" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><select className="w-full p-3 border rounded" value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option>জাতীয়</option><option>রাজনীতি</option><option>খেলাধুলা</option><option>আন্তর্জাতিক</option><option>বিনোদন</option></select><div><label className="w-full p-3 border border-dashed rounded flex justify-center items-center gap-2 cursor-pointer hover:bg-slate-50">{uploading ? <RefreshCw className="animate-spin"/> : <Upload/>} {uploading ? "..." : "ছবি আপলোড (একাধিক)"}<input type="file" multiple onChange={handleImageUpload} className="hidden" accept="image/*" /></label></div></div><div className="flex gap-2 overflow-x-auto py-2">{form.imageUrls.map((url, idx) => (<div key={idx} className="relative w-24 h-24 shrink-0"><img src={url} alt="img" className="w-full h-full object-cover rounded" /><button type="button" onClick={() => setForm(p => ({...p, imageUrls: p.imageUrls.filter((_, i) => i !== idx)}))} className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"><XCircle size={12}/></button></div>))}</div><textarea required rows="10" placeholder="বিস্তারিত..." className="w-full p-3 border rounded" value={form.content} onChange={e => setForm({...form, content: e.target.value})} /><button disabled={submitting || uploading} className="w-full bg-slate-900 text-white p-3 rounded font-bold">{submitting ? "অপেক্ষা করুন..." : (existingData ? "আপডেট করুন" : "জমা দিন")}</button></form></div>); }
function AutoSection() { const [loading, setLoading] = useState(false); const [message, setMessage] = useState(""); const runBot = async () => { setLoading(true); setMessage("AI কাজ শুরু করেছে..."); try { const res = await fetch(`/api/cron?key=${MASTER_PASSWORD}`); const data = await res.json(); setMessage(data.success ? `সফল! ${data.message}` : "ব্যর্থ!"); } catch (e) { setMessage("এরর!"); } setLoading(false); }; return (<div className="bg-white p-6 rounded-xl shadow-sm"><h2 className="text-xl font-bold mb-4">AI কন্ট্রোল রুম</h2><button onClick={runBot} disabled={loading} className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"><RefreshCw className={loading ? "animate-spin" : ""} /> {loading ? "চলছে..." : "রোবট চালু করুন"}</button>{message && <p className="mt-4 text-green-600 font-bold">{message}</p>}</div>); }
function UserManagement() { const [users, setUsers] = useState([]); const [newUser, setNewUser] = useState({ name: '', username: '', password: '' }); useEffect(() => { getDocs(collection(db, "users")).then(snap => setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, []); const createUser = async (e) => { e.preventDefault(); await addDoc(collection(db, "users"), { ...newUser, role: 'publisher' }); alert("পাবলিশার তৈরি!"); window.location.reload(); }; const deleteUser = async (id) => { if(confirm("মুছবেন?")) { await deleteDoc(doc(db, "users", id)); setUsers(users.filter(u => u.id !== id)); } }; return (<div className="space-y-8"><div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="font-bold mb-4">নতুন পাবলিশার</h3><form onSubmit={createUser} className="flex gap-4"><input required placeholder="নাম" className="border p-2 rounded flex-1" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} /><input required placeholder="ইউজারনেম" className="border p-2 rounded flex-1" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} /><input required placeholder="পাসওয়ার্ড" className="border p-2 rounded flex-1" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /><button className="bg-green-600 text-white px-4 rounded">Add</button></form></div><div className="bg-white rounded-xl overflow-hidden shadow-sm"><table className="w-full text-left"><thead className="bg-slate-100"><tr><th className="p-4">নাম</th><th className="p-4">ইউজারনেম</th><th className="p-4">Action</th></tr></thead><tbody>{users.map(u => (<tr key={u.id} className="border-b"><td className="p-4">{u.name}</td><td className="p-4">{u.username}</td><td className="p-4"><button onClick={() => deleteUser(u.id)} className="text-red-500"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div></div>); }
function PublisherDashboard({ user }) { const [stats, setStats] = useState({ total: 0, published: 0, pending: 0 }); useEffect(() => { const fetchStats = async () => { const q = query(collection(db, "articles"), where("authorName", "==", user.name)); const snap = await getDocs(q); const docs = snap.docs.map(d => d.data()); setStats({ total: docs.length, published: docs.filter(d => d.status === 'published').length, pending: docs.filter(d => d.status === 'pending').length }); }; fetchStats(); }, [user]); return (<div className="space-y-6"><h2 className="text-2xl font-bold mb-4">আমার পারফরম্যান্স</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100"><p className="text-sm font-bold text-slate-500">মোট পোস্ট</p><h3 className="text-3xl font-bold text-blue-600">{stats.total}</h3></div><div className="bg-white p-6 rounded-xl shadow-sm border border-green-100"><p className="text-sm font-bold text-slate-500">প্রকাশিত</p><h3 className="text-3xl font-bold text-green-600">{stats.published}</h3></div><div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100"><p className="text-sm font-bold text-slate-500">অপেক্ষমান</p><h3 className="text-3xl font-bold text-amber-600">{stats.pending}</h3></div></div></div>); }
function PublisherNewsList({ user, onEdit }) { const [news, setNews] = useState([]); useEffect(() => { const q = query(collection(db, "articles"), where("authorName", "==", user.name), orderBy("publishedAt", "desc")); getDocs(q).then(snap => setNews(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [user]); return (<div className="bg-white rounded-xl shadow-sm overflow-hidden"><h3 className="p-6 font-bold border-b text-lg">আমার খবর</h3><table className="w-full text-left"><thead className="bg-slate-50"><tr><th className="p-4">শিরোনাম</th><th className="p-4">স্ট্যাটাস</th><th className="p-4">Action</th></tr></thead><tbody>{news.map(n => (<tr key={n.id} className="border-b"><td className="p-4 truncate max-w-xs">{n.title}</td><td className="p-4"><span className={`text-xs px-2 py-1 rounded font-bold ${n.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{n.status}</span></td><td className="p-4"><button onClick={() => onEdit(n)} className="bg-slate-100 p-2 rounded"><Edit size={16}/></button></td></tr>))}</tbody></table></div>); }
const ViewModal = ({ article, onClose }) => (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"><h2 className="text-2xl font-bold mb-4">{article.title}</h2><img src={article.imageUrl} className="w-full h-64 object-cover rounded mb-4" /><p className="whitespace-pre-wrap text-slate-700">{article.content}</p><button onClick={onClose} className="mt-6 bg-red-600 text-white px-4 py-2 rounded w-full">বন্ধ করুন</button></div></div>);
const Sidebar = ({ user, activeTab, setActiveTab, logout }) => (<aside className="w-full md:w-64 bg-white border-r p-6 flex flex-col gap-2"><div className="mb-6"><h1 className="font-bold text-lg">এডমিন প্যানেল</h1><p className="text-xs text-slate-500">{user.name}</p></div>{user.role === 'admin' && (<><NavButton icon={CheckSquare} label="পেন্ডিং" active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} /><NavButton icon={Megaphone} label="বিজ্ঞাপন (Ads)" active={activeTab === 'ads'} onClick={() => setActiveTab('ads')} /><NavButton icon={LayoutDashboard} label="ম্যানেজ (Edit)" active={activeTab === 'manage'} onClick={() => setActiveTab('manage')} /><NavButton icon={Users} label="পাবলিশার" active={activeTab === 'users'} onClick={() => setActiveTab('users')} /><NavButton icon={Bot} label="অটোমেশন" active={activeTab === 'auto'} onClick={() => setActiveTab('auto')} /></>)}<NavButton icon={PenTool} label="পোস্ট লিখুন" active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} />{user.role === 'publisher' && (<><NavButton icon={BarChart3} label="ড্যাশবোর্ড" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} /><NavButton icon={List} label="আমার খবর" active={activeTab === 'my_news'} onClick={() => setActiveTab('my_news')} /></>)}<button onClick={logout} className="mt-auto flex items-center gap-2 text-red-600 hover:bg-red-50 p-3 rounded-lg"><LogOut size={18}/> লগ আউট</button></aside>);
const NavButton = ({icon: Icon, label, active, onClick}) => (<button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition ${active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Icon size={18} /> {label}</button>);