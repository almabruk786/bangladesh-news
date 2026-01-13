import {
    LayoutDashboard, FileText, PlusCircle, Users, Megaphone, Settings, LogOut, Tags, Mail, BarChart3, Bot, Newspaper, MessageSquare, Clock, Database
} from "lucide-react";

export default function Sidebar({ user, activeTab, setActiveTab, logout, isOpen, onClose }) {
    const menuItems = [
        // Common
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, role: "all" },
        { id: "manual", label: "Write News", icon: PlusCircle, role: "all" },
        { id: "namaz", label: "Namaz Times", icon: Clock, role: "all" },

        // Admin Specific Order
        { id: "pending", label: "Inbox (Pending)", icon: FileText, role: "admin" },
        { id: "comments", label: "Comments", icon: MessageSquare, role: "admin" },
        { id: "messages", label: "Messages", icon: Mail, role: "admin" },
        { id: "manage", label: "All News", icon: Newspaper, role: "admin" },
        { id: "category", label: "Categories", icon: Tags, role: "admin" },
        { id: "users", label: "Team", icon: Users, role: "admin" },
        { id: "ads", label: "Monetization", icon: Megaphone, role: "admin" },
        { id: "analytics", label: "Visitor Analytics", icon: BarChart3, role: "admin" },
        { id: "quota", label: "Quota Monitor", icon: Database, role: "admin" },
        { id: "epaper", label: "E-Paper Manager", icon: FileText, role: "admin" },
        { id: "auto", label: "AI Control", icon: Bot, role: "admin" },

        // Publisher Specific
        { id: "my_news", label: "My Stories", icon: FileText, role: "publisher" },
        { id: "messages", label: "Messages", icon: Mail, role: "publisher" },
    ];

    const filteredItems = menuItems.filter((item, index, self) =>
        index === self.findIndex((t) => (
            t.id === item.id && t.role === item.role
        ))
    );

    return (
        <aside className={`
            fixed inset-y-0 left-0 z-50 w-72 h-[100dvh] flex flex-col
            bg-white/80 backdrop-blur-2xl border-r border-white/20 shadow-[8px_0_30px_rgba(0,0,0,0.04)]
            transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
            md:translate-x-0 md:static md:h-screen md:sticky md:top-0
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
            {/* Glossy Header */}
            <div className="p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>

                <div className="relative z-10 text-white">
                    <h1 className="font-black text-2xl tracking-tight flex items-center gap-2">
                        <span className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md shadow-inner">
                            <Bot size={20} className="text-white" />
                        </span>
                        Prime<span className="text-indigo-200">Control</span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-100 mt-2 font-semibold">
                        CMS Version 3.0
                    </p>
                </div>

                {/* Mobile Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 md:hidden text-white/70 hover:text-white transition-colors">
                    <LogOut size={20} className="rotate-180" />
                </button>
            </div>

            {/* Profile Section */}
            <div className="px-6 py-6">
                <div className="p-4 rounded-2xl bg-gradient-to-b from-white/60 to-white/30 backdrop-blur-md border border-white/40 shadow-sm flex items-center gap-3 group hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-indigo-200 text-sm">
                        {user.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{user.name}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{user.role}</p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto px-4 space-y-2 pb-4 scrollbar-hide">
                <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Main Menu</p>
                {filteredItems.map((item) => {
                    if (item.role !== "all" && item.role !== user.role) return null;
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id + item.role}
                            onClick={() => { setActiveTab(item.id); onClose(); }}
                            className={`
                                w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden touch-manipulation
                                ${isActive
                                    ? "text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] scale-[1.02]"
                                    : "text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 active:scale-95"
                                }
                            `}
                        >
                            {/* Active Background Gradient */}
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 animate-in fade-in zoom-in duration-300"></div>
                            )}

                            <Icon
                                size={20}
                                className={`relative z-10 transition-transform duration-300 ${isActive ? "text-white scale-110" : "group-hover:scale-110 group-hover:text-indigo-500"}`}
                            />
                            <span className={`relative z-10 text-sm font-bold tracking-wide ${isActive ? "text-white" : ""}`}>
                                {item.label}
                            </span>

                            {/* Active Shine Effect */}
                            {isActive && <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>}
                        </button>
                    );
                })}</nav>

            <div className="p-4">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/10 active:scale-95 transition-all duration-300 font-bold text-sm touch-manipulation"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
