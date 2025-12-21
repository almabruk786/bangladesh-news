import { useState, useEffect } from "react";
import { X, Search, AlertTriangle, CheckCircle, BarChart3, Smartphone, Zap, TrendingUp } from "lucide-react";
import { analyzeContent } from "../utils/seoLogic";

export default function SeoSidebar({ form, visible, onClose }) {
    const [report, setReport] = useState(null);
    const [activeTab, setActiveTab] = useState('seo'); // seo, discover, keywords

    // Real-time analysis (RequestIdleCallback or Debounce could be used, using useEffect for simplicity with fast logic)
    useEffect(() => {
        if (!visible) return;
        const result = analyzeContent(form);
        setReport(result);
    }, [form.title, form.content, form.tags, form.imageUrls, visible]);

    if (!visible) return null;

    // Report is null initially?
    if (!report) return <div className="w-80 h-full bg-white border-l border-slate-200 p-4">Loading...</div>;

    const getScoreColor = (s) => {
        if (s >= 80) return "text-green-500";
        if (s >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    const getRingColor = (s) => {
        if (s >= 80) return "stroke-green-500";
        if (s >= 50) return "stroke-yellow-500";
        return "stroke-red-500";
    };

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-slate-200 z-[60] flex flex-col animate-in slide-in-from-right-full duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                    <BarChart3 className="text-blue-600" size={20} />
                    <h2 className="font-bold text-slate-800">SEO Auditor</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                    <X size={20} />
                </button>
            </div>

            {/* Score Section */}
            <div className="p-6 flex flex-col items-center justify-center border-b border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white -z-10"></div>

                {/* Score Ring */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="56" className="stroke-slate-100" strokeWidth="12" fill="none" />
                        <circle
                            cx="64" cy="64" r="56"
                            className={`${getRingColor(report.score)} transition-all duration-1000 ease-out`}
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray="351"
                            strokeDashoffset={351 - (351 * report.score) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className={`text-3xl font-bold ${getScoreColor(report.score)}`}>{report.score}</span>
                        <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </div>
                </div>
                <p className="mt-2 font-medium text-slate-600">
                    {report.score >= 80 ? 'Excellent Optimization! 🚀' : report.score >= 50 ? 'Needs Improvement 🛠️' : 'Critical Issues Found ⚠️'}
                </p>

                {/* New Metrics Badges */}
                <div className="grid grid-cols-2 gap-2 mt-4 w-full px-4">
                    <div className="bg-slate-100 rounded-lg p-2 text-center">
                        <div className="text-[10px] uppercase text-slate-500 font-bold">Emotion</div>
                        <div className="text-sm font-bold text-slate-800">{report.sentiment.label}</div>
                    </div>
                    <div className="bg-slate-100 rounded-lg p-2 text-center">
                        <div className="text-[10px] uppercase text-slate-500 font-bold">Readability</div>
                        <div className={`text-sm font-bold ${report.readability.score === 'Hard' ? 'text-red-500' : 'text-slate-800'}`}>
                            {report.readability.score}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('seo')}
                    className={`flex-1 py-3 text-xs font-bold flex flex-col items-center gap-1 ${activeTab === 'seo' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Search size={14} /> SEO Check
                </button>
                <button
                    onClick={() => setActiveTab('discover')}
                    className={`flex-1 py-3 text-xs font-bold flex flex-col items-center gap-1 ${activeTab === 'discover' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Zap size={14} /> Discover
                </button>
                <button
                    onClick={() => setActiveTab('keywords')}
                    className={`flex-1 py-3 text-xs font-bold flex flex-col items-center gap-1 ${activeTab === 'keywords' ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <TrendingUp size={14} /> Keywords
                </button>
            </div>

            {/* Results Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">

                {/* SEO TAB */}
                {activeTab === 'seo' && (
                    <div className="space-y-3">
                        {report.criticals.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                <h3 className="text-xs font-bold text-red-700 flex items-center gap-1 mb-2">
                                    <AlertTriangle size={14} /> Critical Fixes
                                </h3>
                                <ul className="space-y-1">
                                    {report.criticals.map((msg, i) => (
                                        <li key={i} className="text-red-600 text-xs flex items-start gap-2">
                                            <span className="mt-0.5 max-w-[4px] h-1 w-1 bg-red-400 rounded-full shrink-0"></span>
                                            {msg}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {report.problems.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                                <h3 className="text-xs font-bold text-yellow-700 flex items-center gap-1 mb-2">
                                    <AlertTriangle size={14} /> Warnings
                                </h3>
                                <ul className="space-y-1">
                                    {report.problems.map((msg, i) => (
                                        <li key={i} className="text-yellow-700 text-xs flex items-start gap-2">
                                            <span className="mt-0.5 max-w-[4px] h-1 w-1 bg-yellow-500 rounded-full shrink-0"></span>
                                            {msg}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <h3 className="text-xs font-bold text-green-700 flex items-center gap-1 mb-2">
                                <CheckCircle size={14} /> Good Job
                            </h3>
                            <ul className="space-y-1">
                                {report.goodPoints.map((msg, i) => (
                                    <li key={i} className="text-green-700 text-xs flex items-start gap-2">
                                        <span className="mt-0.5 max-w-[4px] h-1 w-1 bg-green-500 rounded-full shrink-0"></span>
                                        {msg}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Readability Details */}
                        <div className="text-[10px] text-slate-400 text-center pt-2">
                            Avg Sentence Length: {report.readability.avgSentenceLength} words
                            {report.readability.passiveCount > 0 && <span> • Passive Voice: {report.readability.passiveCount}x</span>}
                        </div>
                    </div>
                )}

                {/* DISCOVER TAB */}
                {activeTab === 'discover' && (
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center
                             ${report.discover.isEligible ? 'border-purple-200 bg-purple-50' : 'border-slate-200 bg-white'}`}>
                            {report.discover.isEligible ? (
                                <Zap className="text-purple-600 mb-2" size={32} />
                            ) : (
                                <Smartphone className="text-slate-400 mb-2" size={32} />
                            )}
                            <h3 className="font-bold text-slate-800">
                                {report.discover.isEligible ? 'Discover Ready! 🌟' : 'Not Ready for Feed'}
                            </h3>
                            <div className="mt-2 text-xs text-slate-500 space-y-1">
                                {report.discover.reasons.map((r, i) => <div key={i}>{r}</div>)}
                            </div>
                        </div>

                        {/* Google Preview Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Google Preview</h4>
                            <div className="flex gap-3">
                                {form.imageUrls[0] && (
                                    <div className="w-16 h-16 rounded overflow-hidden shrink-0 bg-slate-100">
                                        <img src={form.imageUrls[0]} className="w-full h-full object-cover" alt="prev" />
                                    </div>
                                )}
                                <div>
                                    <div className="text-xs text-slate-500 mb-0.5">bangladesh-news.com › news</div>
                                    <div className="text-sm font-medium text-blue-800 line-clamp-2 leading-tight hover:underline cursor-pointer">
                                        {form.title || "Your Headline Will Appear Here..."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* KEYWORDS TAB */}
                {activeTab === 'keywords' && (
                    <div>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="p-3">Keyword</th>
                                        <th className="p-3">Count</th>
                                        <th className="p-3">Density</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {report.keywords.map((k, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-700">{k.word}</td>
                                            <td className="p-3 text-slate-500">{k.count}</td>
                                            <td className="p-3 text-slate-500">{k.density}</td>
                                        </tr>
                                    ))}
                                    {report.keywords.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-4 text-center text-slate-400 italic">No significant keywords found yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-2 text-[10px] text-slate-400 p-2">
                            * Stop words like 'এবং', 'না', 'কি' are automatically filtered out.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
