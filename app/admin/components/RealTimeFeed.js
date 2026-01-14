"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Globe, Eye, User, Search } from "lucide-react";

export default function RealTimeFeed() {
    const [activities, setActivities] = useState([]);

    const fetchLiveActivity = async () => {
        try {
            const res = await fetch('/api/admin/live-logs');
            const data = await res.json();
            if (data.success && data.logs) {
                setActivities(data.logs);
            }
        } catch (e) {
            console.error("Live Feed Error", e);
        }
    };

    useEffect(() => {
        fetchLiveActivity();
        const interval = setInterval(fetchLiveActivity, 60000); // 60s poll (Save Quota)
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-red-100 p-2 rounded-lg">
                    <Activity className="text-red-600 animate-pulse" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        Live Feed <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    </h3>
                    <p className="text-xs text-slate-400">Real-time reader activity</p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden space-y-4">
                <AnimatePresence initial={false}>
                    {activities.map((item) => (
                        <motion.a
                            href={item.page?.startsWith('/') ? item.page : '#'}
                            target="_blank"
                            key={item.id}
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: "auto" }}
                            exit={{ opacity: 0, x: 20, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-3 border-b border-slate-50 last:border-0 pb-3 last:pb-0 hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors group cursor-pointer"
                        >
                            <div className={`p-2 rounded-full flex-shrink-0 transition-colors group-hover:scale-110 ${item.action?.includes('Social') ? 'bg-indigo-100 text-indigo-600' :
                                item.action?.includes('Search') ? 'bg-orange-100 text-orange-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                {item.action?.includes('Social') ? <Globe size={14} /> :
                                    item.action?.includes('Search') ? <Search size={14} /> : <Eye size={14} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                                    <span className="font-bold">{item.user}</span> <span className="text-slate-400 font-normal">{item.action}</span>
                                </p>
                                <p className="text-xs text-slate-500 truncate">{item.page}</p>
                            </div>

                            <span className="text-[10px] font-mono text-slate-300 whitespace-nowrap bg-slate-50 px-1.5 py-0.5 rounded">
                                {item.timestamp}
                            </span>
                        </motion.a>
                    ))}
                    {activities.length === 0 && <div className="text-center text-slate-400 py-10">Waiting for activity...</div>}
                </AnimatePresence>
            </div>
        </div>
    );
}
