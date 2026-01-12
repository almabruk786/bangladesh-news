"use client";
import React, { useState, useEffect } from "react";
import { Search, PenTool, Image as ImageIcon, Settings, LogOut, LayoutGrid, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ActionPalette({ isOpen, onClose, user, setActiveTab }) {
    const [query, setQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onClose(!isOpen);
            }
            if (e.key === "Escape") onClose(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const actions = [
        { id: "write", title: "Write News", icon: PenTool, shortcut: "N", action: () => setActiveTab("manual") },
        { id: "manage", title: "Manage News", icon: LayoutGrid, shortcut: "M", action: () => setActiveTab("manage") },
        { id: "media", title: "Media Library", icon: ImageIcon, shortcut: "L", action: () => setActiveTab("ads") }, // Mapping to ads for now or create new tab
        { id: "settings", title: "System Settings", icon: Settings, shortcut: "S", action: () => setActiveTab("users") },
        { id: "logout", title: "Log Out", icon: LogOut, shortcut: "Esc", action: () => { localStorage.removeItem("news_session"); window.location.reload(); } },
    ];

    const filtered = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => onClose(false)}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200"
                >
                    <div className="flex items-center border-b border-slate-100 px-4 py-3">
                        <Search size={20} className="text-slate-400 mr-3" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Type a command or search..."
                            className="flex-1 bg-transparent text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button onClick={() => onClose(false)} className="bg-slate-100 p-1 rounded hover:bg-slate-200 transition">
                            <X size={16} className="text-slate-500" />
                        </button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                        {filtered.map((action, i) => (
                            <button
                                key={action.id}
                                onClick={() => { action.action(); onClose(false); }}
                                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-indigo-50 group transition-colors ${i === 0 ? 'bg-slate-50' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white border border-slate-200 rounded-md text-slate-500 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                                        <action.icon size={18} />
                                    </div>
                                    <span className="font-medium text-slate-700 group-hover:text-slate-900">{action.title}</span>
                                </div>
                                {action.shortcut && (
                                    <span className="text-xs font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">
                                        {action.shortcut}
                                    </span>
                                )}
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <div className="text-center py-8 text-slate-400">No commands found</div>
                        )}
                    </div>

                    <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                        <span>Navigate using arrows</span>
                        <span>ESC to close</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
