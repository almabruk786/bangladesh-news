import { TrendingUp, Users, FileText, Eye } from "lucide-react";

export default function DashboardStats({ stats }) {
    const cards = [
        { title: "Total Users", value: "Active", icon: Users, color: "bg-blue-500", count: "3" }, // Dummy count for now
        { title: "Total News", value: stats.total, icon: FileText, color: "bg-purple-500" },
        { title: "Published", value: stats.published, icon: TrendingUp, color: "bg-green-500" },
        { title: "Pending", value: stats.pending, icon: Eye, color: "bg-amber-500" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{card.title}</p>
                            <h3 className="text-3xl font-black text-slate-800 mt-2">{card.value}</h3>
                        </div>
                        <div className={`${card.color} p-3 rounded-xl text-white shadow-lg shadow-slate-200`}>
                            <card.icon size={24} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
