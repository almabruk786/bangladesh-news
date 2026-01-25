import { useState, useEffect } from "react";
import { Edit, Trash2, Eye, EyeOff, Search, Filter, CheckCircle, XCircle, Pin, MoreHorizontal, Image as ImageIcon, Bell } from "lucide-react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

import { Download } from "lucide-react";

export default function NewsList({ data, title, type, user, onEdit, onView, refreshData, isLoaded = true, onLoad }) {
    // ALL useState hooks MUST come first, before any conditional returns
    const [localData, setLocalData] = useState(data || []);
    const [loadLimit, setLoadLimit] = useState(2);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const itemsPerPage = 10;

    // Sync localData when data prop changes
    useEffect(() => {
        // Only update if data exists
        if (data) {
            console.log('NewsList: Syncing localData with prop data. Count:', data.length);
            setLocalData(data);
        }
    }, [data]);

    // ... (rest of code) ...

    const togglePin = async (item) => {
        const isPinning = !item.isPinned;
        console.log(`NewsList: togglePin CLICKED. Item: ${item.title} (${item.id}). New State: ${isPinning ? 'Pinned' : 'Unpinned'}`);

        try {
            // OPTIMISTIC UPDATE: Update UI immediately
            setLocalData(prevData => {
                const newData = prevData.map(art => {
                    if (art.id === item.id) {
                        return { ...art, isPinned: isPinning };
                    }
                    // If pinning this one, unpin others (assuming single pin policy)
                    if (isPinning && art.isPinned) {
                        return { ...art, isPinned: false };
                    }
                    return art;
                });
                console.log('NewsList: Optimistic update complete. Pinned item count:', newData.filter(i => i.isPinned).length);
                return newData;
            });

            // Persist to Backend
            if (isPinning) {
                // Pinning: Auto-unpin all others first
                const batch = [];
                const currentlyPinned = localData.filter(art => art.isPinned && art.id !== item.id);

                console.log(`NewsList: Auto-unpinning ${currentlyPinned.length} other items in DB`);

                for (const pinnedArticle of currentlyPinned) {
                    batch.push(updateDoc(doc(db, "articles", pinnedArticle.id), { isPinned: false }));
                }

                batch.push(updateDoc(doc(db, "articles", item.id), { isPinned: true }));
                await Promise.all(batch);
            } else {
                // Just unpinning
                await updateDoc(doc(db, "articles", item.id), { isPinned: false });
            }

            // Force cache revalidation
            try {
                await fetch('/api/admin/clear-cache?tag=news', { method: 'POST' });
            } catch (e) {
                console.error("Failed to clear cache:", e);
            }

            console.log("NewsList: DB Update & Cache Clear Successful");

        } catch (error) {
            console.error("NewsList: Pin toggle error:", error);
            alert("Failed to update pin status. Reverting...");
            // Revert would be complex, simply refresh
            if (refreshData) refreshData();
        }
    };

    const handleSendNotification = async (item) => {
        const customBody = window.prompt("Enter notification text:", item.title);
        if (customBody === null) return; // Cancelled

        try {
            const res = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: item.title,
                    body: customBody || "Read more on Bakalia News",
                    imageUrl: item.imageUrl || item.imageUrls?.[0],
                    link: `https://bakalia.xyz/news/${item.id}`
                })
            });

            const data = await res.json();
            if (data.success) {
                alert(`Notification Sent!\\nSuccess: ${data.successCount}\\nFailed: ${data.failureCount}`);
            } else {
                alert(`Error: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Notification Error:", error);
            alert("Failed to send notification.");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">

            {/* Bulk Action Bar */}
            {selectedItems.size > 0 && type === "admin" && (
                <div className="absolute top-0 left-0 w-full bg-slate-900 text-white p-4 z-10 flex justify-between items-center animate-in slide-in-from-top-2">
                    <span className="font-bold">{selectedItems.size} Selected</span>
                    <div className="flex gap-2">
                        <button onClick={() => handleBulkAction("approve")} className="px-3 py-1 bg-green-600 rounded hover:bg-green-500 font-bold text-sm">Approve Selected</button>
                        <button onClick={() => handleBulkAction("reject")} className="px-3 py-1 bg-amber-600 rounded hover:bg-amber-500 font-bold text-sm">Reject Selected</button>
                        <button onClick={() => handleBulkAction("delete")} className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 font-bold text-sm">Delete Selected</button>
                        <button onClick={() => setSelectedItems(new Set())} className="ml-2 p-1 hover:bg-white/20 rounded"><XCircle size={20} /></button>
                    </div>
                </div>
            )}

            {/* Header & Controls */}
            <div className="p-6 border-b border-slate-50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                        <p className="text-sm text-slate-400 mt-1">{filteredData.length} articles found</p>
                    </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 mb-4 border border-slate-100 flex flex-wrap justify-between items-center">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-600">📊 Total:</span>
                            <span className="px-2 py-0.5 bg-white rounded-full font-bold text-slate-700">{data.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-green-600">✅ Published:</span>
                            <span className="px-2 py-0.5 bg-white rounded-full font-bold text-green-600">{data.filter(d => d.status === 'published').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-600">⏳ Pending:</span>
                            <span className="px-2 py-0.5 bg-white rounded-full font-bold text-amber-600">{data.filter(d => d.status === 'pending').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-600">👁️ Hidden:</span>
                            <span className="px-2 py-0.5 bg-white rounded-full font-bold text-slate-600">{data.filter(d => d.hidden).length}</span>
                        </div>
                        {categoryFilter !== "all" && (
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-blue-600">🏷️ Filtered:</span>
                                <span className="px-2 py-0.5 bg-white rounded-full font-bold text-blue-600">{filteredData.length}</span>
                            </div>
                        )}
                    </div>

                    {refreshData && (
                        <button
                            onClick={refreshData}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors text-xs font-bold shadow-sm"
                            title="Refresh data from server (Bypasses Cache)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                            Refresh Data
                        </button>
                    )}
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by title, author, category, ID..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {(() => {
                            // Get all unique categories (normalized & separated)
                            const categoryGroups = {};

                            data.forEach(item => {
                                const uniqueArticleCategories = new Set();

                                // Helper to normalize and add to set
                                const addCategory = (rawCat) => {
                                    if (!rawCat) return;
                                    const trimmed = rawCat.trim();
                                    if (!trimmed) return;
                                    // Normalize to Bangla/Standard name for uniqueness check
                                    const banglaName = categoryMap[trimmed] || trimmed;
                                    const displayName = /[\u0980-\u09FF]/.test(banglaName) ? banglaName : trimmed;
                                    uniqueArticleCategories.add(displayName);
                                };

                                // Extract from category string (comma-separated)
                                if (item.category) {
                                    item.category.split(',').forEach(addCategory);
                                }

                                // Extract from categories array
                                if (item.categories && Array.isArray(item.categories)) {
                                    item.categories.forEach(addCategory);
                                }

                                // Increment counts for unique categories of this article
                                uniqueArticleCategories.forEach(displayName => {
                                    if (!categoryGroups[displayName]) {
                                        categoryGroups[displayName] = {
                                            name: displayName,
                                            count: 0,
                                            value: displayName // using display name as value for simplicity in filter matching
                                        };
                                    }
                                    categoryGroups[displayName].count++;
                                });
                            });

                            return Object.values(categoryGroups)
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map(cat => (
                                    <option key={cat.name} value={cat.value}>
                                        {cat.name} ({cat.count})
                                    </option>
                                ));
                        })()}
                    </select>

                    <select
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="pending">Pending</option>
                        {type === "admin" && <option value="pending_delete">Deletion Req</option>}
                    </select>

                    <select
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">📅 Newest First</option>
                        <option value="oldest">📅 Oldest First</option>
                        <option value="views-high">👁️ Most Views</option>
                        <option value="views-low">👁️ Least Views</option>
                        <option value="title-az">🔤 A-Z (Title)</option>
                        <option value="title-za">🔤 Z-A (Title)</option>
                    </select>
                </div>
            </div>


            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                            {type === "admin" && (
                                <th className="p-5 w-10">
                                    <input type="checkbox" onChange={toggleSelectAll} checked={selectedItems.size === paginatedData.length && paginatedData.length > 0} />
                                </th>
                            )}
                            <th className="p-5 w-16">Image</th>
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
                            <tr key={item.id} className={`transition-colors group ${selectedItems.has(item.id) ? "bg-blue-50" : "hover:bg-slate-50/50"}`}>
                                {type === "admin" && (
                                    <td className="p-5">
                                        <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => toggleSelect(item.id)} />
                                    </td>
                                )}
                                <td className="p-5">
                                    <div className="w-12 h-12 rounded overflow-hidden bg-slate-100 border border-slate-200">
                                        {item.imageUrl || item.imageUrls?.[0] ? (
                                            <img
                                                src={item.imageUrl || item.imageUrls?.[0]}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageIcon size={16} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-slate-800 line-clamp-1 flex-1" title={item.title}>{item.title}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.category && item.category.split(',').map((cat, idx) => {
                                            const trimmedCat = cat.trim();
                                            // Prefer Bangla name
                                            const banglaName = categoryMap[trimmedCat] || trimmedCat;
                                            const displayName = /[\u0980-\u09FF]/.test(banglaName) ? banglaName : trimmedCat;

                                            return (
                                                <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                                                    🏷️ {displayName}
                                                </span>
                                            );
                                        })}
                                        <p className="text-xs text-slate-400">{new Date(item.publishedAt).toLocaleDateString()}</p>
                                    </div>
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
                                        ${item.hidden ? "bg-slate-800 text-white" :
                                            item.status === "published" ? "bg-green-100 text-green-700" :
                                                item.status === "pending" ? "bg-amber-100 text-amber-700" :
                                                    item.status === "pending_delete" ? "bg-red-100 text-red-700" :
                                                        item.status === "rejected" ? "bg-red-50 text-red-500 line-through" : "bg-slate-100 text-slate-600"}`}>
                                        {item.hidden ? "HIDDEN" : (item.status === "pending_delete" ? "Del Req" : item.status)}
                                    </span>
                                </td>
                                {type === "admin" && (
                                    <td className="p-5">
                                        <button
                                            onClick={() => togglePin(item)}
                                            className={`p-2 rounded-lg transition-colors ${item.isPinned ? "bg-purple-100 text-purple-600" : "text-slate-300 hover:bg-slate-100 hover:text-slate-500"}`}
                                            title={item.isPinned ? "Unpin" : "Pin to top (auto-unpins others)"}
                                        >
                                            <Pin size={16} />
                                        </button>
                                    </td>
                                )}
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* Admin specific Actions */}
                                        {type === "admin" && (
                                            <>
                                                {item.status === "pending" && (
                                                    <>
                                                        <button onClick={() => handleStatusUpdate(item.id, "published")} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Approve"><CheckCircle size={16} /></button>
                                                        <button onClick={() => handleStatusUpdate(item.id, "rejected")} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Reject"><XCircle size={16} /></button>
                                                    </>
                                                )}
                                                {item.status === "pending_delete" && (
                                                    <>
                                                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Confirm Delete"><Trash2 size={16} /></button>
                                                        <button onClick={() => handleStatusUpdate(item.id, "published")} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="Reject Delete Request"><XCircle size={16} /></button>
                                                    </>
                                                )}
                                            </>
                                        )}

                                        {type === "admin" && (
                                            <button onClick={() => handleSendNotification(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Send Notification"><Bell size={16} /></button>
                                        )}

                                        <a href={`/news/${item.id}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100" title="Visit Live"><div className="flex items-center gap-1"><Eye size={16} /></div></a>

                                        <button onClick={() => onEdit(item)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="Edit"><Edit size={16} /></button>

                                        {/* Hide/Show Toggle */}
                                        {type === "admin" && (
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, item.hidden ? "show" : "hide")}
                                                className={`p-2 rounded-lg ${item.hidden ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-400 hover:text-slate-600"}`}
                                                title={item.hidden ? "Show on Website" : "Hide from Website"}
                                            >
                                                {item.hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                        )}

                                        {/* Delete Logic */}
                                        {type === "admin" && item.status !== "pending_delete" && (
                                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Delete"><Trash2 size={16} /></button>
                                        )}
                                        {type === "publisher" && (
                                            <button onClick={() => handleRequestDelete(item.id)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100" title="Request Delete" disabled={item.status === "pending_delete"}>
                                                <XCircle size={16} />
                                            </button>
                                        )}
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
