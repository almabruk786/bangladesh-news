"use client";
import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function LogoFetcher() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState("");
    const [logs, setLogs] = useState([]);

    const runAutoFetch = async () => {
        setLoading(true);
        setLogs([]);
        try {
            const querySnapshot = await getDocs(collection(db, "newspapers"));
            const total = querySnapshot.size;
            let count = 0;

            for (const docSnap of querySnapshot.docs) {
                const paper = docSnap.data();
                count++;
                setProgress(`Processing ${count}/${total}: ${paper.name}`);

                // Skip if already has a valid full logo (subjective check) and we don't want to overwrite?
                // For now, let's overwrite if user asks (or maybe just if missing).
                // User said "extract and paste", implying filling gaps.
                if (paper.logo && paper.logo.length > 20) {
                    setLogs(prev => [...prev, { status: 'skip', name: paper.name, msg: 'Has logo' }]);
                    continue;
                }

                try {
                    const res = await fetch(`/api/fetch-metadata?url=${encodeURIComponent(paper.url)}`);
                    const data = await res.json();

                    if (data.logo) {
                        await updateDoc(doc(db, "newspapers", docSnap.id), {
                            logo: data.logo
                        });
                        setLogs(prev => [...prev, { status: 'success', name: paper.name, logo: data.logo }]);
                    } else {
                        setLogs(prev => [...prev, { status: 'fail', name: paper.name, msg: 'No logo found' }]);
                    }
                } catch (e) {
                    setLogs(prev => [...prev, { status: 'error', name: paper.name, msg: e.message }]);
                }
            }
            setProgress("Completed!");
        } catch (e) {
            console.error(e);
            setProgress("Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Newspaper Logo Auto-Fixer</h3>
                <button
                    onClick={runAutoFetch}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                    {loading ? 'Scanning...' : 'Start Auto-Fetch'}
                </button>
            </div>

            {progress && <div className="text-sm font-mono bg-slate-100 dark:bg-slate-900 p-2 rounded mb-4">{progress}</div>}

            <div className="max-h-60 overflow-y-auto space-y-1 text-xs font-mono">
                {logs.map((log, i) => (
                    <div key={i} className={`flex items-center gap-2 ${log.status === 'success' ? 'text-green-600' : log.status === 'skip' ? 'text-gray-400' : 'text-red-500'}`}>
                        {log.status === 'success' ? <CheckCircle size={12} /> : log.status === 'skip' ? <span>-</span> : <XCircle size={12} />}
                        <span className="font-bold">{log.name}:</span>
                        <span className="truncate">{log.logo || log.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
