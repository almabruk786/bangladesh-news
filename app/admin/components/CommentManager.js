"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase"; // Using same db instance
import { collection, query, where, orderBy, onSnapshot, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Check, X, Clock, MessageSquare, Trash2, User } from "lucide-react";

export default function CommentManager() {
    const [comments, setComments] = useState([]);
    const [stats, setStats] = useState({ pending: 0, published: 0 });

    useEffect(() => {
        // Fetch ALL comments to show stats and list
        // Note: In a real large app, separate queries or limiting is better.
        // Here we assume manageable volume or we can limit to pending + recent.
        // Let's fetch Pending ones mainly for the list, and maybe stats separately if needed.
        // Actually user wants to see "pending" to approve.

        const q = query(
            collection(db, "comments"),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            // Stats
            const p = list.filter(c => c.status === "pending").length;
            const pub = list.filter(c => c.status === "published").length;
            setStats({ pending: p, published: pub });

            setComments(list);
        });

        return () => unsub();
    }, []);

    const handleApprove = async (id) => {
        try {
            await updateDoc(doc(db, "comments", id), {
                status: "published"
            });
        } catch (error) {
            console.error("Error approving:", error);
            alert("Failed to approve");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        try {
            await deleteDoc(doc(db, "comments", id));
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Failed to delete");
        }
    };

    // Filter to show Pending by default, or maybe tabs for All/Pending?
    // Let's simple UI: Two sections or just a list with status badges?
    // User requested "pending comments, i approve".
    // Let's show Pending at the top or in a separate tab inside this component.
    const [filter, setFilter] = useState("pending"); // pending, published, all

    const filteredComments = comments.filter(c => {
        if (filter === "all") return true;
        // Default fallback for old comments without status? Assume published if 'isModerated' was true?
        // Old comments had 'isModerated: true'. New have 'status: pending'.
        // Let's treat 'status' missing as 'published' for legacy? Or just check explicitly.
        // If status is undefined, it might be old published one.
        const s = c.status || "published";
        return s === filter;
    });

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Comment Moderation</h2>
                    <p className="text-slate-500 text-sm">Review user comments before they go live</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("pending")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === "pending" ? "bg-orange-100 text-orange-700" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                        Pending ({stats.pending})
                    </button>
                    <button
                        onClick={() => setFilter("published")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === "published" ? "bg-green-100 text-green-700" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                        Published ({stats.published})
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {filteredComments.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                        <MessageSquare size={40} className="mx-auto mb-3 opacity-20" />
                        <p>No {filter} comments found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredComments.map(comment => (
                            <div key={comment.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
                                <div className="shrink-0">
                                    {comment.photoURL ? (
                                        <img src={comment.photoURL} alt={comment.displayName} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                            <User size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{comment.displayName}</h4>
                                            <p className="text-xs text-slate-400">
                                                Article ID: {comment.articleId.substring(0, 8)}... • {comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleString() : "Just now"}
                                            </p>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {comment.status === "pending" && (
                                                <button
                                                    onClick={() => handleApprove(comment.id)}
                                                    className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                                                    title="Approve"
                                                >
                                                    <Check size={14} /> Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="flex items-center gap-1 bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        {comment.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
