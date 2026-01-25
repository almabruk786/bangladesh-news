"use client";
import { useState, useEffect } from 'react';
import { getFcmToken, messaging } from '../../lib/firebase';
import { onMessage } from 'firebase/messaging';

export default function PushDebugPage() {
    const [status, setStatus] = useState({
        permission: 'loading...',
        swRegistered: 'loading...',
        token: 'loading...',
        lastMessage: 'None'
    });
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    const checkStatus = async () => {
        // 1. Check Permission
        const perm = Notification.permission;
        setStatus(prev => ({ ...prev, permission: perm }));
        addLog(`Permission status: ${perm}`);

        // 2. Check Service Worker
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            const activeSWs = regs.map(r => r.active?.scriptURL).join(', ');
            setStatus(prev => ({ ...prev, swRegistered: activeSWs || 'None found' }));
            addLog(`Active Service Workers: ${activeSWs || 'None'}`);
        } else {
            setStatus(prev => ({ ...prev, swRegistered: 'Not Supported' }));
        }

        // 3. Get Token
        try {
            const token = await getFcmToken(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
            if (token) {
                setStatus(prev => ({ ...prev, token: token.substring(0, 15) + '...' }));
                addLog(`Token retrieved successfully: ${token.substring(0, 15)}...`);
            } else {
                setStatus(prev => ({ ...prev, token: 'Failed to get token' }));
                addLog('Token retrieval returned null');
            }
        } catch (error) {
            setStatus(prev => ({ ...prev, token: 'Error: ' + error.message }));
            addLog(`Token Error: ${error.message}`);
        }
    };

    const sendTestNotification = async () => {
        addLog('Sending test notification to self...');
        try {
            const fullToken = await getFcmToken(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
            if (!fullToken) return alert("No token available");

            const res = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: "Debug Test",
                    body: "If you see this, notifications are working!",
                    link: window.location.href,
                    targetToken: fullToken // Target ONLY this device
                })
            });

            // Ensure we are subscribed so we don't get deleted by cleanup if we were missing
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: fullToken })
            });

            const data = await res.json();
            addLog(`Send API response: ${JSON.stringify(data)}`);

        } catch (e) {
            addLog(`Send failed: ${e.message}`);
        }
    };

    const unregisterOldSW = async () => {
        addLog('Unregistering old service workers...');
        try {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (let reg of regs) {
                if (reg.active?.scriptURL.includes('/sw.js')) {
                    await reg.unregister();
                    addLog(`✓ Unregistered: ${reg.active.scriptURL}`);
                } else {
                    addLog(`Keeping: ${reg.active?.scriptURL}`);
                }
            }
            addLog('✓ Old SW removed. Refresh the page to register firebase-messaging-sw.js');
            alert('Old service worker removed! Please refresh the page (F5) now.');
        } catch (e) {
            addLog(`Error: ${e.message}`);
        }
    };

    useEffect(() => {
        checkStatus();

        // Listen for messages
        const setupListener = async () => {
            try {
                const msg = await messaging();
                if (msg) {
                    onMessage(msg, (payload) => {
                        console.log('Message received!', payload);
                        setStatus(prev => ({ ...prev, lastMessage: payload.notification?.title || payload.data?.title || 'Unknown' }));
                        addLog(`FOREGROUND MESSAGE RECEIVED: ${JSON.stringify(payload)}`);
                        // Removed alert - will show as browser notification instead
                    });
                }
            } catch (e) { console.error(e); }
        };
        setupListener();
    }, []);

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">Push Notification Debugger</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                    <h3 className="font-bold text-slate-500 text-xs mb-1">PERMISSION</h3>
                    <div className={`text-lg font-bold ${status.permission === 'granted' ? 'text-green-600' : 'text-red-500'}`}>
                        {status.permission}
                    </div>
                </div>
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                    <h3 className="font-bold text-slate-500 text-xs mb-1">TOKEN</h3>
                    <div className="text-sm font-mono truncate" title={status.token}>
                        {status.token}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-lg text-xs font-mono break-all">
                <h3 className="font-bold text-slate-500 text-xs mb-2">ACTIVE SERVICE WORKER</h3>
                {status.swRegistered}
            </div>

            <div className="flex gap-4 flex-wrap">
                <button onClick={checkStatus} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300 font-bold">
                    Refresh Status
                </button>
                <button onClick={unregisterOldSW} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold">
                    Unregister Old SW
                </button>
                <button onClick={sendTestNotification} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">
                    Send Test (Targeted)
                </button>
            </div>

            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    );
}
