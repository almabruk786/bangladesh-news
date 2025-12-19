"use client";
import { useState, useEffect } from 'react';
import { getFcmToken } from '../lib/firebase';
import { Bell, X } from 'lucide-react';

export default function NotificationManager() {
    const [permission, setPermission] = useState('default');
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);

            // Show prompt if default (not decided yet)
            if (Notification.permission === 'default') {
                // Show after a small delay to not be annoying immediately
                const timer = setTimeout(() => setShowPrompt(true), 3000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const requestPermission = async () => {
        try {
            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);
            setShowPrompt(false);

            if (permissionResult === 'granted') {
                console.log('Notification permission granted.');
                // Get Token
                const token = await getFcmToken("BLxhDnQ4pI6_KxsaFUUaegdHmQPqVkfNtWH1eEsjwHwM_nzEb7dAsNPU9odSY5_3v2S71QXhDgisMLUsfUy8bDM");
                if (token) {
                    console.log('FCM Token:', token);
                    // Here you would send the token to your server
                    // For now, we just log it. 
                    // To test: send a test message from Firebase Console to this token.
                }
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
        }
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed top-20 left-4 md:left-1/2 md:-translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
            <div className="bg-white p-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 w-[320px] md:w-[400px]">
                <button
                    onClick={() => setShowPrompt(false)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
                >
                    <X size={16} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <Bell className="text-red-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">নোটিফিকেশন চালু করুন?</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            সবার আগে ব্রেকিং নিউজ এবং বিশেষ আপডেটস পেতে নোটিফিকেশন চালু করুন। আমরা দিনে ১-২ টির বেশি পাঠাই না।
                        </p>

                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={requestPermission}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex-1"
                            >
                                Allow (চালু করুন)
                            </button>
                            <button
                                onClick={() => {
                                    setShowPrompt(false);
                                    // Optional: save preference to localStorage to not show again soon
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-lg transition-colors flex-1"
                            >
                                Block (বাদ দিন)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
