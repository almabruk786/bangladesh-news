import { useState, useEffect } from "react";
import { Edit, Trash2, Eye, EyeOff, Search, Filter, CheckCircle, XCircle, Pin, MoreHorizontal, Image as ImageIcon, Bell } from "lucide-react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

import { Download } from "lucide-react";

export default function NewsList({ data, title, type, user, onEdit, onView, refreshData, isLoaded = true, onLoad }) {
    const [loadLimit, setLoadLimit] = useState(2); // Default to 2 as requested

    if (!isLoaded) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                    <Download size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        News articles are not loaded automatically to conserve data quota.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-sm font-medium text-slate-600 pl-2">Load:</span>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={loadLimit}
                        onChange={(e) => setLoadLimit(parseInt(e.target.value) || 2)}
                        className="w-16 p-1 text-center font-bold border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-sm font-medium text-slate-600 pr-2">articles</span>
                </div>

                <button
                    onClick={() => onLoad(loadLimit)}
                    className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 hover:-translate-y-1"
                >
                    <Download size={20} />
                    Load News Articles
                </button>
            </div>
        );
    }
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const itemsPerPage = 10;

    // Category normalization map (English <-> Bangla)
    const categoryMap = {
        'Bangladesh': 'জাতীয়',
        'বাংলাদেশ': 'জাতীয়', // Map explicit Bangla spelling to National too
        'বাংলाদেশ': 'জাতীয়', // Legacy/Typo Catch
        'National': 'জাতীয়',
        'জাতীয়': 'National',
        'Economy': 'অর্থনীতি',
        'অর্থনীতি': 'Economy',
        'Politics': 'রাজনীতি',
        'রাজনীতি': 'Politics',
        'International': 'আন্তর্জাতিক',
        'আন্তর্জাতিক': 'International',
        'Corruption': 'দূর্নীতি',
        'দূর্নীতি': 'Corruption',
        'Weather': 'আবহাওয়া',
        'আবহাওয়া': 'Weather',
        'Sports': 'খেলা',
        'খেলা': 'Sports',
        'খেলাধুলা': 'Sports', // Alternative Bangla variant
        'Entertainment': 'বিনোদন',
        'বিনোদন': 'Entertainment',
        'Education': 'শিক্ষা',
        'শিক্ষা': 'Education',
        'Technology': 'প্রযুক্তি',
        'প্রযুক্তি': 'Technology',
        'Health': 'স্বাস্থ্য',
        'স্বাস্থ্য': 'Health',
        'Lifestyle': 'জীবনযাপন',
        'জীবনযাপন': 'Lifestyle',
        'Opinion': 'মতামত',
        'মতামত': 'Opinion',
        'Accident': 'দুর্ঘটনা',
        'দুর্ঘটনা': 'Accident',
        'Business': 'বাণিজ্য',
        'বাণিজ্য': 'Business',
        'Commerce': 'বাণিজ্য', // Handle potential alias
        'Crime': 'অপরাধ',
        'অপরাধ': 'Crime',
    };

    // Normalize category to handle both English and Bangla
    const isSameCategory = (cat1, cat2) => {
        if (!cat1 || !cat2) return false;
        const c1 = cat1.trim();
        const c2 = cat2.trim();
        if (c1 === c2) return true;
        return categoryMap[c1] === c2 || categoryMap[c2] === c1;
    };

    const filteredData = data
        .filter(item => {
            let term = searchTerm.toLowerCase().trim();

            // Category Filter (with normalization & multi-category support)
            if (categoryFilter !== "all") {
                let match = false;

                // Check 1: category string (comma-separated)
                if (item.category) {
                    const itemCategories = item.category.split(',').map(c => c.trim());
                    match = itemCategories.some(cat => isSameCategory(cat, categoryFilter));
                }

                // Check 2: categories array (if exists)
                if (!match && item.categories && Array.isArray(item.categories)) {
                    match = item.categories.some(cat => isSameCategory(cat, categoryFilter));
                }

                if (!match) return false;
            }

            if (!term) {
                // If no search term, only apply status filter
                if (filter === "all") return true;
                return item.status === filter;
            }

            // Extract ID if URL is pasted (e.g., https://site.com/news/12345)
            if (term.includes('/')) {
                const parts = term.split('/').filter(p => p.length > 5);
                if (parts.length > 0) {
                    const potentialId = parts[parts.length - 1];
                    if (item.id.toLowerCase() === potentialId.toLowerCase()) return true;
                }
            }

            const matchesSearch = item.title.toLowerCase().includes(term) ||
                (item.authorName && item.authorName.toLowerCase().includes(term)) ||
                (item.category && item.category.toLowerCase().includes(term)) || // NEW: Category search
                item.id.toLowerCase().trim() === term ||
                item.id.toLowerCase().includes(term) ||
                term.includes(item.id);

            if (filter === "all") return matchesSearch;
            return matchesSearch && item.status === filter;
        })
        .sort((a, b) => {
            // Sorting Logic
            switch (sortBy) {
                case "oldest":
                    return new Date(a.publishedAt) - new Date(b.publishedAt);
                case "views-high":
                    return (b.views || 0) - (a.views || 0);
                case "views-low":
                    return (a.views || 0) - (b.views || 0);
                case "title-az":
                    return a.title.localeCompare(b.title);
                case "title-za":
                    return b.title.localeCompare(a.title);
                case "newest":
                default:
                    return new Date(b.publishedAt) - new Date(a.publishedAt);
            }
        });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Selection Logic
    const toggleSelect = (id) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedItems(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === paginatedData.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(paginatedData.map(i => i.id)));
        }
    };

    // Bulk Actions
    const handleBulkAction = async (action) => {
        if (!selectedItems.size) return;
        if (!window.confirm(`Are you sure you want to ${action} ${selectedItems.size} items?`)) return;

        const promises = Array.from(selectedItems).map(id => {
            if (action === "delete") return deleteDoc(doc(db, "articles", id));
            return updateDoc(doc(db, "articles", id), { status: action === "approve" ? "published" : "rejected" });
        });

        await Promise.all(promises);
        setSelectedItems(new Set());
        refreshData();
    };


    // Individual Actions
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to PERMANENTLY delete this article?")) {
            await deleteDoc(doc(db, "articles", id));
            refreshData();
        }
    };

    const handleRequestDelete = async (id) => {
        if (window.confirm("Request to delete this article?")) {
            await updateDoc(doc(db, "articles", id), { status: "pending_delete" });
            refreshData();
        }
    };

    const handleStatusUpdate = async (id, action) => {
        if (action === "hide" || action === "show") {
            // Toggle Hidden Status
            await updateDoc(doc(db, "articles", id), { hidden: action === "hide" });
            refreshData();
        } else {
            // Normal Status Update
            if (window.confirm(`Mark as ${action}?`)) {
                await updateDoc(doc(db, "articles", id), { status: action });
                refreshData();
            }
        }
    };

    const togglePin = async (item) => {
        try {
            if (!item.isPinned) {
                // Pinning: Auto-unpin all others first
                const batch = [];
                const currentlyPinned = data.filter(art => art.isPinned && art.id !== item.id);

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

            refreshData();
        } catch (error) {
            console.error("Pin toggle error:", error);
            alert("Failed to update pin status");
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
