import { useState, useEffect, useRef } from "react";
import { db } from "../../lib/firebase";
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { Send, Users, BellRing } from "lucide-react";

export default function Messenger({ user }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isPopup, setIsPopup] = useState(false);
    const scrollRef = useRef(null);

    // Fetch Messages (Manual)
    const fetchMessages = async () => {
        try {
            const q = query(collection(db, "messages"), where("receiverId", "==", "all"), orderBy("createdAt", "asc"));
            const snapshot = await getDocs(q);
            const allMsgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setMessages(allMsgs);
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    // Initial Fetch
    useEffect(() => {
        fetchMessages();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const payload = {
            text: inputText,
            senderId: user.uid || user.id || user.username || user.name,
            senderName: user.name,
            senderRole: user.role,
            createdAt: serverTimestamp(),
            readBy: [user.uid || user.id || user.username || user.name],
            receiverId: "all",
            participants: ["all"],
            isPopup: user.role === "admin" ? isPopup : false
        };

        try {
            await addDoc(collection(db, "messages"), payload);
            setInputText("");
            setIsPopup(false);
            fetchMessages(); // Refresh list
        } catch (error) {
            console.error("Messenger: Send failed", error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Sidebar - Simplified to just Title for Broadcast */}
            <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50 hidden md:flex">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-bold text-lg text-slate-800">Communication</h2>
                </div>
                <div className="flex-1 p-4">
                    <button
                        className="w-full p-4 flex items-center gap-3 bg-white border-l-4 border-l-red-600 shadow-sm transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-800">General Broadcast</p>
                            <p className="text-xs text-slate-500">Public Channel</p>
                        </div>
                    </button>
                    {user.role === "admin" && (
                        <p className="mt-4 text-xs text-slate-400 px-2 text-center">
                            This channel broadcasts to all active publishers. Use "Send as Popup" for urgent alerts.
                        </p>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Users className="text-red-600 md:hidden" />
                        <h3 className="font-bold text-lg text-slate-800">
                            General Broadcast
                        </h3>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Public</span>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.senderName === user.name;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${isMe ? "bg-red-600 text-white rounded-br-none" : "bg-white text-slate-800 rounded-bl-none border border-slate-100"}`}>
                                    {!isMe && <p className="text-xs font-bold mb-1 opacity-70">{msg.senderName} <span className="text-[10px] font-normal opacity-70">({msg.senderRole})</span></p>}
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                    {msg.isPopup && <span className="inline-flex items-center gap-1 mt-2 text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-white/90"><BellRing size={10} /> Popup Alert</span>}
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? "text-red-100" : "text-slate-400"} flex items-center justify-end gap-1`}>
                                        {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                        {isMe && msg.readBy && msg.readBy.length > 1 && (
                                            <span title={`Seen by ${msg.readBy.length - 1} people`} className="cursor-help opacity-70 hover:opacity-100"> • Seen by {msg.readBy.length - 1}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                    {user.role === "admin" && (
                        <div className="mb-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="popupCheck"
                                checked={isPopup}
                                onChange={(e) => setIsPopup(e.target.checked)}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <label htmlFor="popupCheck" className="text-xs font-bold text-slate-600 flex items-center gap-1 cursor-pointer select-none">
                                <BellRing size={12} className="text-red-500" /> Send as Popup Notification
                            </label>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a broadcast message..."
                            className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-100 text-slate-800"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
