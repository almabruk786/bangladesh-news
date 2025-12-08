"use client";
import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { Menu, Bell, X } from "lucide-react";

// New Components
import Sidebar from "./components/Sidebar";
import DashboardStats from "./components/DashboardStats";
import DashboardOverview from "./components/DashboardOverview"; // New Dashboard 2.0
import NewsList from "./components/NewsList";
import NewsEditor from "./components/NewsEditor";
import LoginScreen from "./components/LoginScreen";
import CategoryManager from "./components/CategoryManager";
import AnalyticsViewer from "./components/AnalyticsViewer";
import AdManager from "./components/AdManager";
import EpaperManager from "./components/EpaperManager";
import UserManager from "./components/UserManager";
import AutoBot from "./components/AutoBot";
import Messenger from "./components/Messenger"; // Messages Chat System

const MASTER_PASSWORD = "Arif@42480";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState("manual");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Popup State
  const [popupMsg, setPopupMsg] = useState(null);

  // Data States
  const [articles, setArticles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, pending: 0 });

  // Editor State
  const [editingArticle, setEditingArticle] = useState(null);

  // Auth Check
  useEffect(() => {
    const stored = localStorage.getItem("news_session");
    if (stored) {
      const data = JSON.parse(stored);
      if (new Date().getTime() - data.timestamp < 3600000) {
        let restoredUser = data.user;

        // Fix: Ensure Admin has ID even if session is old
        if (restoredUser.role === "admin" && !restoredUser.id) {
          restoredUser = { ...restoredUser, id: "admin_master", username: "admin" };
          // Update storage to fix it permanently
          localStorage.setItem("news_session", JSON.stringify({ user: restoredUser, timestamp: Date.now() }));
        }

        setUser(restoredUser);
        if (!activeTab) setActiveTab(data.user.role === "admin" ? "dashboard" : "dashboard");
      }
    }
  }, []);

  // Popup Listener (Global)
  useEffect(() => {
    if (!user) return;

    // Listen for unread popup messages addressed to 'all' or this user
    const q = query(
      collection(db, "messages"),
      where("isPopup", "==", true),
      // where("readBy", "not-in", [user.uid || user.name]) // Firestore constraint: 'not-in' can't be combined easily with other filters sometimes.
      // Simpler approach: Fetch last 5 popups and check readBy client side or use a dedicated 'notifications' collection.
      // For MVP: Fetch "all" popups and sort by date, show latest unread.
      where("receiverId", "==", "all"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsub = onSnapshot(q, (snap) => {
      const unreadPopup = snap.docs.find(d => {
        const data = d.data();
        return !data.readBy?.includes(user.uid || user.name);
      });

      if (unreadPopup) {
        setPopupMsg({ id: unreadPopup.id, ...unreadPopup.data() });
      }
    });

    return () => unsub();
  }, [user]);

  const closePopup = async () => {
    if (!popupMsg || !user) return;
    // Mark as read
    await updateDoc(doc(db, "messages", popupMsg.id), {
      readBy: arrayUnion(user.uid || user.name)
    });
    setPopupMsg(null);
  };

  // Fetch Data based on User & Tab
  const fetchData = async () => {
    if (!user) return;
    try {
      let q;
      // Fetch stats (simplified for now)
      // Fetch stats (simplified for now)
      let statsQ = collection(db, "articles");
      if (user.role === "publisher") {
        statsQ = query(collection(db, "articles"), where("authorName", "==", user.name));
      } else {
        statsQ = query(collection(db, "articles"));
      }

      const statsSnap = await getDocs(statsQ);
      const allDocs = statsSnap.docs.map(d => d.data());
      setStats({
        total: allDocs.length,
        published: allDocs.filter(d => d.status === "published").length,
        pending: allDocs.filter(d => d.status === "pending").length
      });

      // Fetch specific table data
      // For Admin "Manage" -> Fetch all
      if (activeTab === "manage" && user.role === "admin") {
        q = query(collection(db, "articles"), orderBy("isPinned", "desc"), orderBy("publishedAt", "desc"), limit(2000));
      }
      // For Admin "Pending" -> Fetch pending & pending_delete
      else if (activeTab === "pending" && user.role === "admin") {
        q = query(collection(db, "articles"), where("status", "in", ["pending", "pending_delete"]), orderBy("publishedAt", "desc"));
      }
      // For Publisher "My News"
      else if (activeTab === "my_news" && user.role === "publisher") {
        q = query(collection(db, "articles"), where("authorName", "==", user.name), orderBy("publishedAt", "desc"));
      }
      // For Admin "Messages"
      else if (activeTab === "messages" && user.role === "admin") {
        const msgQ = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        const msgSnap = await getDocs(msgQ);
        setMessages(msgSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        return; // Exit early as we handled messages separately
      }

      if (q) {
        const snap = await getDocs(q);
        setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (error) {
      console.error("Data Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    let loggedUser = null;
    if (usernameInput.toLowerCase() === "admin" && passwordInput === MASTER_PASSWORD) {
      loggedUser = { id: "admin_master", name: "Md Arif Mainuddin", role: "admin", username: "admin" };
    } else {
      try {
        const q = query(collection(db, "users"), where("username", "==", usernameInput), where("password", "==", passwordInput));
        const snap = await getDocs(q);
        if (!snap.empty) loggedUser = { id: snap.docs[0].id, ...snap.docs[0].data(), role: "publisher" };
      } catch (e) { alert("Login Error"); }
    }

    if (loggedUser) {
      setUser(loggedUser);
      localStorage.setItem("news_session", JSON.stringify({ user: loggedUser, timestamp: Date.now() }));
      setActiveTab("dashboard");
    } else alert("Wrong credentials!");
  };

  const logout = () => { localStorage.removeItem("news_session"); setUser(null); window.location.reload(); };

  if (!user) return <LoginScreen onLogin={handleLogin} u={usernameInput} p={passwordInput} setU={setUsernameInput} setP={setPasswordInput} />;

  // Render Content
  const renderContent = () => {
    if (editingArticle) {
      return <NewsEditor
        user={user}
        existingData={editingArticle}
        onCancel={() => setEditingArticle(null)}
        onSuccess={() => { setEditingArticle(null); fetchData(); }}
      />;
    }

    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview stats={stats} user={user} />;
      case "manual":
        return <NewsEditor user={user} onSuccess={() => { setActiveTab(user.role === "publisher" ? "my_news" : "manage"); fetchData(); }} />;
      case "manage":
        return <NewsList title="Manage All News" data={articles} user={user} type="admin" onEdit={setEditingArticle} onView={setEditingArticle} refreshData={fetchData} />;
      case "pending":
        return <NewsList title="Pending Approvals" data={articles} user={user} type="admin" onEdit={setEditingArticle} refreshData={fetchData} />;
      case "my_news":
        return <NewsList title="My Stories" data={articles} user={user} type="publisher" onEdit={setEditingArticle} refreshData={fetchData} />;
      case "category":
        return <CategoryManager />;
      case "ads":
        return <AdManager />;
      case "epaper":
        return <EpaperManager />;
      case "analytics":
        return <AnalyticsViewer />;
      case "users":
        return <UserManager />;
      case "auto":
        return <AutoBot masterKey={MASTER_PASSWORD} />;
      case "messages":
        return <Messenger user={user} />;
      default:
        return <DashboardStats stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* POPUP MODAL */}
      {popupMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-red-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Bell className="fill-white" /> Administrator Message
              </div>
              <button onClick={closePopup} className="text-white/80 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 md:p-8 text-center">
              <p className="text-slate-800 text-lg md:text-xl font-medium leading-relaxed">
                {popupMsg.text}
              </p>
              <div className="mt-8 flex justify-center">
                <button onClick={closePopup} className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold hover:bg-slate-800 transition shadow-lg">
                  Okay, I saw this
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Sent by {popupMsg.senderName} • {new Date(popupMsg.createdAt?.seconds * 1000).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); setEditingArticle(null); }}
        logout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative w-full">
        {/* Top Bar Mobile Only */}
        <div className="md:hidden flex justify-between items-center mb-6 sticky top-0 bg-slate-50/90 backdrop-blur z-30 py-2 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-700">
              <Menu size={24} />
            </button>
            <h1 className="font-bold text-xl">PortalX</h1>
          </div>
          <button onClick={logout} className="text-red-500 text-sm font-bold">Sign Out</button>
        </div>

        {activeTab !== "manual" && !editingArticle && activeTab !== "category" && activeTab !== "epaper" && activeTab !== "analytics" && activeTab !== "dashboard" && user.role === "admin" && <DashboardStats stats={stats} />}

        {renderContent()}

        <p className="text-center text-slate-300 text-xs py-8 mt-auto">
          &copy; {new Date().getFullYear()} PortalX System. v2.0
        </p>
      </main>
    </div>
  );
}