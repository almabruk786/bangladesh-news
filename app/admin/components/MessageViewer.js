import React from 'react';
import { Trash2, Mail, Calendar, User } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function MessageViewer({ messages, refreshData }) {

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this message?")) {
            try {
                await deleteDoc(doc(db, "messages", id));
                refreshData();
            } catch (error) {
                console.error("Error deleting message:", error);
                alert("Failed to delete message");
            }
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        // Handle Firestore Timestamp
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Messages ({messages.length})</h2>
            </div>

            {messages.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                    No messages found.
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {messages.map((msg) => (
                        <div key={msg.id} className="p-6 hover:bg-slate-50 transition">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{msg.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Mail size={12} /> {msg.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Calendar size={12} /> {formatDate(msg.createdAt)}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="text-slate-400 hover:text-red-500 transition"
                                        title="Delete Message"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="pl-13 ml-13">
                                <p className="text-slate-600 bg-slate-50 p-4 rounded-lg text-sm leading-relaxed">
                                    {msg.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
