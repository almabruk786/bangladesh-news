import { useState, useRef, useEffect } from "react";
import { Bot, Play, Activity, Terminal, CheckCircle, AlertTriangle, Cpu, Loader2, Database, Wifi } from "lucide-react";

const STEPS = [
    { id: 'init', label: 'Initialize', icon: Bot },
    { id: 'fetch', label: 'Fetch RSS', icon: Wifi },
    { id: 'ai', label: 'AI Analysis', icon: Cpu },
    { id: 'db', label: 'Save DB', icon: Database },
    { id: 'done', label: 'Complete', icon: CheckCircle },
];

export default function AutoBot({ masterKey }) {
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState("idle"); // idle, running, success, error
    const [currentStep, setCurrentStep] = useState('idle');
    const logsEndRef = useRef(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    const addLog = (msg, type = "info") => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);

        // Simple heuristic to update visual steps based on log content
        if (msg.includes("Fetching")) setCurrentStep('fetch');
        else if (msg.includes("AI") || msg.includes("Prompt")) setCurrentStep('ai');
        else if (msg.includes("Saving")) setCurrentStep('db');
        else if (msg.includes("finished") || msg.includes("Complete")) setCurrentStep('done');
    };

    const runBot = async () => {
        if (!confirm("Start AI Auto-Publisher?")) return;

        setIsLoading(true);
        setStatus("running");
        setLogs([]);
        setCurrentStep('init');

        try {
            const response = await fetch(`/api/cron?key=${masterKey}`);

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n").filter(line => line.trim() !== "");

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.msg) {
                            addLog(data.msg, data.type);
                        }
                        if (data.success) {
                            setStatus("success");
                            setCurrentStep('done');
                        }
                    } catch (e) {
                        console.error("Parse Error", e);
                    }
                }
            }
        } catch (e) {
            addLog(`Critical Error: ${e.message}`, "error");
            setStatus("error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800">
                        <Bot className="text-indigo-600" size={32} />
                        Auto-Bot Control
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Real-time Neural News Generation Engine</p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${status === 'running' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                        status === 'success' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {status === 'running' ? <Loader2 className="animate-spin" size={16} /> : <Activity size={16} />}
                    {status === 'idle' ? 'SYSTEM READY' : status.toUpperCase()}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Panel: Controls & Visualizer */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Run Button */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <button
                            onClick={runBot}
                            disabled={isLoading}
                            className={`w-full group relative overflow-hidden p-4 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${isLoading ? "bg-slate-800 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600"
                                }`}
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? <Bot className="animate-bounce" /> : <Play fill="currentColor" />}
                                {isLoading ? "EXECUTING AI..." : "RUN AUTO-BOT"}
                            </div>
                        </button>
                    </div>

                    {/* Step Visualizer */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Process Visualizer</h3>
                        <div className="space-y-4">
                            {STEPS.map((step, idx) => {
                                const isActive = currentStep === step.id;
                                const isPast = STEPS.findIndex(s => s.id === currentStep) > idx || status === 'success';
                                const Icon = step.icon;

                                return (
                                    <div key={step.id} className={`flex items-center gap-3 transition-all duration-500 ${isActive ? "opacity-100 translate-x-2" : isPast ? "opacity-50" : "opacity-30"
                                        }`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive ? "border-indigo-600 bg-indigo-50 text-indigo-600" :
                                                isPast ? "border-green-500 bg-green-50 text-green-500" : "border-slate-300 text-slate-300"
                                            }`}>
                                            <Icon size={14} />
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-sm font-bold ${isActive ? "text-indigo-700" : "text-slate-600"}`}>{step.label}</div>
                                            {isActive && <div className="h-1 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-indigo-500 animate-progress"></div>
                                            </div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Terminal Logs */}
                <div className="lg:col-span-2 bg-[#0F172A] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[500px]">
                    {/* Terminal Header */}
                    <div className="bg-[#1E293B] px-4 py-3 flex items-center justify-between border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-indigo-400" />
                            <span className="text-xs font-mono font-bold text-slate-400">root@news-ai:~# tail -f logs</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                    </div>

                    {/* Log Content */}
                    <div className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-1.5 font-medium scrollbar-hide">
                        {logs.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                                <Bot size={48} className="opacity-20" />
                                <p>Waiting for command sequence...</p>
                            </div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className={`break-words leading-relaxed ${log.includes("Error") ? "text-red-400" :
                                    log.includes("success") || log.includes("PUBLISHED") ? "text-emerald-400" :
                                        log.includes("Refining") ? "text-purple-400" :
                                            "text-blue-200"
                                }`}>
                                <span className="opacity-30 mr-2">$</span>
                                {log}
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>

            </div>
        </div>
    );
}
