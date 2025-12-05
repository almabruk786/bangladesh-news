import { useState, useEffect } from "react";
import { Edit, Trash2, Eye, Search, Filter, CheckCircle, XCircle, Pin, MoreHorizontal } from "lucide-react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function NewsList({ data, title, type, onEdit, onView, refreshData }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all"); // all, published, draft, pending
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Logic
    const filteredData = data.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.authorName && item.authorName.toLowerCase().includes(searchTerm.toLowerCase()));

        // Status Filter (Custom logic based on the 'type' prop or internal status)
        if (filter === "all") return matchesSearch;
        return matchesSearch && item.status === filter;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Actions
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this article?")) {
            await deleteDoc(doc(db, "articles", id));
            refreshData();
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (window.confirm(`Mark as ${newStatus}?`)) {
            await updateDoc(doc(db, "articles", id), { status: newStatus });
            refreshData();
        }
    };

    const togglePin = async (item) => {
        await updateDoc(doc(db, "articles", item.id), { isPinned: !item.isPinned });
        refreshData();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header & Controls */}
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                    <p className="text-sm text-slate-400 mt-1">{filteredData.length} articles found</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search news..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="p-5">Title</th>
                            <th className="p-5">Author</th>
                            <th className="p-5">Views</th>
                            <th className="p-5">Status</th>
                            {type === "admin" && <th className="p-5">Pin</th>}
                            <th className="p-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paginatedData.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-5">
                                    <p className="font-bold text-slate-800 line-clamp-1">{item.title}</p>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(item.publishedAt).toLocaleDateString()}</p>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {item.authorName?.[0] || "?"}
                                        </div>
                                        <span className="text-sm font-medium text-slate-600 truncate max-w-[100px]">{item.authorName}</span>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                        <Eye size={12} /> {item.views || 0}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${item.status === "published" ? "bg-green-100 text-green-700" :
                                            item.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                                        {item.status}
                                    </span>
                                </td>
                                {type === "admin" && (
                                    <td className="p-5">
                                        <button
                                            onClick={() => togglePin(item)}
                                            className={`p-2 rounded-lg transition-colors ${item.isPinned ? "bg-purple-100 text-purple-600" : "text-slate-300 hover:bg-slate-100 hover:text-slate-500"}`}
                                            title="Pin to top"
                                        >
                                            <Pin size={16} />
                                        </button>
                                    </td>
                                )}
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {type === "admin" && item.status === "pending" && (
                                            <button onClick={() => handleStatusUpdate(item.id, "published")} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Approve"><CheckCircle size={16} /></button>
                                        )}
                                        {onView && <button onClick={() => onView(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="View"><Eye size={16} /></button>}
                                        <button onClick={() => onEdit(item)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="Edit"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-10 text-center text-slate-400 italic">No news found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-slate-50 flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentPage === page ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
