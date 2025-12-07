"use client";
import { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

export default function SubscriptionBox() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [message, setMessage] = useState("");

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (data.success) {
                setStatus("success");
                setMessage("Thank you! You are now subscribed.");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.message || "Something went wrong.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    };

    return (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h4 className="text-white font-bold mb-2 uppercase tracking-wider text-xs flex items-center gap-2">
                <Mail size={16} className="text-red-500" /> Newsletter
            </h4>
            <p className="text-xs text-slate-400 mb-4">
                Get the latest news directly in your inbox. No spam, unsubscribe anytime.
            </p>

            {status === "success" ? (
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                    <CheckCircle size={18} />
                    {message}
                </div>
            ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="w-full pl-4 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-600 transition placeholder:text-slate-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === "loading"}
                            required
                        />
                    </div>
                    {message && status === "error" && (
                        <p className="text-red-400 text-xs font-bold">{message}</p>
                    )}
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status === "loading" ? <Loader2 size={18} className="animate-spin" /> : "Subscribe Now"}
                    </button>
                </form>
            )}
        </div>
    );
}
