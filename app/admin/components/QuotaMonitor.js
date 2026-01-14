"use client";
import { useState, useEffect } from 'react';
import { Database, RefreshCw, AlertTriangle, CheckCircle, Clock, TrendingUp, Download, Activity } from 'lucide-react';

export default function QuotaMonitor() {
    const [quotaData, setQuotaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [autoRefresh, setAutoRefresh] = useState(false); // Changed from true to false - only refresh manually

    const fetchQuotaData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/quota');
            const data = await response.json();

            if (data.success) {
                setQuotaData(data);
                setLastUpdated(new Date());
                setError(null);
            } else {
                setError(data.error || "Failed to fetch quota data");
            }
        } catch (err) {
            console.error("Quota fetch error:", err);
            setError(err.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchQuotaData();
    }, []);

    // Auto-refresh every 60 seconds
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(fetchQuotaData, 60000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const getProgressColor = (percentage) => {
        if (percentage >= 90) return "bg-red-500";
        if (percentage >= 80) return "bg-orange-500";
        if (percentage >= 60) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getAlertColor = (alertLevel) => {
        switch (alertLevel) {
            case "critical": return "bg-red-100 border-red-300 text-red-800";
            case "warning": return "bg-orange-100 border-orange-300 text-orange-800";
            case "caution": return "bg-yellow-100 border-yellow-300 text-yellow-800";
            default: return "bg-green-100 border-green-300 text-green-800";
        }
    };

    const getAlertIcon = (alertLevel) => {
        if (alertLevel === "normal") return <CheckCircle size={20} />;
        return <AlertTriangle size={20} />;
    };

    const getAlertMessage = (alertLevel) => {
        switch (alertLevel) {
            case "critical":
                return "⚠️ CRITICAL: You're using over 90% of your daily quota! Quota will reset soon.";
            case "warning":
                return "⚠️ WARNING: You're using over 80% of your daily quota. Consider optimizing queries.";
            case "caution":
                return "⚠️ CAUTION: You're using over 60% of your daily quota. Monitor usage closely.";
            default:
                return "✅ All systems normal. Quota usage is healthy.";
        }
    };

    const exportReport = () => {
        const report = {
            timestamp: new Date().toISOString(),
            ...quotaData
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quota-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading && !quotaData) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-blue-500" size={40} />
                    <p className="text-slate-600">Loading quota data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="text-red-600" size={24} />
                    <h3 className="text-lg font-bold text-red-800">Error Loading Quota Data</h3>
                </div>
                <p className="text-red-700">{error}</p>
                <button
                    onClick={fetchQuotaData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    const { quota, alertLevel, resetInfo, querySources, note } = quotaData || {};

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Database className="text-blue-600" size={32} />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Firestore Quota Monitor</h1>
                        <p className="text-sm text-slate-500">Real-time database usage tracking</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${autoRefresh
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''} />
                        Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
                    </button>
                    <button
                        onClick={fetchQuotaData}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition disabled:opacity-50"
                    >
                        Refresh Now
                    </button>
                    <button
                        onClick={exportReport}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition"
                    >
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Alert Banner */}
            {alertLevel && (
                <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${getAlertColor(alertLevel)}`}>
                    {getAlertIcon(alertLevel)}
                    <p className="font-bold flex-1">{getAlertMessage(alertLevel)}</p>
                    <div className="text-xs opacity-75">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                </div>
            )}

            {/* Total Quota Progress Bar */}
            {quota && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Total Quota Usage Today</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Combined reads, writes, and deletes</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-slate-800 dark:text-white">
                                {(() => {
                                    const totalUsed = quota.reads.used + quota.writes.used + quota.deletes.used;
                                    const totalLimit = quota.reads.limit + quota.writes.limit + quota.deletes.limit;
                                    const totalPercentage = Math.min((totalUsed / totalLimit) * 100, 100);
                                    return totalPercentage.toFixed(1);
                                })()}%
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">of daily limit</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative w-full h-8 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`absolute top-0 left-0 h-full transition-all duration-500 ${(() => {
                                const totalUsed = quota.reads.used + quota.writes.used + quota.deletes.used;
                                const totalLimit = quota.reads.limit + quota.writes.limit + quota.deletes.limit;
                                const totalPercentage = (totalUsed / totalLimit) * 100;
                                return getProgressColor(totalPercentage);
                            })()}`}
                            style={{
                                width: `${(() => {
                                    const totalUsed = quota.reads.used + quota.writes.used + quota.deletes.used;
                                    const totalLimit = quota.reads.limit + quota.writes.limit + quota.deletes.limit;
                                    return Math.min((totalUsed / totalLimit) * 100, 100);
                                })()}%`
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                {(quota.reads.used + quota.writes.used + quota.deletes.used).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Used</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                {(quota.reads.limit + quota.writes.limit + quota.deletes.limit).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Total Limit</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {(quota.reads.remaining + quota.writes.remaining + quota.deletes.remaining).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Remaining</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Timer */}
            {resetInfo && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock size={32} />
                            <div>
                                <h3 className="text-lg font-bold">Time Until Quota Reset</h3>
                                <p className="text-sm opacity-90">Resets at {resetInfo.nextResetTime}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-black">
                                {resetInfo.hoursUntilReset}h {resetInfo.minutesUntilReset}m
                            </p>
                            <p className="text-xs opacity-75">remaining</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quota Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Reads */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase">Reads</h3>
                        <Activity className="text-blue-500" size={20} />
                    </div>
                    <div className="mb-4">
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-3xl font-black text-slate-800 dark:text-white">
                                {quota?.reads.used.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-500">
                                / {quota?.reads.limit.toLocaleString()}
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${getProgressColor(quota?.reads.percentage || 0)}`}
                                style={{ width: `${Math.min(quota?.reads.percentage || 0, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="font-bold text-slate-600 dark:text-slate-400">
                                {quota?.reads.percentage.toFixed(1)}% used
                            </span>
                            <span className="text-slate-500">
                                {quota?.reads.remaining.toLocaleString()} remaining
                            </span>
                        </div>
                    </div>
                </div>

                {/* Writes */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase">Writes</h3>
                        <TrendingUp className="text-green-500" size={20} />
                    </div>
                    <div className="mb-4">
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-3xl font-black text-slate-800 dark:text-white">
                                {quota?.writes.used.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-500">
                                / {quota?.writes.limit.toLocaleString()}
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${getProgressColor(quota?.writes.percentage || 0)}`}
                                style={{ width: `${Math.min(quota?.writes.percentage || 0, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="font-bold text-slate-600 dark:text-slate-400">
                                {quota?.writes.percentage.toFixed(1)}% used
                            </span>
                            <span className="text-slate-500">
                                {quota?.writes.remaining.toLocaleString()} remaining
                            </span>
                        </div>
                    </div>
                </div>

                {/* Deletes */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase">Deletes</h3>
                        <AlertTriangle className="text-red-500" size={20} />
                    </div>
                    <div className="mb-4">
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-3xl font-black text-slate-800 dark:text-white">
                                {quota?.deletes.used.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-500">
                                / {quota?.deletes.limit.toLocaleString()}
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${getProgressColor(quota?.deletes.percentage || 0)}`}
                                style={{ width: `${Math.min(quota?.deletes.percentage || 0, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="font-bold text-slate-600 dark:text-slate-400">
                                {quota?.deletes.percentage.toFixed(1)}% used
                            </span>
                            <span className="text-slate-500">
                                {quota?.deletes.remaining.toLocaleString()} remaining
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Query Sources Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Top Query Sources</h2>
                <div className="space-y-3">
                    {querySources?.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-slate-300">#{index + 1}</span>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white">{source.name}</p>
                                    <p className="text-xs text-slate-500 capitalize">Category: {source.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {source.reads > 0 && (
                                    <p className="text-sm text-blue-600 font-bold">{source.reads.toLocaleString()} reads</p>
                                )}
                                {source.writes > 0 && (
                                    <p className="text-sm text-green-600 font-bold">{source.writes.toLocaleString()} writes</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Optimization Recommendations */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-900">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" size={20} />
                    Optimization Recommendations
                </h2>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Reduce analytics query limit from 500 to 100 documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Implement caching for frequently accessed data (categories, newspapers)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Use pagination instead of loading all articles at once</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Move search operations to server-side for better query efficiency</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Consider upgrading to Blaze plan if consistently exceeding 70% daily quota</span>
                    </li>
                </ul>
            </div>

            {/* Note */}
            {note && (
                <div className="text-xs text-slate-500 text-center italic bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                    {note}
                </div>
            )}
        </div>
    );
}
