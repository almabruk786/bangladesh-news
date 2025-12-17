"use client";
import { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { Upload, X, Check, FileSpreadsheet, Loader2, AlertTriangle, FileText } from 'lucide-react';

export default function BulkImport({ onClose, onComplete }) {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [preview, setPreview] = useState([]);
    const [importing, setImporting] = useState(false);
    const [logs, setLogs] = useState([]);

    const handleFile = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        setFile(selected);
        parseFile(selected);
    };

    const parseFile = (file) => {
        const reader = new FileReader();

        if (file.name.endsWith('.csv')) {
            // CSV Parsing
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    processRawData(results.data);
                }
            });
        } else if (file.name.match(/\.xlsx?$/)) {
            // Excel Parsing
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                processRawData(jsonData);
            };
            reader.readAsArrayBuffer(file);
        } else if (file.name.endsWith('.pdf')) {
            alert("PDF Import is not supported for structured tables. Please convert your PDF to Excel or CSV first.");
            setFile(null);
        }
    };

    const processRawData = (rawData) => {
        // Normalize columns map
        // Expected: "Name", "Website", "Logo URL" (from screenshot)
        // Or variations: "English Name", "Bangla", "Url"

        const normalized = rawData.map(row => {
            // Fuzzy match keys
            const getVal = (keys) => {
                const key = Object.keys(row).find(k => keys.some(match => k.toLowerCase().includes(match.toLowerCase())));
                return key ? row[key] : '';
            };

            return {
                name: getVal(['name', 'english']),
                bn: getVal(['bangla', 'bn', 'bengali']) || getVal(['name', 'english']), // Fallback to name if generic
                url: getVal(['website', 'url', 'link']),
                logo: getVal(['logo', 'image', 'icon'])
            };
        }).filter(item => item.name && item.url); // filter empty rows

        setPreview(normalized);
    };

    const runImport = async () => {
        setImporting(true);
        setLogs([]);
        let added = 0;
        let skipped = 0;

        try {
            // Fetch existing URLs to prevent dupes
            const q = query(collection(db, "newspapers"));
            const snap = await getDocs(q);
            const existingUrls = new Set(snap.docs.map(d => d.data().url));

            const batchLog = [];

            for (const item of preview) {
                // Ensure URL protocol
                let safeUrl = item.url.trim();
                if (!safeUrl.startsWith('http')) safeUrl = 'https://' + safeUrl;

                if (existingUrls.has(safeUrl)) {
                    batchLog.push({ status: 'skip', name: item.name, msg: 'Already exists' });
                    skipped++;
                    continue;
                }

                try {
                    await addDoc(collection(db, "newspapers"), {
                        name: item.name.trim(),
                        bn: item.bn ? item.bn.trim() : item.name.trim(),
                        url: safeUrl,
                        logo: item.logo ? item.logo.trim() : '',
                        createdAt: new Date().toISOString()
                    });
                    batchLog.push({ status: 'success', name: item.name });
                    added++;
                } catch (e) {
                    batchLog.push({ status: 'error', name: item.name, msg: e.message });
                }
            }

            setLogs(batchLog);
            if (onComplete) onComplete();

        } catch (e) {
            console.error(e);
        } finally {
            setImporting(false);
            // Don't close immediately so they can see logs
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <FileSpreadsheet className="text-green-600" /> Bulk Import Newspapers
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"><X size={20} /></button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {!file ? (
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer relative">
                            <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Click to Upload File</p>
                            <p className="text-sm text-slate-500 mt-2">Supports Excel (.xlsx) and CSV</p>
                            <div className="mt-4 text-xs text-slate-400">
                                Expected Columns: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Name</span>, <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Website</span>, <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Logo URL</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <FileText className="text-blue-600" />
                                <div>
                                    <p className="font-bold text-blue-900 dark:text-blue-100">{file.name}</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">{preview.length} newspapers found</p>
                                </div>
                                <button onClick={() => { setFile(null); setPreview([]); setLogs([]); }} className="ml-auto text-sm text-red-500 font-bold hover:underline">Change File</button>
                            </div>

                            {/* Preview Table */}
                            {preview.length > 0 && (
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                                            <tr>
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Website</th>
                                                <th className="p-3">Logo</th>
                                                {logs.length > 0 && <th className="p-3">Status</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {preview.slice(0, 50).map((row, i) => {
                                                const log = logs.find(l => l.name === row.name);
                                                return (
                                                    <tr key={i}>
                                                        <td className="p-3 font-medium">{row.name} {row.bn && row.bn !== row.name && <span className="text-xs text-slate-400">({row.bn})</span>}</td>
                                                        <td className="p-3 text-blue-500 truncate max-w-[200px]">{row.url}</td>
                                                        <td className="p-3 truncate max-w-[150px] text-slate-400">{row.logo}</td>
                                                        {logs.length > 0 && (
                                                            <td className="p-3">
                                                                {log?.status === 'success' ? <Check className="text-green-500 w-4 h-4" /> :
                                                                    log?.status === 'skip' ? <span className="text-xs text-orange-500">Skipped</span> :
                                                                        <AlertTriangle className="text-red-500 w-4 h-4" />}
                                                            </td>
                                                        )}
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                    {preview.length > 50 && <div className="p-2 text-center text-xs text-slate-400 bg-slate-50">And {preview.length - 50} more...</div>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-2 pb-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-lg transition">Cancel</button>
                    {preview.length > 0 && (
                        <button
                            onClick={runImport}
                            disabled={importing || logs.length > 0}
                            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {importing ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                            {importing ? 'Importing...' : logs.length > 0 ? 'Import Complete' : 'Import All'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
