"use client";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs, where } from 'firebase/firestore';
import { MapPin, Monitor, Smartphone, Globe, Calendar, TrendingUp, BarChart2, Zap, Users, PieChart as PieIcon, ArrowUpRight } from 'lucide-react';

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
    const [visits, setVisits] = useState([]); // Raw visits (active session check)
    const [topArticles, setTopArticles] = useState([]);
    const [stats, setStats] = useState({ today: 0, month: 0, lifetime: 0, activeNow: 0 });
    const [deviceData, setDeviceData] = useState([]);
    const [sourceData, setSourceData] = useState([]);
    const [countryData, setCountryData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [referrers, setReferrers] = useState([]);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Real-time Logs (Last 200 for broader calculations)
    useEffect(() => {
        const q = query(collection(db, "analytics"), orderBy("timestamp", "desc"), limit(200));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestampObj: doc.data().timestamp?.toDate(),
                timeStr: doc.data().timestamp?.toDate().toLocaleString() || 'Just now'
            }));
            setVisits(data);
            calculateDeepStats(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 2. Fetch Top Articles
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
        const activeCount = data.filter(v => v.timestampObj >= fiveMinutesAgo).length;

        // Device Breakdown
        const devMap = { Mobile: 0, Desktop: 0 };
        data.forEach(v => {
            if (v.mobile) devMap.Mobile++; else devMap.Desktop++;
        });
        setDeviceData([
            { label: 'Mobile', value: devMap.Mobile },
            { label: 'Desktop', value: devMap.Desktop }
        ]);

        // Source Breakdown
        const sourceMap = { Direct: 0, Social: 0, Search: 0, Referral: 0 };
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
            .slice(0, 5) // Top 5
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

        // Weekly Trends (Simulated from limited data for now, ideally needs daily aggregation)
        // Since we only hold 200 items, we can bucket them by day if they span enough time, 
        // otherwise we just show "Today" slots. For MVP we'll show last 7 fake buckets scaled by activity 
        // to demonstrate the UI if data is sparse, or real buckets if dense.
        // Let's do Real Buckets by Day
        const dayBuckets = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { weekday: 'short' });
            dayBuckets[key] = 0; // Initialize
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
            activeNow: activeCount
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 1. Header & Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg shadow-blue-200 text-white">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Zap size={18} /> <h3 className="text-sm font-bold uppercase">Active Users</h3>
                    </div>
                    <p className="text-4xl font-black">{stats.activeNow}</p>
                    <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Live
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Today's Visits</h3>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.today}</p>
                        <TrendingUp size={20} className="text-green-500 mb-1" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Monthly</h3>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.month}</p>
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

                    {/* Live Visitor Table */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Users size={18} className="text-blue-500" /> Recent Visitors
                            </h2>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-bold animate-pulse">Live</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                <thead className="bg-slate-50 dark:bg-slate-900 uppercase text-xs font-bold text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Time</th>
                                        <th className="px-4 py-3">Source</th>
                                        <th className="px-4 py-3">Page</th>
                                        <th className="px-4 py-3">Loc</th>
                                        <th className="px-4 py-3">Dev</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                                    {loading ? <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr> : visits.slice(0, 15).map((v) => (
                                        <tr key={v.id} onClick={() => setSelectedVisit(v)} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition">
                                            <td className="px-4 py-2 whitespace-nowrap text-slate-400">{v.timeStr.split(',')[1]}</td>
                                            <td className="px-4 py-2 font-medium">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${v.source === 'Social' ? 'bg-indigo-100 text-indigo-700' : v.source === 'Search' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {v.source || 'Direct'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-blue-600 truncate max-w-[120px]">{v.path}</td>
                                            <td className="px-4 py-2">{v.country || '-'}</td>
                                            <td className="px-4 py-2">{v.mobile ? '📱' : '💻'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
