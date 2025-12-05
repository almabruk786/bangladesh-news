import { useState, useEffect } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");

    useEffect(() => {
        const q = query(collection(db, "categories"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const addCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            await addDoc(collection(db, "categories"), { name: newCategory.trim() });
            setNewCategory("");
        } catch (e) { alert("Error adding category"); }
    };

    const deleteCategory = async (id) => {
        if (confirm("Delete this category?")) {
            await deleteDoc(doc(db, "categories", id));
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Tag className="text-blue-500" /> Category Management
            </h2>

            <form onSubmit={addCategory} className="flex gap-3 mb-6">
                <input
                    type="text"
                    placeholder="New Category Name (e.g. Sports)"
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />
                <button className="px-5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800">
                    <Plus size={18} /> Add
                </button>
            </form>

            <div className="space-y-2">
                {categories.length === 0 && <p className="text-slate-400 text-center py-4">No categories found. Add one!</p>}
                {categories.map((cat) => (
                    <div key={cat.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl group hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all">
                        <span className="font-bold text-slate-700">{cat.name}</span>
                        <button
                            onClick={() => deleteCategory(cat.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
