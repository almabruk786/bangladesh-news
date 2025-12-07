import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Send, Trash2, Pin, Clock, AlertCircle } from 'lucide-react';

export default function LiveBlogConsole({ articleId, user }) {
    const [updates, setUpdates] = useState([]);
    const [content, setContent] = useState("");
    const [isPinned, setIsPinned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Real-time listener for updates
    useEffect(() => {
        if (!articleId) return;
        const q = query(
            collection(db, `articles/${articleId}/live_updates`),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUpdates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (err) => {
            console.error("Live listener error:", err);
            setError("Connection lost to live server.");
        });
        return () => unsubscribe();
    }, [articleId]);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            await addDoc(collection(db, `articles/${articleId}/live_updates`), {
                content: content,
                createdAt: serverTimestamp(), // Use server timestamp for sorting
                isPinned: isPinned,
                author: user.name,
                type: 'text'
            });
            setContent("");
            setIsPinned(false);
        } catch (err) {
            console.error("Post error:", err);
            setError("Failed to post update.");
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteDoc(doc(db, `articles/${articleId}/live_updates`, id));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const togglePin = async (id, currentStatus) => {
        try {
            await updateDoc(doc(db, `articles/${articleId}/live_updates`, id), {
                isPinned: !currentStatus
            });
        } catch (err) {
            console.error("Pin error:", err);
        }
    };

    // Auto-resize textarea
    const textareaRef = useRef(null);
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    return (
        <div className="bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-2xl border border-slate-700 font-sans flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <h2 className="font-bold text-lg tracking-tight">LIVE CONSOLE</h2>
                </div>
                <div className="text-xs font-mono text-slate-500">Connected: {articleId}</div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/50 p-2 text-center text-red-200 text-sm border-b border-red-800">
                    <AlertCircle size={14} className="inline mr-1" /> {error}
                </div>
            )}

            {/* Feed (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {updates.length === 0 && (
                    <div className="text-center text-slate-600 py-10 opacity-50">
                        <p>No updates yet. Start coverage.</p>
                    </div>
                )}

                {updates.map((update) => (
                    <div key={update.id} className={`p-4 rounded-lg border ${update.isPinned ? 'bg-yellow-900/20 border-yellow-600/50' : 'bg-slate-800 border-slate-700'} relative group transition-all`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                                <Clock size={12} />
                                {update.createdAt?.seconds ? new Date(update.createdAt.seconds * 1000).toLocaleTimeString() : "Just now"}
                            </span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => togglePin(update.id, update.isPinned)}
                                    className={`p-1.5 rounded hover:bg-slate-700 ${update.isPinned ? 'text-yellow-400' : 'text-slate-500'}`}
                                    title="Pin Update"
                                >
                                    <Pin size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(update.id)}
                                    className="p-1.5 rounded hover:bg-red-900/50 text-slate-500 hover:text-red-400"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed text-slate-200 font-medium">
                            {update.content}
                        </div>
                        {update.isPinned && (
                            <div className="absolute top-2 right-2 text-yellow-500/10 -z-0">
                                <Pin size={48} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
                <form onSubmit={handlePost} className="relative">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.metaKey) handlePost(e);
                        }}
                        placeholder="Type update... (Cmd+Enter to send)"
                        className="w-full bg-slate-900 text-white rounded-xl border border-slate-700 p-4 pr-32 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none min-h-[80px] max-h-[200px]"
                        disabled={loading}
                    />

                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsPinned(!isPinned)}
                            className={`p-2 rounded-lg transition-colors ${isPinned ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-500 hover:bg-slate-800'}`}
                            title="Pin this update"
                        >
                            <Pin size={18} />
                        </button>
                        <button
                            type="submit"
                            disabled={!content.trim() || loading}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 px-4 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <div className="animate-spin w-4 h-4 border-2 border-white/50 border-t-white rounded-full"></div> : <Send size={16} />}
                            POST
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
