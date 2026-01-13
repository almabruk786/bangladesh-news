import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Edit2, AlertTriangle, Save, X, RefreshCw } from "lucide-react";
import { collection, addDoc, deleteDoc, doc, query, orderBy, getDocs, where, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: "", bn: "", order: 0 });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Hardcoded defaults for seeding
    const defaultCategories = [
        { name: "National", bn: "জাতীয়", order: 1 },
        { name: "Politics", bn: "রাজনীতি", order: 2 },
        { name: "International", bn: "আন্তর্জাতিক", order: 3 },
        { name: "Sports", bn: "খেলা", order: 4 },
        { name: "Business", bn: "বাণিজ্য", order: 5 },
        { name: "Technology", bn: "প্রযুক্তি", order: 6 },
        { name: "Entertainment", bn: "বিনোদন", order: 7 },
        { name: "Lifestyle", bn: "জীবনযাপন", order: 8 },
        { name: "Health", bn: "স্বাস্থ্য", order: 9 },
        { name: "Education", bn: "শিক্ষা", order: 10 },
        { name: "Opinion", bn: "মতামত", order: 11 },
        { name: "Bangladesh", bn: "বাংলাদেশ", order: 12 },
    ];

    // Fetch Categories (Manual)
    const fetchCategories = async () => {
        try {
            // Fetch by name, Sort Client-Side to handle missing 'order' field
            const q = query(collection(db, "categories"), orderBy("name"));
            const snapshot = await getDocs(q);
            const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort: Order first (asc), then Name (asc)
            // Treat missing order as 999 (end of list)
            cats.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999;
                const orderB = b.order !== undefined ? b.order : 999;
                return (orderA - orderB) || a.name.localeCompare(b.name);
            });
            setCategories(cats);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Clear server-side cache to reflect changes immediately
    const clearServerCache = async () => {
        try {
            await fetch('/api/admin/clear-cache?type=categories', { method: 'POST' });
        } catch (err) {
            console.error("Failed to clear cache:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.bn.trim()) return alert("Both English and Bangla names are required!");

        setLoading(true);
        try {
            if (editingId) {
                // UPDATE (Rename)
                await updateDoc(doc(db, "categories", editingId), {
                    name: form.name.trim(),
                    bn: form.bn.trim(),
                    order: Number(form.order)
                });
                setEditingId(null);
            } else {
                // CREATE
                // Check duplicate
                const exists = categories.find(c => c.name.toLowerCase() === form.name.toLowerCase());
                if (exists) return alert("Category with this name already exists!");

                await addDoc(collection(db, "categories"), {
                    name: form.name.trim(),
                    bn: form.bn.trim(),
                    order: Number(form.order)
                });
            }
            await clearServerCache(); // Clear cache
            fetchCategories(); // Refresh list
            setForm({ name: "", bn: "", order: 0 });
        } catch (error) {
            console.error(error);
            alert("Error saving category: " + error.message);
        }
        setLoading(false);
    };

    const handleEdit = (cat) => {
        setForm({ name: cat.name, bn: cat.bn || "", order: cat.order || 0 });
        setEditingId(cat.id);
    };

    const handleCancel = () => {
        setForm({ name: "", bn: "", order: 0 });
        setEditingId(null);
    };

    const deleteCategory = async (cat) => {
        if (!confirm(`Delete category "${cat.name}"?`)) return;

        setLoading(true);
        try {
            // Safety Check: Check if any articles use this category
            // Note: This relies on article 'category' field matching the name OR 'categories' array containing it
            // Simple check on 'categories' array containment
            const q = query(collection(db, "articles"), where("categories", "array-contains", cat.name));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                alert(`⚠️ Cannot delete "${cat.name}"!\n\nIt is currently used in ${snapshot.size} articles.\nPlease remove this category from those articles first.`);
                setLoading(false);
                return;
            }

            await deleteDoc(doc(db, "categories", cat.id));
            await clearServerCache(); // Clear cache
            fetchCategories(); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Error calculating usage. Check console.");
        }
        setLoading(false);
    };

    const seedDefaults = async () => {
        if (!confirm("This will add missing default categories (National, Sports, etc.) to the database. Continue?")) return;
        setLoading(true);
        const batch = writeBatch(db);
        let count = 0;

        defaultCategories.forEach(def => {
            const exists = categories.find(c => c.name === def.name);
            if (!exists) {
                const ref = doc(collection(db, "categories")); // auto-id
                batch.set(ref, def);
                count++;
            }
        });

        if (count > 0) {
            await batch.commit();
            await clearServerCache(); // Clear cache
            alert(`Added ${count} missing categories!`);
            fetchCategories(); // Refresh list
        } else {
            alert("All default categories already exist.");
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Tag className="text-blue-500" /> Category Management
                </h2>
                <button
                    onClick={seedDefaults}
                    disabled={loading}
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                >
                    <RefreshCw size={12} /> Seed Defaults
                </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div className="md:col-span-1 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Order</label>
                    <input
                        type="number"
                        required
                        placeholder="0"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.order}
                        onChange={(e) => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                    />
                </div>
                <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Category Name (English/URL)</label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. Sports"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.name}
                        onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    />
                </div>
                <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Bangla Name (Display)</label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. খেলা"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.bn}
                        onChange={(e) => setForm(p => ({ ...p, bn: e.target.value }))}
                    />
                </div>
                <div className="flex gap-2 md:col-span-1">
                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 p-2.5 bg-white border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50"
                        >
                            <X size={20} className="mx-auto" />
                        </button>
                    )}
                    <button
                        disabled={loading}
                        className={`flex-1 p-2.5 text-white font-bold rounded-lg flex justify-center items-center gap-2 transition-all ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                    >
                        {loading ? <RefreshCw className="animate-spin" size={20} /> : editingId ? <Save size={20} /> : <Plus size={20} />}
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.length === 0 && <p className="col-span-2 text-slate-400 text-center py-8">No categories found. Add one or seed defaults!</p>}

                {categories.map((cat) => (
                    <div key={cat.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${cat.order !== undefined ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                                {cat.order !== undefined ? `#${cat.order}` : '—'}
                            </span>
                            <div>
                                <h3 className="font-bold text-slate-800">{cat.name}</h3>
                                <p className="text-sm text-slate-500">{cat.bn || "—"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(cat)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Rename / Edit"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => deleteCategory(cat)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Safely"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
