"use client";
import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

// New Components
import Sidebar from "./components/Sidebar";
import DashboardStats from "./components/DashboardStats";
import NewsList from "./components/NewsList";
import NewsEditor from "./components/NewsEditor";
import LoginScreen from "./components/LoginScreen";
import CategoryManager from "./components/CategoryManager";
import AdManager from "./components/AdManager";
import UserManager from "./components/UserManager";
import AutoBot from "./components/AutoBot";

const MASTER_PASSWORD = "Arif@42480";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState("manual");

  // Data States
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, pending: 0 });

  // Editor State
  const [editingArticle, setEditingArticle] = useState(null);

  // Auth Check
  useEffect(() => {
    const stored = localStorage.getItem("news_session");
    if (stored) {
      const data = JSON.parse(stored);
      if (new Date().getTime() - data.timestamp < 3600000) {
        setUser(data.user);
        if (!activeTab) setActiveTab(data.user.role === "admin" ? "pending" : "dashboard");
      }
    }
  }, []);

  // Fetch Data based on User & Tab
  const fetchData = async () => {
    if (!user) return;
    try {
      let q;
      // Fetch stats (simplified for now)
      const statsQ = query(collection(db, "articles"));
      const statsSnap = await getDocs(statsQ); // Note: In production, use count() for efficiency
      const allDocs = statsSnap.docs.map(d => d.data());
      setStats({
        total: allDocs.length,
        published: allDocs.filter(d => d.status === "published").length,
        pending: allDocs.filter(d => d.status === "pending").length
      });

      // Fetch specific table data
      // For Admin "Manage" -> Fetch all
      if (activeTab === "manage" && user.role === "admin") {
        q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(100));
      }
      // For Admin "Pending" -> Fetch pending
      else if (activeTab === "pending" && user.role === "admin") {
        q = query(collection(db, "articles"), where("status", "==", "pending"), orderBy("publishedAt", "desc"));
      }
      // For Publisher "My News"
      else if (activeTab === "my_news" && user.role === "publisher") {
        q = query(collection(db, "articles"), where("authorName", "==", user.name), orderBy("publishedAt", "desc"));
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
      setActiveTab(loggedUser.role === "admin" ? "pending" : "dashboard");
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
        return <DashboardStats stats={stats} />;
      case "manual":
        return <NewsEditor user={user} onSuccess={() => { setActiveTab(user.role === "publisher" ? "my_news" : "manage"); fetchData(); }} />;
      case "manage":
        return <NewsList title="Manage All News" data={articles} type="admin" onEdit={setEditingArticle} onView={setEditingArticle} refreshData={fetchData} />;
      case "pending":
        return <NewsList title="Pending Approvals" data={articles} type="admin" onEdit={setEditingArticle} refreshData={fetchData} />;
      case "my_news":
        return <NewsList title="My Stories" data={articles} type="publisher" onEdit={setEditingArticle} refreshData={fetchData} />;
      case "category":
        return <CategoryManager />;
      case "ads":
        return <AdManager />;
      case "users":
        return <UserManager />;
      case "auto":
        return <AutoBot masterKey={MASTER_PASSWORD} />;
      default:
        return <DashboardStats stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      <Sidebar user={user} activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setEditingArticle(null); }} logout={logout} />

      <main className="flex-1 p-8 overflow-y-auto h-screen relative">
        {/* Top Bar Mobile Only */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <h1 className="font-bold text-xl">PortalX</h1>
          <button onClick={logout} className="text-red-500 text-sm font-bold">Sign Out</button>
        </div>

        {activeTab !== "manual" && !editingArticle && activeTab !== "category" && user.role === "admin" && <DashboardStats stats={stats} />}

        {renderContent()}

        <p className="text-center text-slate-300 text-xs py-8 mt-auto">
          &copy; {new Date().getFullYear()} PortalX System. v2.0
        </p>
      </main>
    </div>
  );
}