"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { db, auth } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy, limit, updateDoc, doc, arrayUnion, getCountFromServer } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { Menu, Bell, X } from "lucide-react";

// Force dynamic rendering - Don't prerender this page during build
export const dynamic = 'force-dynamic';

// New Components
import Sidebar from "./components/Sidebar";
import DashboardStats from "./components/DashboardStats";
import DashboardOverview from "./components/DashboardOverview";
import NewsList from "./components/NewsList";
import NewsEditor from "./components/NewsEditor";
import LoginScreen from "./components/LoginScreen";
import CategoryManager from "./components/CategoryManager";
import AnalyticsViewer from "./components/AnalyticsViewer";
import AdManager from "./components/AdManager";
import EpaperManager from "./components/EpaperManager";
import UserManager from "./components/UserManager";
import AutoBot from "./components/AutoBot";
import LogoFetcher from "./components/LogoFetcher";
import Messenger from "./components/Messenger";
import CommentManager from "./components/CommentManager";
import ActionPalette from "./components/ActionPalette";
import QuotaMonitor from "./components/QuotaMonitor";

const MASTER_PASSWORD = "Arif@42480";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTabRaw] = useState("dashboard");

  // Persist Tab Selection
  const setActiveTab = (tab) => {
    setActiveTabRaw(tab);
    sessionStorage.setItem("admin_active_tab", tab);
  };

  useEffect(() => {
    const savedTab = sessionStorage.getItem("admin_active_tab");
    if (savedTab) setActiveTabRaw(savedTab);
  }, []);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [popupMsg, setPopupMsg] = useState(null);

  // Popup Listener (Global)
  useEffect(() => {
    if (!user) return;
  }, [user]);

  // Smoother Navigation Handler
  const handleTabSwitch = (newTab) => {
    if (newTab === activeTab) return;
    setIsNavigating(true);
    // Wait for fade out (faster for "instant" feel)
    setTimeout(() => {
      setActiveTab(newTab);
      setEditingArticle(null);
      // Wait a bit for layout to calc then fade in
      setTimeout(() => setIsNavigating(false), 50);
    }, 150);
  };

  const closePopup = async () => {
    if (!popupMsg || !user) return;
    await updateDoc(doc(db, "messages", popupMsg.id), {
      readBy: arrayUnion(user.uid || user.name)
    });
    setPopupMsg(null);
  };

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

        // Restore Firebase Session silently
        if (!auth.currentUser) {
          signInAnonymously(auth).catch(e => console.error("Auth Restore Error:", e));
        }

        if (restoredUser.role === "admin") {
          const savedTab = sessionStorage.getItem("admin_active_tab");
          setActiveTab(savedTab || "dashboard");
        }
      }
    }
  }, []);

  // Polling for Updates (Dashboard Stats & Popups) - Secure API approach
  useEffect(() => {
    if (!user) return;

    const fetchUpdates = async () => {
      try {
        const res = await fetch(`/api/admin/updates?userId=${user.uid || user.name}`);
        const data = await res.json();

        if (data.success) {
          // Update Stats
          setStats(prev => ({
            ...prev,
            activeUsers: data.stats.activeUsers,
            activePWA: data.stats.activePWA
          }));

          // Check Popup
          if (data.popupMsg) {
            const msg = data.popupMsg;
            // Client-side check if already read
            if (!msg.readBy?.includes(user.uid || user.name)) {
              setPopupMsg(msg);
            }
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    fetchUpdates(); // Initial call
    // const interval = setInterval(fetchUpdates, 30000); // Poll every 30s - DISABLED to save quota

    // CRITICAL: Cleanup interval to prevent memory leak & quota exhaustion
    // return () => clearInterval(interval);
  }, [user]);

  // Fetch Data based on User & Tab
  const fetchData = async () => {
    if (!user) return;
    try {
      let q;
      // Optimized Stats Fetching using Aggregation (Prevent full DB download)
      const coll = collection(db, "articles");
      let total = 0, published = 0, pending = 0;

      if (user.role === "publisher") {
        const totalQ = query(coll, where("authorName", "==", user.name));
        const pubQ = query(coll, where("authorName", "==", user.name), where("status", "==", "published"));
        const penQ = query(coll, where("authorName", "==", user.name), where("status", "==", "pending"));

        const [tSnap, pSnap, penSnap] = await Promise.all([
          getCountFromServer(totalQ),
          getCountFromServer(pubQ),
          getCountFromServer(penQ)
        ]);
        total = tSnap.data().count;
        published = pSnap.data().count;
        pending = penSnap.data().count;
      } else {
        const pubQ = query(coll, where("status", "==", "published"));
        const penQ = query(coll, where("status", "==", "pending"));

        // Admin sees all
        const [tSnap, pSnap, penSnap] = await Promise.all([
          getCountFromServer(coll),
          getCountFromServer(pubQ),
          getCountFromServer(penQ)
        ]);

        total = tSnap.data().count;
        published = pSnap.data().count;
        pending = penSnap.data().count;
      }

      setStats(prev => ({
        ...prev,
        total,
        published,
        pending
      }));

      // Fetch specific table data
      // For Admin "Manage" -> Fetch all
      if (activeTab === "manage" && user.role === "admin") {
        // Fix: Removed orderBy("isPinned", "desc") to avoid missing index error.
        // We will sort by pinned status in the client side below.
        q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(100)); // Reduced from 500 to 100 for quota optimization
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
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Client-side sort for "Manage" tab: Pinned first
        if (activeTab === "manage") {
          docs.sort((a, b) => Number(!!b.isPinned) - Number(!!a.isPinned));
        }

        setArticles(docs);
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

      // Upgrade to Firebase Session for Rules Compliance
      if (!auth.currentUser) {
        signInAnonymously(auth).catch(e => console.error("Auth Bridge Error:", e));
      }

      setActiveTab(sessionStorage.getItem("admin_active_tab") || "dashboard");
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
        return (
          <>
            <DashboardStats stats={stats} />
            <DashboardOverview stats={stats} user={user} />
          </>
        );
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
      case "newspapers":
        return (
          <div className="space-y-8">
            <LogoFetcher />
            <EpaperManager />
          </div>
        );
      case "epaper":
        return (
          <div className="space-y-6">
            <LogoFetcher />
            <EpaperManager />
          </div>
        );
      case "analytics":
        return <AnalyticsViewer />;
      case "quota":
        return <QuotaMonitor />;
      case "users":
        return <UserManager />;
      case "auto":
        return <AutoBot masterKey={MASTER_PASSWORD} />;
      case "messages":
        return <Messenger user={user} />;
      case "comments":
        return <CommentManager />;
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

      {/* Quick Action Palette (Cmd+K) */}
      <ActionPalette
        isOpen={isPaletteOpen}
        onClose={setIsPaletteOpen}
        user={user}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 overflow-y-auto h-full relative w-full scroll-smooth bg-[#F8FAFC]">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/40 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/40 blur-[100px]" />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col">

          {/* Top Bar Mobile Only - Enhanced Touch Targets */}
          <div className="md:hidden flex justify-between items-center mb-6 sticky top-0 bg-white/80 backdrop-blur-lg z-30 py-4 px-4 -mx-4 border-b border-indigo-100 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-3 -ml-2 text-indigo-900 active:bg-indigo-50 rounded-lg transition-colors touch-manipulation"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="font-black text-xl text-slate-800">Prime<span className="text-indigo-600">Control</span></h1>
            </div>
            <button
              onClick={logout}
              className="text-red-500 text-sm font-bold px-4 py-2 active:bg-red-50 rounded-lg transition-colors touch-manipulation min-h-[44px]"
            >
              Sign Out
            </button>
          </div>

          {/* Main Module Render with Smooth Transition */}
          <div className={`
              flex-1 transition-all duration-300 ease-in-out
              ${isNavigating ? 'opacity-0 scale-95 blur-sm translate-y-4' : 'opacity-100 scale-100 blur-0 translate-y-0'}
          `}>

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