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

export default function DashboardOverview({ stats, user }) {
    const [seoAnalysis, setSeoAnalysis] = useState(null);
    const [logs, setLogs] = useState([]);

    const isAdmin = user?.role === 'admin';

    // 1. Fetch Vercel Logs (Admin Only) - Manual Refresh Only (No Auto-Refresh to Save Quota)
    useEffect(() => {
        if (!isAdmin) return;
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/vercel/logs');
                const data = await res.json();
                if (data.logs) setLogs(data.logs);
            } catch (error) { console.error("Logs Fetch Error:", error); }
        };
        fetchLogs(); // Only fetch once on mount
        // Removed auto-refresh interval to save Firestore quota
    }, [isAdmin]);

    // 2. Fetch SEO Data with Cache
    useEffect(() => {
        async function fetchInsights() {
            try {
                // Check cache first
                const cacheKey = 'admin_seo_analysis';
                const cached = sessionStorage.getItem(cacheKey);
                const cacheTime = sessionStorage.getItem(cacheKey + '_time');
                const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
                const isCacheValid = cacheTime && (Date.now() - parseInt(cacheTime) < CACHE_DURATION);

                if (isCacheValid && cached) {
                    console.log('[DashboardOverview] Using cached SEO analysis');
                    setSeoAnalysis(JSON.parse(cached));
                    return;
                }

                console.log('[DashboardOverview] Cache miss - fetching articles for SEO');
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

                if (docs.length > 0) {
                    const latest = docs[0];
                    const analysis = analyzeSeo(latest);
                    const seoData = { id: latest.id, title: latest.title, ...analysis };

                    // Cache the results
                    sessionStorage.setItem(cacheKey, JSON.stringify(seoData));
                    sessionStorage.setItem(cacheKey + '_time', Date.now().toString());

                    setSeoAnalysis(seoData);
                }
            } catch (e) { console.error("Dashboard Fetch Error:", e); }
        }
        if (user) fetchInsights();
    }, [user, isAdmin]);

    // SEO Modal State
    const [showSeoModal, setShowSeoModal] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Compact SEO Analyzer Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setShowSeoModal(true)}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden"
            >
                <div className="absolute top-2 right-2 bg-slate-50 rounded-lg px-3 py-1 text-xs font-bold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                    Click for Details ↗
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-600 transition duration-300">
                            <CheckCircle className="text-blue-600 group-hover:text-white transition duration-300" size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">SEO Health Check</h2>
                            <p className="text-xs text-slate-400">Latest article analysis</p>
                        </div>
                    </div>

                    {seoAnalysis ? (
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-4 text-2xl font-black transition-all group-hover:scale-110
                                    ${seoAnalysis.score >= 80 ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}>
                                    {seoAnalysis.score}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold text-sm">{seoAnalysis.issues.length} Issues</span>
                                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold text-sm">{seoAnalysis.good.length} Good</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-400 text-sm">Analyzing...</div>
                    )}
                </div>
            </motion.div>

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

            {/* System Activity Log (Admin) */}
            {isAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-slate-900 rounded-2xl p-6 text-slate-400 font-mono text-xs shadow-xl overflow-hidden flex flex-col"
                >
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
                </motion.div>
            )}
        </div >
    );
}
