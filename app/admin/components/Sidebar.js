import {
    LayoutDashboard, FileText, PlusCircle, Users, Megaphone, Settings, LogOut, Tags
} from "lucide-react";

export default function Sidebar({ user, activeTab, setActiveTab, logout }) {
    const menuItems = [
        { id: "manual", label: "Write News", icon: PlusCircle, role: "all" },
        { id: "my_news", label: "My Stories", icon: FileText, role: "publisher" },
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, role: "publisher" },

        // Admin Only
        { id: "pending", label: "Inbox (Pending)", icon: FileText, role: "admin" },
        { id: "manage", label: "All News", icon: LayoutDashboard, role: "admin" },
        { id: "category", label: "Categories", icon: Tags, role: "admin" },
        { id: "users", label: "Team", icon: Users, role: "admin" },
        { id: "ads", label: "Monetization", icon: Megaphone, role: "admin" },
        { id: "auto", label: "AI Control", icon: Settings, role: "admin" },
    ];

    return (
        <aside className="w-full md:w-72 bg-white/80 backdrop-blur-md border-r border-slate-200 h-screen sticky top-0 flex flex-col shadow-xl z-10 transition-all duration-300">
            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <h1 className="font-bold text-2xl tracking-tight">Portal<span className="text-red-500">X</span></h1>
                <div className="flex items-center gap-2 mt-4 opacity-80">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-2">Menu</p>
                {menuItems.map((item) => {
                    if (item.role !== "all" && item.role !== user.role) return null;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm group ${isActive
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-x-1"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
                                }`}
                        >
                            <item.icon size={20} className={isActive ? "text-red-400" : "text-slate-400 group-hover:text-red-500"} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
                >
                    <LogOut size={20} /> Sign Out
                </button>
            </div>
        </aside>
    );
}
