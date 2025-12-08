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
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [popupMsg, setPopupMsg] = useState(null);

  // Popup Listener (Global)
  useEffect(() => {
    if (!user) return;
    // ... (rest of popup logic remains same, implicit in standard replace if strict, but let's keep it safe)
    // Actually I need to match the exact block to insert state. 
    // Best place is right after state declarations.
    // But since I am replacing a chunk, I'll rewrite the render part mainly.
    // Let's stick to the render part update for the Sidebar prop and the wrapper.
    // I will add the function and state inside the component body in a separate small edit or careful larger edit.
    // To be safe, I'll replace the Sidebar render and the `renderContent` wrapper.
    // I need to inject `handleTabSwitch` and `isNavigating`.

    // I'll assume I can add the state in a clean way.
    // Actually, I can replace the whole functional component start if I want, but that's risky.
    // I'll replace lines 261-268 (Sidebar render) and inject the state handling logic logic ABOVE it ? No that won't work.

    // Let's replace the `AdminDashboard` body start to add state, AND the render part.
    // Complexity: High if split.
    // Better to use `replace_file_content` on the component start to add state, then another call for render.
    // OR just one big replace for the whole return block + providing the function definition inline or above?

    // Check lines 30-40.
  }, [user]);

  // Smoother Navigation Handler
  const handleTabSwitch = (newTab) => {
    if (newTab === activeTab) return;
    setIsNavigating(true);
    // Wait for fade out
    setTimeout(() => {
      setActiveTab(newTab);
      setEditingArticle(null);
      // Wait a bit for layout to calc then fade in
      setTimeout(() => setIsNavigating(false), 50);
    }, 300);
  };

  const closePopup = async () => {
    if (!popupMsg || !user) return;
    await updateDoc(doc(db, "messages", popupMsg.id), {
      readBy: arrayUnion(user.uid || user.name)
    });
    setPopupMsg(null);
  };

  // ... (keeping existing fetch logic) ...

  // Let's jump to the render part for this tool call.
  // I will assume I can insert the handleTabSwitch function before `return`.
  // Wait, I can't effectively insert a function in the middle without replacing a huge chunk.

  // STRATEGY: 
  // I will replace the component start to add state.


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
    <div className="h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col md:flex-row font-sans text-slate-900">

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* POPUP MODAL */}
      {popupMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Bell className="fill-white" /> System Notification
              </div>
              <button onClick={closePopup} className="text-white/80 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 md:p-8 text-center bg-slate-50">
              <p className="text-slate-800 text-lg md:text-xl font-medium leading-relaxed">
                {popupMsg.text}
              </p>
              <div className="mt-8 flex justify-center">
                <button onClick={closePopup} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1">
                  Acknowledge
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

      <main className="flex-1 overflow-y-auto h-full relative w-full scroll-smooth bg-[#F8FAFC]">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/40 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/40 blur-[100px]" />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col">

          {/* Top Bar Mobile Only */}
          <div className="md:hidden flex justify-between items-center mb-6 sticky top-0 bg-white/80 backdrop-blur-lg z-30 py-3 px-4 -mx-4 border-b border-indigo-100 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-indigo-900">
                <Menu size={24} />
              </button>
              <h1 className="font-black text-xl text-slate-800">Prime<span className="text-indigo-600">Control</span></h1>
            </div>
            <button onClick={logout} className="text-red-500 text-sm font-bold">Sign Out</button>
          </div>

          {/* Main Module Render */}
          <div className="flex-1 animate-in fade-in zoom-in-95 duration-500 ease-out">
            {activeTab !== "manual" && !editingArticle && activeTab !== "category" && activeTab !== "epaper" && activeTab !== "analytics" && activeTab !== "dashboard" && activeTab !== "auto" && user.role === "admin" && (
              <div className="mb-8">
                <DashboardStats stats={stats} />
              </div>
            )}

            {renderContent()}
          </div>

          <p className="text-center text-slate-400 text-xs py-8 mt-auto font-medium tracking-wide opacity-60 hover:opacity-100 transition-opacity">
            &copy; {new Date().getFullYear()} PrimeControl CMS System. v3.0 // Antigravity UI
          </p>
        </div>
      </main>
    </div>
  );
}