"use client";
import React, { useState, useEffect } from "react";
import { Check, MessageSquare, Trash2, User, RefreshCw } from "lucide-react";

export default function CommentManager() {
    const [comments, setComments] = useState([]);
    const [stats, setStats] = useState({ pending: 0, published: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch Comments from API
    const fetchComments = async () => {
        try {
            setRefreshing(true);
            const res = await fetch("/api/admin/comments");
            const data = await res.json();

            if (data.success) {
                const list = data.comments;
                setComments(list);

                // Update Stats
                const p = list.filter(c => c.status === "pending").length;
                const pub = list.filter(c => c.status === "published").length;
                setStats({ pending: p, published: pub });
            } else {
                console.error("Failed to fetch comments:", data.error);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleApprove = async (id) => {
        try {
            // Optimistic Update
            setComments(prev => prev.map(c => c.id === id ? { ...c, status: "published" } : c));
            setStats(prev => ({ pending: prev.pending - 1, published: prev.published + 1 }));

            const res = await fetch("/api/admin/comments", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: "published" })
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.error);
        } catch (error) {
            console.error("Error approving:", error);
            alert("Failed to approve");
            fetchComments(); // Revert on error
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            // Optimistic Update
            setComments(prev => prev.filter(c => c.id !== id));

            const res = await fetch(`/api/admin/comments?id=${id}`, {
                method: "DELETE"
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.error);
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Failed to delete");
            fetchComments(); // Revert
        }
    };

    const [filter, setFilter] = useState("pending");

    const filteredComments = comments.filter(c => {
        if (filter === "all") return true;
        const s = c.status || "published";
        if (filter === "published") return s === "published" || !c.status;
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
                        onClick={fetchComments}
                        disabled={refreshing}
                        className="p-2 rounded-lg bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                        title="Refresh List"
                    >
                        <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
                    </button>
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
                {loading ? (
                    <div className="p-10 text-center text-slate-400">Loading comments...</div>
                ) : filteredComments.length === 0 ? (
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
                                            <div className="flex items-center gap-2 mt-1">
                                                <a
                                                    href={`/news/${comment.articleId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium bg-blue-50 px-2 py-0.5 rounded"
                                                >
                                                    View Article <span className="opacity-50">↗</span>
                                                </a>
                                                <span className="text-xs text-slate-300">•</span>
                                                <span className="text-xs text-slate-400">
                                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
                                                </span>
                                            </div>
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
