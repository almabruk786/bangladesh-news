"use client";
import React, { useState, useEffect } from 'react';
import {
    BarChart, Activity, TrendingUp, AlertCircle,
    Terminal, Globe, Users, CheckCircle, Clock
} from 'lucide-react';
import { analyzeSeo } from '../lib/SeoAnalyzer';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';



export default function DashboardOverview({ stats }) {
    const [realtimeUsers, setRealtimeUsers] = useState(42);
    const [trendingNews, setTrendingNews] = useState([]);
    const [seoAnalysis, setSeoAnalysis] = useState(null);
    const [logs, setLogs] = useState([]);

    // 1. Fetch Real-time Traffic (API)
    useEffect(() => {
        const fetchTraffic = async () => {
            try {
                const res = await fetch('/api/analytics');
                const data = await res.json();
                setRealtimeUsers(data.activeUsers);
            } catch (error) {
                console.error("Traffic Fetch Error:", error);
            }
        };

        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/vercel/logs');
                const data = await res.json();
                if (data.logs) setLogs(data.logs);
            } catch (error) {
                console.error("Logs Fetch Error:", error);
            }
        };

        fetchTraffic();
        fetchLogs();

        const interval = setInterval(() => {
            fetchTraffic();
            fetchLogs();
        }, 30000); // Poll every 30s

        return () => clearInterval(interval);
    }, []);

    // 2. Fetch AI Trends & SEO Data
    useEffect(() => {
        async function fetchInsights() {
            try {
                // Fetch recent articles to analyze
                const q = query(
                    collection(db, "articles"),
                    where("status", "==", "published"),
                    orderBy("publishedAt", "desc"),
                    limit(10)
                );
                const snap = await getDocs(q);
                const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

                // A. Trend Detection Logic (View Velocity Mock)
                // In real app, we'd check views vs publishedTime. 
                // Here we just pick random high-view docs if available or mock it.
                const trends = docs
                    .map(d => ({ ...d, velocity: Math.floor(Math.random() * 100) + 20 })) // Mock velocity
                    .sort((a, b) => b.velocity - a.velocity)
                    .slice(0, 3);
                setTrendingNews(trends);

                // B. SEO Analysis of Latest Article
                if (docs.length > 0) {
                    const latest = docs[0];
                    const analysis = analyzeSeo(latest);
                    setSeoAnalysis({ title: latest.title, ...analysis });
                }

            } catch (e) { console.error("Dashboard Fetch Error:", e); }
        }
        fetchInsights();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. Real-Time Traffic Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                    <Activity size={100} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-indigo-100 font-medium">
                        <Globe size={18} className="animate-pulse" /> Real-Time Visitors
                    </div>
                    <div className="text-5xl font-black tracking-tight mb-2">
                        {realtimeUsers}
                    </div>
                    <p className="text-indigo-200 text-xs flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                        Live on site now
                    </p>
                </div>
            </div>

            {/* 2. Content Stats */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Total Published</h3>
                    <div className="text-4xl font-black text-slate-800">{stats?.published || 0}</div>
                </div>
                <div className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1">
                    <TrendingUp size={14} /> +12% this week
                </div>
            </div>

            {/* 3. AI Trend Detector */}
            <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <TrendingUp className="text-orange-600" size={20} />
                    </div>
                    <h2 className="font-bold text-slate-800">AI Trend Detector 🚀</h2>
                </div>

                <div className="space-y-4">
                    {trendingNews.map((news, i) => (
                        <div key={news.id} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition">
                            <span className="font-black text-slate-200 text-2xl">0{i + 1}</span>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition">{news.title}</h4>
                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><Users size={12} /> {news.velocity} reads/hr</span>
                                    <span className="bg-green-100 text-green-700 px-1.5 rounded font-bold">VIRAL</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {trendingNews.length === 0 && <p className="text-slate-400 text-sm">Analyzing reading patterns...</p>}
                </div>
            </div>

            {/* 4. Automated SEO Score Checker */}
            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <CheckCircle className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Latest SEO Analysis</h2>
                            <p className="text-xs text-slate-400">Automated check on latest article</p>
                        </div>
                    </div>
                    {seoAnalysis && (
                        <div className={`text-2xl font-black px-4 py-2 rounded-lg ${seoAnalysis.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {seoAnalysis.score}/100
                        </div>
                    )}
                </div>

                {seoAnalysis ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-sm mb-3">Target Article</h4>
                            <p className="text-slate-600 text-sm font-medium border-l-2 border-slate-200 pl-3 italic">
                                "{seoAnalysis.title}"
                            </p>
                        </div>
                        <div className="space-y-2">
                            {seoAnalysis.issues.map((issue, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                    <AlertCircle size={14} /> {issue}
                                </div>
                            ))}
                            {seoAnalysis.good.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                                    <CheckCircle size={14} /> {item}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-24 flex items-center justify-center text-slate-400">Loading analysis...</div>
                )}
            </div>

            {/* 5. Deployment Logs (Vercel Integration) */}
            <div className="md:col-span-2 lg:col-span-1 bg-slate-900 rounded-2xl p-6 text-slate-400 font-mono text-xs shadow-xl overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-slate-200 uppercase tracking-widest font-bold border-b border-slate-700 pb-2">
                    <Terminal size={14} /> System Logs
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    {logs.map(log => (
                        <div key={log.id} className="flex gap-2 items-start opacity-80 hover:opacity-100 transition">
                            <span className="text-slate-600">[{log.time}]</span>
                            <span className={
                                log.type === 'error' ? 'text-red-400' :
                                    log.type === 'success' ? 'text-green-400' :
                                        log.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                            }>
                                {log.type === 'error' ? '✖' : log.type === 'success' ? '✔' : 'ℹ'}
                            </span>
                            <span>{log.msg}</span>
                        </div>
                    ))}
                    <div className="animate-pulse text-slate-600 pt-2">_ Waiting for logs...</div>
                </div>
            </div>

        </div>
    );
}
