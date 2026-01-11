"use client";
import { useState, useEffect } from 'react';
import { getFcmToken } from '../lib/firebase';
import { Bell, X } from 'lucide-react';

export default function NotificationManager() {
    const [permission, setPermission] = useState('default');
    const [showBell, setShowBell] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
            // Show bell if permission is 'default' (not chosen yet)
            if (Notification.permission === 'default') {
                setShowBell(true);
            }
        }
    }, []);

    const requestPermission = async () => {
        setIsLoading(true);
        try {
            // Direct request
            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult === 'granted') {
                const token = await getFcmToken("BLxhDnQ4pI6_KxsaFUUaegdHmQPqVkfNtWH1eEsjwHwM_nzEb7dAsNPU9odSY5_3v2S71QXhDgisMLUsfUy8bDM");
                if (token) {
                    await fetch('/api/notifications/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token })
                    });

                    alert("Success! You will now receive updates.");
                    setShowBell(false);
                } else {
                    alert("Connected, but failed to save settings.");
                }
            } else {
                // Denied - we hide the bell because we can't ask again easily
                setShowBell(false);
            }
        } catch (error) {
            console.error('Permission/Token Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!showBell || permission !== 'default') return null;

    return (
        <button
            onClick={requestPermission}
            disabled={isLoading}
            className="fixed bottom-6 right-6 w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 z-50 animate-in zoom-in duration-300 group"
            title="Enable Notifications"
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    <Bell size={24} />
                    <span className="absolute right-0 top-0 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>

                    {/* Tooltip on Hover */}
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Get News Updates
                    </div>
                </>
            )}
        </button>
    );
}
