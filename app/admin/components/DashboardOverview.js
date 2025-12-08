"use client";
import React, { useState, useEffect } from 'react';
import {
    BarChart, Activity, TrendingUp, AlertCircle,
    Terminal, Globe, Users, CheckCircle, Clock, Search
} from 'lucide-react';
import { analyzeSeo } from '../lib/SeoAnalyzer';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function DashboardOverview({ stats, user }) {
    const [trendingNews, setTrendingNews] = useState([]);
    const [seoAnalysis, setSeoAnalysis] = useState(null);
    const [logs, setLogs] = useState([]);
    const [searchResults, setSearchResults] = useState([]); // Search State

    const isAdmin = user?.role === 'admin';

    // 1. Fetch Vercel Logs (Admin Only)
    useEffect(() => {
        if (!isAdmin) return;

        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/vercel/logs');
                const data = await res.json();
                if (data.logs) setLogs(data.logs);
            } catch (error) {
                console.error("Logs Fetch Error:", error);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [isAdmin]);

    // 2. Fetch AI Trends & SEO Data
    useEffect(() => {
        async function fetchInsights() {
            try {
                // Determine Query: Admin gets global, Publisher gets their own
                const baseRef = collection(db, "articles");
                let constraints = [
                    where("status", "==", "published"),
                    orderBy("publishedAt", "desc"),
                    limit(10)
                ];

                if (!isAdmin && user?.name) {
                    constraints.push(where("authorName", "==", user.name));
                }

                const q = query(baseRef, ...constraints);
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
                    setSeoAnalysis({ id: latest.id, title: latest.title, ...analysis });
                }

            } catch (e) { console.error("Dashboard Fetch Error:", e); }
        }
        if (user) fetchInsights();
    }, [user, isAdmin]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. Content Stats */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">
                        {isAdmin ? "Total Published" : "My Published Stories"}
                    </h3>
                    <div className="text-4xl font-black text-slate-800">{stats?.published || 0}</div>
                </div>
                <div className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1">
                    <TrendingUp size={14} /> +12% this week
                </div>
            </div>

            {/* 2. AI Trend Detector */}
            <div className={`md:col-span-2 ${isAdmin ? '' : 'lg:col-span-3'} bg-white rounded-2xl p-6 border border-slate-100 shadow-sm`}>
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <TrendingUp className="text-orange-600" size={20} />
                    </div>
                    <h2 className="font-bold text-slate-800">
                        {isAdmin ? "AI Trend Detector 🚀" : "My High Performing News 🚀"}
                    </h2>
                </div>

                <div className="space-y-4">
                    {trendingNews.map((news, i) => (
                        <div key={news.id} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition">
                            <span className="font-black text-slate-200 text-2xl">0{i + 1}</span>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition">{news.title}</h4>
                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><Users size={12} /> {news.velocity} reads/hr</span>
                                    {i === 0 && <span className="bg-green-100 text-green-700 px-1.5 rounded font-bold">TOP</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {trendingNews.length === 0 && <p className="text-slate-400 text-sm">No recent data...</p>}
                </div>
            </div>

            {/* 3. Automated SEO Score Checker (Unified Full Width) */}
            <div className={`md:col-span-2 ${isAdmin ? 'lg:col-span-3' : 'lg:col-span-4'} bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-visible`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <CheckCircle className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">SEO Analyzer</h2>
                            <p className="text-xs text-slate-400">Check performance of any article</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative z-20 w-full md:w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search article title..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.length > 2) {
                                        const searchTitle = async () => {
                                            const q = query(
                                                collection(db, "articles"),
                                                where("title", ">=", val),
                                                where("title", "<=", val + '\uf8ff'),
                                                limit(5)
                                            );
                                            const snap = await getDocs(q);
                                            setSearchResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                                        };
                                        searchTitle();
                                    } else {
                                        setSearchResults([]);
                                    }
                                }}
                            />
                        </div>
                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 max-h-60 overflow-y-auto">
                                {searchResults.map(res => (
                                    <div
                                        key={res.id}
                                        onClick={() => {
                                            const analysis = analyzeSeo(res);
                                            setSeoAnalysis({ id: res.id, title: res.title, ...analysis });
                                            setSearchResults([]);
                                        }}
                                        className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-700 truncate transition"
                                    >
                                        {res.title}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {seoAnalysis && (
                        <div className={`hidden md:block text-2xl font-black px-4 py-2 rounded-lg ${seoAnalysis.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {seoAnalysis.score}/100
                        </div>
                    )}
                </div>

                {seoAnalysis ? (
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <h4 className="font-bold text-sm mb-3 text-slate-500 uppercase tracking-wider">Target Article</h4>
                            <a
                                href={`/news/${seoAnalysis.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 text-lg font-bold border-l-4 border-indigo-200 pl-4 italic hover:underline block leading-relaxed"
                            >
                                "{seoAnalysis.title}" ↗
                            </a>
                            <p className="text-xs text-slate-400 mt-2">Checking metadata, readability, and structure.</p>
                        </div>

                        {/* Issues Section */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-sm mb-2 text-red-500 flex items-center gap-2"><AlertCircle size={16} /> Things to Fix</h4>
                            {seoAnalysis.issues.length === 0 && <p className="text-xs text-slate-400">No issues found! Great job.</p>}
                            {seoAnalysis.issues.map((issue, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-red-50 p-2 rounded border border-red-100">
                                    <span className="text-red-500 min-w-[10px] mt-0.5">•</span> {issue}
                                </div>
                            ))}
                        </div>

                        {/* Good Points */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-sm mb-2 text-green-600 flex items-center gap-2"><CheckCircle size={16} /> Doing Great</h4>
                            {seoAnalysis.good.length === 0 && <p className="text-xs text-slate-400">Keep improving...</p>}
                            {seoAnalysis.good.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-green-50 p-2 rounded border border-green-100">
                                    <span className="text-green-600 min-w-[10px] mt-0.5">✓</span> {item}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-24 flex items-center justify-center text-slate-400">Loading analysis...</div>
                )}
            </div>

            {/* 4. Deployment Logs (Detailed & Full Width) - ADMIN ONLY */}
            {isAdmin && (
                <div className="md:col-span-2 lg:col-span-4 bg-slate-900 rounded-2xl p-6 text-slate-400 font-mono text-xs shadow-xl overflow-hidden flex flex-col mt-4">
                    <div className="flex items-center gap-2 mb-4 text-slate-200 uppercase tracking-widest font-bold border-b border-slate-700 pb-2">
                        <Terminal size={14} /> System Activity Log
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-500 border-b border-slate-800">
                                    <th className="py-2 pl-2">Status</th>
                                    <th className="py-2">Message</th>
                                    <th className="py-2">Branch</th>
                                    <th className="py-2">Author</th>
                                    <th className="py-2 text-right pr-2">When</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-800/50 transition group">
                                        <td className="py-3 pl-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase
                                                ${log.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                                    log.type === 'success' ? 'bg-green-500/10 text-green-400' :
                                                        log.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                {log.state || log.type}
                                            </span>
                                        </td>
                                        <td className="py-3 font-medium text-slate-300 max-w-xs truncate">
                                            {log.url ? (
                                                <a href={log.url} target="_blank" rel="noreferrer" className="hover:text-blue-400 hover:underline">
                                                    {log.msg} ↗
                                                </a>
                                            ) : log.msg}
                                        </td>
                                        <td className="py-3 text-slate-500"><span className="text-purple-400"></span> {log.branch || 'main'}</td>
                                        <td className="py-3 text-slate-500">{log.committer || 'System'}</td>
                                        <td className="py-3 text-right pr-2 text-slate-500">{log.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {logs.length === 0 && <div className="animate-pulse text-slate-600 pt-4 text-center">Waiting for activity...</div>}
                </div>
            )}

        </div>
    );
}
