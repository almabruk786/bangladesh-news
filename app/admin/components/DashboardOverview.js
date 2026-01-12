"use client";
import React, { useState, useEffect } from 'react';
import {
    Activity, TrendingUp, AlertCircle,
    Terminal, Globe, Users, CheckCircle, Clock, Search, Target
} from 'lucide-react';
import { analyzeSeo } from '../lib/SeoAnalyzer';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';

// New Widgets
import PerformanceChart from './PerformanceChart';
import RealTimeFeed from './RealTimeFeed';
import NamazTimingPanel from './NamazTimingPanel';

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
            } catch (error) { console.error("Logs Fetch Error:", error); }
        };
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    // 2. Fetch AI Trends & SEO Data
    useEffect(() => {
        async function fetchInsights() {
            try {
                const baseRef = collection(db, "articles");
                let constraints = [
                    where("status", "==", "published"),
                    orderBy("publishedAt", "desc"),
                    limit(10)
                ];
                if (!isAdmin && user?.name) constraints.push(where("authorName", "==", user.name));

                const q = query(baseRef, ...constraints);
                const snap = await getDocs(q);
                const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

                const trends = docs
                    .map(d => ({ ...d, velocity: Math.floor(Math.random() * 100) + 20 }))
                    .sort((a, b) => b.velocity - a.velocity)
                    .slice(0, 3);
                setTrendingNews(trends);

                if (docs.length > 0) {
                    const latest = docs[0];
                    const analysis = analyzeSeo(latest);
                    setSeoAnalysis({ id: latest.id, title: latest.title, ...analysis });
                }
            } catch (e) { console.error("Dashboard Fetch Error:", e); }
        }
        if (user) fetchInsights();
    }, [user, isAdmin]);

    // SEO Modal State
    const [showSeoModal, setShowSeoModal] = useState(false);

    // Goal Component
    const GoalTracker = ({ title, current, target, color }) => {
        const percent = Math.min((current / target) * 100, 100);
        return (
            <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>{title}</span>
                    <span>{current}/{target}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${color}`}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ROW 1: Namaz + Performance + Live Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Namaz Timing - First Priority */}
                <div className="h-full">
                    <NamazTimingPanel />
                </div>
                <div className="lg:col-span-2 h-full">
                    <PerformanceChart />
                </div>
                <div className="h-full">
                    <RealTimeFeed />
                </div>
            </div>

            {/* ROW 2: Goals + SEO + Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Goals & Targets */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                            <Target className="text-emerald-600" size={20} />
                        </div>
                        <h2 className="font-bold text-slate-800">Weekly Targets</h2>
                    </div>

                    <GoalTracker title="Articles Published" current={stats?.published || 12} target={50} color="bg-indigo-500" />
                    <GoalTracker title="Total Reads (K)" current={42} target={100} color="bg-pink-500" />
                    <GoalTracker title="Avg SEO Score" current={88} target={95} color="bg-emerald-500" />
                </div>

                {/* 2. AI Trend Detector */}
                <div className={`col-span-1 md:col-span-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm`}>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <TrendingUp className="text-orange-600" size={20} />
                        </div>
                        <h2 className="font-bold text-slate-800">
                            {isAdmin ? "Trending Now 🔥" : "My Top Stories 🔥"}
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
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. SEO Analyzer (Clickable Card) */}
                <div
                    onClick={() => setShowSeoModal(true)}
                    className="col-span-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-2 bg-slate-50 rounded-bl-xl text-xs font-bold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                        Click for Details ↗
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-600 transition duration-300">
                            <CheckCircle className="text-blue-600 group-hover:text-white transition duration-300" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">SEO Analyzer</h2>
                            <p className="text-xs text-slate-400">Latest analysis result</p>
                        </div>
                    </div>

                    {seoAnalysis ? (
                        <div className="text-center mt-4">
                            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-[6px] text-3xl font-black mb-4 transition-all group-hover:scale-110
                                ${seoAnalysis.score >= 80 ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}>
                                {seoAnalysis.score}
                            </div>
                            <h4 className="font-bold text-slate-700 truncate px-2 mb-2">"{seoAnalysis.title}"</h4>
                            <div className="flex justify-center gap-2 text-xs">
                                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold">{seoAnalysis.issues.length} Issues</span>
                                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold">{seoAnalysis.good.length} Good</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 py-8">Scanning latest post...</div>
                    )}
                </div>

            </div>

            {/* SEO Detail Modal */}
            {showSeoModal && seoAnalysis && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowSeoModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-1">SEO Analysis Report</h2>
                                <p className="text-sm text-slate-500 truncate max-w-md">Analyzed: "{seoAnalysis.title}"</p>
                            </div>
                            <div className={`text-2xl font-black px-4 py-2 rounded-xl ${seoAnalysis.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {seoAnalysis.score}/100
                            </div>
                        </div>

                        <div className="p-6 grid md:grid-cols-2 gap-8">
                            {/* Issues Section */}
                            <div>
                                <h4 className="font-bold text-sm mb-4 text-red-500 flex items-center gap-2 uppercase tracking-wide">
                                    <AlertCircle size={18} /> Critical Issues ({seoAnalysis.issues.length})
                                </h4>
                                <div className="space-y-3">
                                    {seoAnalysis.issues.length === 0 && <p className="text-sm text-slate-400 italic">No critical issues found. Perfect!</p>}
                                    {seoAnalysis.issues.map((issue, idx) => (
                                        <div key={idx} className="flex items-start gap-3 text-sm text-slate-700 bg-red-50 p-3 rounded-lg border border-red-100">
                                            <span className="text-red-500 font-bold mt-0.5">•</span>
                                            {issue}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Good Points */}
                            <div>
                                <h4 className="font-bold text-sm mb-4 text-green-600 flex items-center gap-2 uppercase tracking-wide">
                                    <CheckCircle size={18} /> Passed Checks ({seoAnalysis.good.length})
                                </h4>
                                <div className="space-y-3">
                                    {seoAnalysis.good.length === 0 && <p className="text-sm text-slate-400 italic">No passed checks.</p>}
                                    {seoAnalysis.good.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3 text-sm text-slate-700 bg-green-50 p-3 rounded-lg border border-green-100">
                                            <span className="text-green-600 font-bold mt-0.5">✓</span>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                            <button
                                onClick={() => setShowSeoModal(false)}
                                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-bold hover:bg-slate-300 transition"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ROW 3: Terminal Logs (Admin) */}
            {isAdmin && (
                <div className="bg-slate-900 rounded-2xl p-6 text-slate-400 font-mono text-xs shadow-xl overflow-hidden flex flex-col">

                    <div className="flex items-center gap-2 mb-4 text-slate-200 uppercase tracking-widest font-bold border-b border-slate-700 pb-2">
                        <Terminal size={14} /> System Activity Log
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-500 border-b border-slate-800">
                                    <th className="py-2 pl-2">Status</th>
                                    <th className="py-2">Message</th>
                                    <th className="py-2">Branch</th>
                                    <th className="py-2 text-right pr-2">When</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-800/50 transition group">
                                        <td className="py-2 pl-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                                ${log.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                                    log.type === 'success' ? 'bg-green-500/10 text-green-400' :
                                                        'bg-blue-500/10 text-blue-400'}`}>
                                                {log.state || log.type}
                                            </span>
                                        </td>
                                        <td className="py-2 text-slate-300 truncate max-w-xs">{log.msg}</td>
                                        <td className="py-2 text-purple-400">{log.branch || 'main'}</td>
                                        <td className="py-2 text-right pr-2 text-slate-500">{log.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div >
            )}
        </div >
    );
}
