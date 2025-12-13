"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Send, LogIn, MessageSquare, Trash2, Facebook, Mail } from "lucide-react";

export default function CommentSection({ articleId }) {
    const { user, loginWithGoogle, loginWithFacebook } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch realtime comments
    useEffect(() => {
        if (!articleId) return;

        const q = query(
            collection(db, "comments"),
            where("articleId", "==", articleId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [articleId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setLoading(true); // Temporarily show loading state for submission
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: newComment,
                    user: {
                        uid: user.uid,
                        displayName: user.displayName || "Anonymous",
                        photoURL: user.photoURL
                    },
                    articleId
                })
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                // Not JSON, likely an HTML error page (404/500)
                throw new Error(`Server returned ${res.status} ${res.statusText}`);
            }

            if (!data.success) {
                alert(data.error); // Show AI rejection reason
            } else {
                setNewComment(""); // Clear input on success
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
            alert("মতামত পাঠাতে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 mt-8">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="bg-red-50 p-2 rounded-full text-red-600">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">মতামত জানাও ({comments.length})</h3>
                    <p className="text-xs text-slate-500">সকলের সাথে আপনার চিন্তা শেয়ার করুন</p>
                </div>
            </div>

            {/* Input Area */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-10 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex gap-4 items-start">
                        <img
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full border border-slate-200"
                        />
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="এই খবর সম্পর্কে আপনার মতামত লিখুন..."
                                className="w-full p-4 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all resize-none text-sm min-h-[100px]"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} /> মন্তব্য প্রকাশ করুন
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-10 bg-slate-50 rounded-xl p-8 text-center border border-slate-100 dashed">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <LogIn size={20} />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">মতামত জানাতে লগিন করুন</h4>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">আপনার সোশ্যাল মিডিয়া একাউন্ট ব্যবহার করে সহজেই লগিন করতে পারেন</p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={loginWithFacebook}
                            className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition shadow-sm"
                        >
                            <Facebook size={18} fill="currentColor" /> Facebook Login
                        </button>
                        <button
                            onClick={loginWithGoogle}
                            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-2.5 rounded-lg font-bold text-sm transition shadow-sm"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" /> Google Login
                        </button>
                    </div>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-4 text-slate-400 text-sm">লোড হচ্ছে...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl">
                        <p className="text-sm">এখনো কোনো মন্তব্য নেই। আপনিই প্রথম মন্তব্য করুন!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group animate-in fade-in">
                            <div className="shrink-0">
                                <img
                                    src={comment.photoURL || `https://ui-avatars.com/api/?name=${comment.displayName}`}
                                    alt={comment.displayName}
                                    className="w-10 h-10 rounded-full border border-slate-100"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="bg-slate-50 px-4 py-3 rounded-2xl rounded-tl-none">
                                    <div className="flex items-center justify-between mb-1">
                                        <h5 className="font-bold text-sm text-slate-900">{comment.displayName}</h5>
                                        <span className="text-[10px] text-slate-400">
                                            {comment.createdAt?.toDate().toLocaleDateString('bn-BD')}
                                        </span>
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
