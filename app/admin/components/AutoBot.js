import { useState } from "react";
import { Bot, Play, Activity, Terminal, CheckCircle, AlertTriangle, Cpu } from "lucide-react";

export default function AutoBot({ masterKey }) {
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState("idle"); // idle, running, success, error

    const addLog = (msg, type = "info") => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
    };

    const runBot = async () => {
        if (!confirm("Are you sure you want to trigger the AI Auto-Publisher? This will fetch and generate news.")) return;

        setIsLoading(true);
        setStatus("running");
        setLogs([]); // Clear previous logs
        addLog("Initializing AI Core...", "info");
        addLog("Connecting to News Sources...", "info");

        try {
            const res = await fetch(`/api/cron?key=${masterKey}`);
            const data = await res.json();

            if (data.success) {
                addLog("AI Task Completed Successfully.", "success");
                addLog(`Server Response: ${data.message}`, "success");
                setStatus("success");
            } else {
                addLog("AI Task Completed with Warnings.", "warning");
                setStatus("error");
            }
        } catch (e) {
            addLog(`Critical Error: ${e.message}`, "error");
            setStatus("error");
        }

        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <Bot className="text-purple-600" size={32} /> AI Command Center
                    </h2>
                    <p className="text-slate-500 mt-2">Manage automated news fetching and generation agents.</p>
                </div>
                <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${status === "running" ? "bg-blue-100 text-blue-700 animate-pulse" :
                            status === "success" ? "bg-green-100 text-green-700" :
                                status === "error" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
                        }`}>
                        <Activity size={16} /> {status === "idle" ? "System Ready" : status}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Control Panel */}
                <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Cpu size={20} /> Actions</h3>

                    <button
                        onClick={runBot}
                        disabled={isLoading}
                        className={`w-full p-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl ${isLoading ? "bg-slate-700 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105"
                            }`}
                    >
                        {isLoading ? <Activity className="animate-spin" /> : <Play fill="currentColor" />}
                        {isLoading ? "Processing..." : "Run Auto-Bot"}
                    </button>

                    <p className="text-xs text-slate-400 mt-4 text-center">
                        Last execution: {logs.length > 0 ? logs[0].split("]")[0].replace("[", "") : "Never"}
                    </p>
                </div>

                {/* Terminal/Logs */}
                <div className="md:col-span-2 bg-slate-900 rounded-2xl shadow-lg overflow-hidden border border-slate-800 flex flex-col h-96">
                    <div className="bg-slate-800 p-3 flex items-center gap-2 border-b border-slate-700">
                        <Terminal size={16} className="text-slate-400" />
                        <span className="text-xs font-mono text-slate-300">System Logs</span>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-2">
                        {logs.length === 0 && <span className="text-slate-600 italic">Waiting for command...</span>}
                        {logs.map((log, i) => (
                            <div key={i} className={`flex gap-2 ${log.includes("Error") ? "text-red-400" :
                                    log.includes("Success") ? "text-green-400" : "text-blue-300"
                                }`}>
                                <span className="opacity-50 select-none">{">"}</span>
                                <span>{log}</span>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="text-purple-400 animate-pulse flex gap-2">
                                <span className="opacity-50">{">"}</span>
                                <span>Executing AI algorithms...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
