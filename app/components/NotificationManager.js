"use client";
import { useState, useEffect } from 'react';
import { getFcmToken } from '../lib/firebase';
import { Bell, X } from 'lucide-react';

export default function NotificationManager() {
    const [permission, setPermission] = useState('default');
    const [showPrompt, setShowPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusText, setStatusText] = useState("");

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
            const isDismissed = sessionStorage.getItem('notification_dismissed');

            // Show prompt if default & not dismissed in this session
            if (Notification.permission === 'default' && !isDismissed) {
                const timer = setTimeout(() => setShowPrompt(true), 5000); // 5s delay
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const handleDismiss = () => {
        setShowPrompt(false);
        sessionStorage.setItem('notification_dismissed', 'true');
    };

    const requestPermission = async () => {
        setIsLoading(true);
        setStatusText("Click 'Allow' on popup...");

        try {
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), 15000)
            );

            const permissionReq = Notification.requestPermission();
            const permissionResult = await Promise.race([permissionReq, timeout]);
            setPermission(permissionResult);

            if (permissionResult === 'granted') {
                setStatusText("Connecting...");
                const tokenPromise = getFcmToken("BLxhDnQ4pI6_KxsaFUUaegdHmQPqVkfNtWH1eEsjwHwM_nzEb7dAsNPU9odSY5_3v2S71QXhDgisMLUsfUy8bDM");
                const token = await Promise.race([tokenPromise, timeout]);

                if (token) {
                    const subRes = await fetch('/api/notifications/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token })
                    });

                    if (subRes.ok) {
                        alert("Success! You will receive updates.");
                        setShowPrompt(false);
                    } else {
                        throw new Error("Subscription failed");
                    }
                } else {
                    throw new Error("Failed to get token");
                }
            } else {
                alert("Blocked. Please enable in browser settings.");
                setShowPrompt(false);
            }
        } catch (error) {
            console.error('Permission Error:', error);
            if (error.message === "Request timed out") {
                alert("Timed out. Check browser permission popup.");
            } else {
                alert("Error: " + error.message);
            }
        } finally {
            setIsLoading(false);
            setStatusText("");
        }
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 w-[320px]">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                    <X size={16} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
                        <Bell className="text-red-600 dark:text-red-500" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Enable Notifications?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Get breaking news updates. No spam, we promise.
                        </p>

                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={requestPermission}
                                disabled={isLoading}
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex-1"
                            >
                                {isLoading ? (statusText || 'Processing...') : 'Allow Updates'}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-4 py-2 rounded-lg transition-colors flex-1"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
