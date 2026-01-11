"use client";
import { useState } from 'react';
import { getFcmToken } from '../lib/firebase';

export default function TestPush() {
    const [status, setStatus] = useState("Idle");
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => setLogs(prev => [...prev, msg]);

    const runTest = async () => {
        setStatus("Testing...");
        setLogs([]);
        setError("");
        setToken("");

        try {
            addLog("Checking permission...");
            const perm = Notification.permission;
            addLog(`Permission: ${perm}`);

            if (perm !== 'granted') {
                addLog("Requesting permission...");
                const req = await Notification.requestPermission();
                addLog(`Permission Result: ${req}`);
                if (req !== 'granted') throw new Error("Permission denied");
            }

            addLog("Calling getFcmToken...");
            // Using the key we just verified
            const KEY = "BLxhDnQ4pI6_KxsaFUUaegdHmQPqVkfNtWH1eEsjwHwM_nzEb7dAsNPU9odSY5_3v2S71QXhDgisMLUsfUy8bDM";
            const retrievedToken = await getFcmToken(KEY);

            if (retrievedToken) {
                setStatus("Success");
                setToken(retrievedToken);
                addLog("Token retrieved successfully.");
            } else {
                setStatus("Failed");
                setError("getFcmToken returned null. Check console for 'An error occurred...'");
                addLog("Token is null.");
            }

        } catch (err) {
            setStatus("Error");
            // Show detailed error info
            const msg = err.message || JSON.stringify(err);
            setError(msg + (err.code ? ` (Code: ${err.code})` : ""));
            addLog(`Catch Error: ${msg}`);
            console.error(err);
        }
    };

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Push Notification Debugger</h1>
            <button
                onClick={runTest}
                className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
            >
                Run Test
            </button>

            <div className="mb-4">
                <strong>Status:</strong> <span className={status === "Success" ? "text-green-600" : "text-red-600"}>{status}</span>
            </div>

            {token && (
                <div className="mb-4 bg-green-50 p-4 rounded border border-green-200 break-all">
                    <strong>Token:</strong> {token}
                </div>
            )}

            {error && (
                <div className="mb-4 bg-red-50 p-4 rounded border border-red-200">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="bg-slate-100 p-4 rounded border border-slate-300">
                <strong>Logs:</strong>
                <ul className="list-disc ml-5 mt-2">
                    {logs.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
            </div>
        </div>
    );
}
