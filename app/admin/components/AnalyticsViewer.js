"use client";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { MapPin, Monitor, Smartphone, Globe, Calendar, TrendingUp, BarChart2, Zap, Users, PieChart as PieIcon, ArrowUpRight, RefreshCw, AlertTriangle } from 'lucide-react';

// --- SVG Chart Helpers ---
const SimplePieChart = ({ data, colors }) => {
    let cumulativePercent = 0;
    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    if (!data || data.length === 0) return <div className="flex items-center justify-center h-40 text-slate-300">No Data</div>;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="flex items-center gap-8">
            <svg viewBox="-1 -1 2 2" className="w-32 h-32 transform -rotate-90">
                {data.map((slice, i) => {
                    const percent = slice.value / total;
                    if (percent === 0) return null;
                    const start = getCoordinatesForPercent(cumulativePercent);
                    cumulativePercent += percent;
                    const end = getCoordinatesForPercent(cumulativePercent);
                    const largeArcFlag = percent > 0.5 ? 1 : 0;
                    const pathData = `M 0 0 L ${start[0]} ${start[1]} A 1 1 0 ${largeArcFlag} 1 ${end[0]} ${end[1]} L 0 0`;
                    return <path key={i} d={pathData} fill={colors[i % colors.length]} />;
                })}
            </svg>
            <div className="space-y-2 text-xs">
                {data.map((slice, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{slice.label}</span>
                        <span className="text-slate-400">({Math.round((slice.value / total) * 100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SimpleLineChart = ({ data, color = "#3b82f6" }) => {
    if (!data || data.length < 2) return <div className="flex items-center justify-center h-32 text-slate-300">Not enough data</div>;
    const max = Math.max(...data.map(d => d.value));
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d.value / max) * 100;
        return `${x},${y}`;
    }).join(" ");

    return (
        <div className="w-full h-32 relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - (d.value / max) * 100;
                    return <circle key={i} cx={x} cy={y} r="1.5" fill={color} />;
                })}
            </svg>
            <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                {data.map((d, i) => <span key={i}>{d.label}</span>)}
            </div>
        </div>
    );
};


export default function AnalyticsViewer() {
    // Data States
    const [visits, setVisits] = useState([]);
    const [topArticles, setTopArticles] = useState([]);
    const [stats, setStats] = useState({ today: 0, month: 0, lifetime: 0, activeNow: 0 });
    const [prevStats, setPrevStats] = useState({ today: 0, month: 0 }); // For trend calculation
    const [deviceData, setDeviceData] = useState([]);
    const [sourceData, setSourceData] = useState([]);
    const [countryData, setCountryData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [referrers, setReferrers] = useState([]);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Enhanced UX States
    const [timeRange, setTimeRange] = useState('today'); // 'today', '7days', '30days', 'all'
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [sortBy, setSortBy] = useState('time'); // 'time', 'source', 'country'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);

    // Get date range based on filter
    const getDateRange = () => {
        const now = new Date();
        switch (timeRange) {
            case 'today':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case '7days':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30days':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            default:
                return null; // 'all' - no filter
        }
    };

    // Fetch Logs with time range filtering
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const startDate = getDateRange();
            let q;

            if (startDate) {
                q = query(
                    collection(db, "analytics"),
                    where("timestamp", ">=", startDate),
                    orderBy("timestamp", "desc"),
                    limit(500)
                );
            } else {
                q = query(collection(db, "analytics"), orderBy("timestamp", "desc"), limit(500));
            }

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => {
                const d = doc.data();
                const ts = d.timestamp;
                const dateObj = ts && typeof ts.toDate === 'function' ? ts.toDate() : new Date();
                return {
                    id: doc.id,
                    ...d,
                    timestampObj: dateObj,
                    timeStr: dateObj.toLocaleString()
                };
            });
            setVisits(data);
            calculateDeepStats(data);
            setLastUpdated(new Date());
            setError(null);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            setError(error.message);
        }
        setLoading(false);
    };

    // Initial fetch
    useEffect(() => {
        fetchLogs();
    }, [timeRange]); // Re-fetch when time range changes

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            fetchLogs();
        }, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, [autoRefresh, timeRange]);

    // Fetch Top Articles
    useEffect(() => {
        const fetchTop = async () => {
            const q = query(collection(db, "articles"), orderBy("views", "desc"), limit(10));
            const snap = await getDocs(q);
            setTopArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        fetchTop();
    }, []);


    const calculateDeepStats = (data) => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

        // Core Counts
        const todayCount = data.filter(v => v.timestampObj >= startOfDay).length;
        const monthCount = data.filter(v => v.timestampObj >= startOfMonth).length;

        // Previous Period Comparison for Trends
        const yesterdayStart = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);
        const yesterdayCount = data.filter(v =>
            v.timestampObj >= yesterdayStart && v.timestampObj < startOfDay
        ).length;

        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthCount = data.filter(v =>
            v.timestampObj >= lastMonthStart && v.timestampObj < lastMonthEnd
        ).length;

        setPrevStats({
            today: yesterdayCount,
            month: lastMonthCount
        });

        // Live Visitors (Unique IPs in last 5 mins)
        // Logic: Count unique IPs, not individual page views
        // If same IP opens 5 tabs, it counts as 1 live visitor
        const recentLogs = data.filter(v => v.timestampObj >= fiveMinutesAgo);
        const uniqueActiveIPs = new Set(recentLogs.map(l => l.ip)).size;
        const activeCount = uniqueActiveIPs;

        // Debug: Log for verification
        console.log('Live Visitor Debug:', {
            totalRecentLogs: recentLogs.length,
            uniqueIPs: uniqueActiveIPs,
            recentIPs: [...new Set(recentLogs.map(l => l.ip))]
        });

        // Active PWA Users
        const pwaLogs = recentLogs.filter(l => l.isPWA || l.source === 'PWA');
        const activePWACount = new Set(pwaLogs.map(l => l.ip)).size;

        // Device Breakdown
        const devMap = { Mobile: 0, Desktop: 0 };
        data.forEach(v => {
            if (v.mobile) devMap.Mobile++; else devMap.Desktop++;
        });
        setDeviceData([
            { label: 'Mobile', value: devMap.Mobile },
            { label: 'Desktop', value: devMap.Desktop },
        ]);

        // Source Breakdown
        const sourceMap = { Direct: 0, Social: 0, Search: 0, Referral: 0, PWA: 0 };
        data.forEach(v => {
            const s = v.source || 'Direct';
            sourceMap[s] = (sourceMap[s] || 0) + 1;
        });
        setSourceData(Object.entries(sourceMap).map(([k, v]) => ({ label: k, value: v })).filter(d => d.value > 0));

        // Country Breakdown
        const countryMap = {};
        data.forEach(v => {
            const c = v.country || 'Unknown';
            countryMap[c] = (countryMap[c] || 0) + 1;
        });
        setCountryData(Object.entries(countryMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([k, v]) => ({ label: k, value: v })));

        // Referrers List
        const refMap = {};
        data.forEach(v => {
            if (v.referrer && v.source !== 'Direct') {
                try {
                    const host = new URL(v.referrer).hostname.replace('www.', '');
                    refMap[host] = (refMap[host] || 0) + 1;
                } catch (e) { }
            }
        });
        setReferrers(Object.entries(refMap).sort((a, b) => b[1] - a[1]).slice(0, 5));

        // Weekly Trends
        const dayBuckets = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { weekday: 'short' });
            dayBuckets[key] = 0;
        }
        data.forEach(v => {
            if (v.timestampObj) {
                const day = v.timestampObj.toLocaleDateString('en-US', { weekday: 'short' });
                if (dayBuckets[day] !== undefined) dayBuckets[day]++;
            }
        });
        setWeeklyData(Object.entries(dayBuckets).map(([k, v]) => ({ label: k, value: v })));

        setStats({
            today: todayCount,
            month: monthCount,
            lifetime: 1250 + data.length,
            activeNow: activeCount,
            activePWA: activePWACount
        });
    };

    // Calculate trend percentage
    const getTrend = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    // Sort and paginate visits
    const getSortedVisits = () => {
        let sorted = [...visits];

        // Sort
        sorted.sort((a, b) => {
            let aVal, bVal;
            switch (sortBy) {
                case 'source':
                    aVal = a.source || 'Direct';
                    bVal = b.source || 'Direct';
                    break;
                case 'country':
                    aVal = a.country || 'Unknown';
                    bVal = b.country || 'Unknown';
                    break;
                default: // 'time'
                    aVal = a.timestampObj;
                    bVal = b.timestampObj;
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        // Paginate
        const startIndex = (currentPage - 1) * rowsPerPage;
        return sorted.slice(startIndex, startIndex + rowsPerPage);
    };

    const totalPages = Math.ceil(visits.length / rowsPerPage);
    const paginatedVisits = getSortedVisits();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <p className="text-sm font-bold">
                        Failed to load analytics data. {error.includes("permission") ? "You may not have permission to view logs." : "Please try refreshing."}
                    </p>
                </div>
            )}

            {/* Enhanced Controls Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Time Range Filters */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase mr-2">Time Range:</span>
                        {['today', '7days', '30days', 'all'].map((range) => (
                            <button
                                key={range}
                                onClick={() => { setTimeRange(range); setCurrentPage(1); }}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === range
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {range === 'today' ? 'Today' : range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'All Time'}
                            </button>
                        ))}
                    </div>

                    {/* Auto-Refresh Controls */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${autoRefresh
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''} />
                                {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
                            </button>
                            <button
                                onClick={fetchLogs}
                                disabled={loading}
                                className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-all disabled:opacity-50"
                            >
                                Refresh Now
                            </button>
                        </div>
                        <div className="text-xs text-slate-500">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards with Trends */}
            {/* 1. Header & Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg shadow-blue-200 text-white">
                    <div className="flex items-center gap-2 mb-2 opacity-90 justify-between">
                        <div className="flex items-center gap-2">
                            <Zap size={18} /> <h3 className="text-sm font-bold uppercase">Live Visitors</h3>
                        </div>
                        <button onClick={fetchLogs} className="hover:bg-white/20 p-1 rounded transition" title="Refresh Data">
                            <RefreshCw size={14} />
                        </button>
                    </div>
                    <p className="text-4xl font-black">{stats.activeNow}</p>
                    <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Live
                    </div>
                </div>

                <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-4 rounded-xl shadow-lg shadow-rose-200 text-white">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Smartphone size={18} /> <h3 className="text-sm font-bold uppercase">App Users</h3>
                    </div>
                    <p className="text-4xl font-black">{stats.activePWA || 0}</p>
                    <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Live
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Today's Visits</h3>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.today}</p>
                        {prevStats.today > 0 && (
                            <div className={`flex items-center gap-1 text-xs font-bold ${getTrend(stats.today, prevStats.today) >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {getTrend(stats.today, prevStats.today) >= 0 ? '↑' : '↓'}
                                {Math.abs(getTrend(stats.today, prevStats.today))}%
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">vs yesterday</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Monthly</h3>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.month}</p>
                        {prevStats.month > 0 && (
                            <div className={`flex items-center gap-1 text-xs font-bold ${getTrend(stats.month, prevStats.month) >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {getTrend(stats.month, prevStats.month) >= 0 ? '↑' : '↓'}
                                {Math.abs(getTrend(stats.month, prevStats.month))}%
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">vs last month</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Top Country</h3>
                    <div className="flex items-center gap-2">
                        <Globe size={24} className="text-indigo-500" />
                        <p className="text-lg font-bold text-slate-800 dark:text-white truncate">
                            {countryData[0]?.label || 'Unknown'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Left Column: Traffic Charts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Weekly Report */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Weekly Visitors</h2>
                        <SimpleLineChart data={weeklyData} color="#ef4444" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Traffic Sources */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                            <h2 className="text-sm font-bold text-slate-500 uppercase mb-4">Traffic Sources</h2>
                            <SimplePieChart data={sourceData} colors={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']} />
                        </div>

                        {/* Device Breakdown */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                            <h2 className="text-sm font-bold text-slate-500 uppercase mb-4">Device Usage</h2>
                            <SimplePieChart data={deviceData} colors={['#8b5cf6', '#ec4899']} />
                        </div>
                    </div>

                    {/* Live Visitor Table - Enhanced */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Users size={18} className="text-blue-500" /> Recent Activity
                            </h2>
                            <div className="flex items-center gap-4">
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                    className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                                >
                                    <option value={10}>10 rows</option>
                                    <option value={15}>15 rows</option>
                                    <option value={25}>25 rows</option>
                                    <option value={50}>50 rows</option>
                                </select>
                                <span className="text-xs text-slate-500">
                                    {visits.length} total visits
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                <thead className="bg-slate-50 dark:bg-slate-900 uppercase text-xs font-bold text-slate-500">
                                    <tr>
                                        <th
                                            className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                            onClick={() => {
                                                if (sortBy === 'time') {
                                                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                                                } else {
                                                    setSortBy('time');
                                                    setSortOrder('desc');
                                                }
                                            }}
                                        >
                                            Time {sortBy === 'time' && (sortOrder === 'desc' ? '↓' : '↑')}
                                        </th>
                                        <th
                                            className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                            onClick={() => {
                                                if (sortBy === 'source') {
                                                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                                                } else {
                                                    setSortBy('source');
                                                    setSortOrder('asc');
                                                }
                                            }}
                                        >
                                            Source {sortBy === 'source' && (sortOrder === 'desc' ? '↓' : '↑')}
                                        </th>
                                        <th className="px-4 py-3">Page</th>
                                        <th
                                            className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                            onClick={() => {
                                                if (sortBy === 'country') {
                                                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                                                } else {
                                                    setSortBy('country');
                                                    setSortOrder('asc');
                                                }
                                            }}
                                        >
                                            Country {sortBy === 'country' && (sortOrder === 'desc' ? '↓' : '↑')}
                                        </th>
                                        <th className="px-4 py-3">Device</th>
                                    </tr>
                                </thead>

                                {/* Desktop Table Body */}
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs hidden md:table-row-group">
                                    {loading ? (
                                        <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                                    ) : paginatedVisits.length === 0 ? (
                                        <tr><td colSpan="5" className="p-4 text-center text-slate-400">No visits in this time range</td></tr>
                                    ) : paginatedVisits.map((v) => (
                                        <tr key={v.id} onClick={() => setSelectedVisit(v)} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition">
                                            <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                                                {v.timestampObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                <br />
                                                {v.timestampObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${v.source === 'Social' ? 'bg-indigo-100 text-indigo-700' : v.source === 'Search' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {v.source || 'Direct'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                                                <a
                                                    href={v.path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 hover:underline truncate block"
                                                    title={v.path}
                                                >
                                                    {v.path}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3">{v.country || '-'}</td>
                                            <td className="px-4 py-3">{v.mobile ? '📱' : '💻'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Mobile Card Layout */}
                            <div className="md:hidden space-y-3">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-400">Loading...</div>
                                ) : paginatedVisits.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">No visits in this time range</div>
                                ) : paginatedVisits.map((v) => (
                                    <div
                                        key={v.id}
                                        onClick={() => setSelectedVisit(v)}
                                        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 active:scale-98 transition-transform touch-manipulation"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="text-xs text-slate-500">
                                                <div className="font-bold text-slate-700 dark:text-slate-300">
                                                    {v.timestampObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="text-slate-400">
                                                    {v.timestampObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${v.source === 'Social' ? 'bg-indigo-100 text-indigo-700' : v.source === 'Search' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {v.source || 'Direct'}
                                                </span>
                                                <span className="text-lg">{v.mobile ? '📱' : '💻'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-start gap-2">
                                                <span className="text-slate-400 text-xs font-bold min-w-[60px]">Page:</span>
                                                <a
                                                    href={v.path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 hover:underline flex-1 break-all text-xs"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {v.path}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 text-xs font-bold min-w-[60px]">Location:</span>
                                                <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">{v.country || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-8 h-8 text-xs font-bold rounded transition ${currentPage === pageNum
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Right Column: Top Articles & Referrers */}
                <div className="space-y-6">
                    {/* Top Articles */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart2 size={18} className="text-red-500" /> Most Viewed
                        </h2>
                        <div className="space-y-3">
                            {topArticles.length === 0 ? <p className="text-sm text-slate-400">No views recorded yet.</p> : topArticles.map((art, i) => (
                                <div key={art.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 dark:border-slate-700 last:border-0">
                                    <span className="text-lg font-bold text-slate-300 w-6">#{i + 1}</span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2">{art.headline}</p>
                                        <p className="text-xs text-slate-500 mt-1">{art.views || 0} views</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Referrers */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <ArrowUpRight size={18} className="text-green-500" /> Top Referrers
                        </h2>
                        <div className="space-y-2">
                            {referrers.length === 0 ? <p className="text-xs text-slate-400">No referral traffic yet.</p> : referrers.map(([host, count], i) => (
                                <div key={i} className="flex justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded text-sm">
                                    <span className="font-medium truncate max-w-[150px]">{host}</span>
                                    <span className="font-bold text-slate-600 dark:text-slate-300">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Country Breakdown (Simple List) */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Globe size={18} className="text-blue-500" /> Top Countries
                        </h2>
                        <div className="space-y-2">
                            {countryData.map((d, i) => (
                                <div key={i} className="flex items-center justify-between text-sm border-b border-slate-50 dark:border-slate-700 pb-2 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">#{i + 1}</span>
                                        <span>{d.label}</span>
                                    </div>
                                    <span className="font-bold">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal (Kept same logic) */}
            {selectedVisit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedVisit(null)}>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Visitor Details</h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${selectedVisit.source === 'Social' ? 'bg-indigo-100 text-indigo-700' : selectedVisit.source === 'Search' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {selectedVisit.source || 'Direct'}
                                </span>
                            </div>
                            <button onClick={() => setSelectedVisit(null)} className="text-slate-400 hover:text-red-500 font-bold">✕</button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded">
                                <p className="text-xs font-bold text-slate-400 uppercase">Page Visited</p>
                                <p className="font-medium dark:text-slate-200 text-blue-600 break-all">{selectedVisit.path || '/'}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded">
                                <p className="text-xs font-bold text-slate-400 uppercase">Location</p>
                                <p className="font-medium dark:text-slate-200">{selectedVisit.city || 'Unknown'}, {selectedVisit.country || 'Unknown'}</p>
                                <p className="text-xs text-slate-500">{selectedVisit.ip}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded">
                                <p className="text-xs font-bold text-slate-400 uppercase">Referrer</p>
                                <p className="font-medium dark:text-slate-200 break-all">{selectedVisit.referrer || 'None (Direct)'}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded">
                                <p className="text-xs font-bold text-slate-400 uppercase">Device</p>
                                <p className="font-medium dark:text-slate-200">{selectedVisit.platform} ({selectedVisit.mobile ? 'Mobile' : 'Desktop'})</p>
                                <p className="text-xs text-slate-500 break-all">{selectedVisit.userAgent}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
