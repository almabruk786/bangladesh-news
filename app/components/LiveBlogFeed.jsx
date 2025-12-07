"use client";
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Clock, Radio, Activity } from 'lucide-react';

export default function LiveBlogFeed({ articleId }) {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!articleId) return;

        // Listen for updates (limit to last 50 for performance)
        const q = query(
            collection(db, `articles/${articleId}/live_updates`),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newUpdates = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUpdates(newUpdates);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [articleId]);

    if (loading) return <div className="p-8 text-center bg-slate-50 rounded-xl animate-pulse">Loading live updates...</div>;
    if (updates.length === 0) return null;

    return (
        <div className="max-w-3xl mx-auto my-8">
            {/* Header */}
            <div className="bg-red-600 text-white p-4 rounded-t-xl flex justify-between items-center shadow-lg relative overflow-hidden">
                <div className="flex items-center gap-3 relative z-10">
                    <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                    </span>
                    <h2 className="font-black text-xl tracking-tight uppercase">Live Coverage</h2>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold bg-black/20 px-2 py-1 rounded">
                    <Radio size={14} className="animate-pulse" />
                    REAL-TIME
                </div>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>

            {/* Timeline */}
            <div className="bg-slate-50 border-x border-b border-slate-200 p-4 md:p-6 rounded-b-xl space-y-8 relative">
                {/* Vertical Line */}
                <div className="absolute left-6 md:left-8 top-6 bottom-6 w-0.5 bg-slate-200"></div>

                {updates.map((update, index) => (
                    <div key={update.id} className={`relative pl-8 md:pl-10 ${index === 0 ? 'animate-in slide-in-from-top-4 duration-700' : ''}`}>
                        {/* Dot */}
                        <div className={`absolute left-[1.15rem] md:left-[1.65rem] top-0 w-4 h-4 rounded-full border-4 border-slate-50 ${index === 0 ? 'bg-red-600 ring-4 ring-red-100 z-10' : 'bg-slate-300 z-0'}`}></div>

                        {/* Content Card */}
                        <div className={`rounded-xl p-5 shadow-sm border ${update.isPinned ? 'bg-yellow-50 border-yellow-200 ring-1 ring-yellow-400/50' : 'bg-white border-slate-200'}`}>

                            {update.isPinned && (
                                <div className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded uppercase">
                                    <Activity size={12} /> Key Event
                                </div>
                            )}

                            <div className="mb-2 text-xs font-bold text-slate-500 flex items-center gap-1">
                                <Clock size={12} />
                                {update.createdAt?.seconds ? new Date(update.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                <span className="mx-1">•</span>
                                {update.createdAt?.seconds ? new Date(update.createdAt.seconds * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Today"}
                            </div>

                            <div className="prose prose-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-serif">
                                {update.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
