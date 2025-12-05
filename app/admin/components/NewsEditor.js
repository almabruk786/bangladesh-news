import { useState, useEffect } from "react";
import { PenTool, Upload, Sparkles, Calendar, XCircle, Save, ArrowLeft, RefreshCw } from "lucide-react";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function NewsEditor({ user, existingData, onCancel, onSuccess }) {
    const [form, setForm] = useState({
        title: "", content: "", imageUrls: [], category: "National", scheduledAt: ""
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState(["National", "Politics", "Sports", "International", "Entertainment", "Technology"]);

    useEffect(() => {
        // Fetch Categories Dynamically
        import("firebase/firestore").then(({ getDocs, collection, query, orderBy }) => {
            const q = query(collection(db, "categories"), orderBy("name"));
            getDocs(q).then(snap => {
                const cats = snap.docs.map(d => d.data().name);
                if (cats.length > 0) setCategories(cats);
            });
        });
    }, []);

    // Helper to clean malformed AI content
    const cleanContent = (content) => {
        if (!content) return "";
        if (content.includes("JSON ফরম্যাটে") || content.includes("Output JSON")) {
            try {
                const firstOpen = content.indexOf('{');
                const lastClose = content.lastIndexOf('}');
                if (firstOpen !== -1 && lastClose !== -1) {
                    const jsonStr = content.substring(firstOpen, lastClose + 1);
                    const parsed = JSON.parse(jsonStr);
                    return parsed.body || content;
                }
            } catch (e) { }
        }
        return content;
    };

    useEffect(() => {
        if (existingData) {
            setForm({
                title: existingData.title,
                content: cleanContent(existingData.content),
                imageUrls: existingData.imageUrls || (existingData.imageUrl ? [existingData.imageUrl] : []),
                category: existingData.category || "National",
                scheduledAt: existingData.scheduledAt || ""
            });
        }
    }, [existingData]);

    // Handle Input Change
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // AI Title Generator (Mock)
    const generateTitle = () => {
        if (!form.content) return alert("Write some content first!");
        const words = form.content.split(" ").slice(0, 5).join(" ");
        alert(`AI Suggestion: Important Update: ${words}...`);
    };

    // Image Upload
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploading(true);

        // Upload logic here (Cloudinary)
        const newUrls = [];
        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            try {
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
                const data = await res.json();
                if (data.secure_url) newUrls.push(data.secure_url);
            } catch (error) { console.error("Upload error", error); }
        }
        setForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...newUrls] }));
        setUploading(false);
    };

    // Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const status = user.role === "admin" ? "published" : "pending";
            const payload = {
                ...form,
                imageUrl: form.imageUrls[0] || "",
                status,
                updatedAt: new Date().toISOString(),
                publishedAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : new Date().toISOString(),
                authorName: existingData?.authorName || user.name, // Keep original author if editing
                authorRole: user.role
            };

            if (existingData) {
                await updateDoc(doc(db, "articles", existingData.id), payload);
            } else {
                await addDoc(collection(db, "articles"), payload);
            }
            onSuccess();
        } catch (error) {
            alert("Error saving news: " + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <PenTool size={20} className="text-blue-600" />
                    {existingData ? "Edit Story" : "Write New Story"}
                </h2>
                {onCancel && (
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Back
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Title Section */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Headline</label>
                    <div className="flex gap-2">
                        <input
                            name="title"
                            required
                            placeholder="Enter a catchy headline..."
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={form.title}
                            onChange={handleChange}
                        />
                        <button type="button" onClick={generateTitle} className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors" title="Generate AI Title">
                            <Sparkles size={20} />
                        </button>
                    </div>
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Category</label>
                        <select
                            name="category"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.category}
                            onChange={handleChange}
                        >
                            {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Schedule Publish (Optional)</label>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <Calendar size={18} className="text-slate-400" />
                            <input
                                type="datetime-local"
                                name="scheduledAt"
                                className="bg-transparent text-slate-700 font-medium outline-none w-full"
                                value={form.scheduledAt}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Media Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Cover Image & Gallery</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center transition-colors hover:bg-slate-50">
                        <input type="file" multiple onChange={handleImageUpload} className="hidden" id="file-upload" accept="image/*" />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            {uploading ? <RefreshCw className="animate-spin text-blue-500" size={32} /> : <Upload className="text-slate-400" size={32} />}
                            <span className="text-slate-600 font-medium">{uploading ? "Uploading..." : "Click to upload images"}</span>
                            <span className="text-xs text-slate-400">Supported: JPG, PNG, WEBP</span>
                        </label>
                    </div>

                    {/* Image Preview */}
                    {form.imageUrls.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {form.imageUrls.map((url, idx) => (
                                <div key={idx} className="relative w-24 h-24 shrink-0 group">
                                    <img src={url} alt="preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
                                    <button
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, imageUrls: p.imageUrls.filter((_, i) => i !== idx) }))}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <XCircle size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Story Content</label>
                    <textarea
                        name="content"
                        required
                        rows="12"
                        placeholder="Write your story here..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                        value={form.content}
                        onChange={handleChange}
                    />
                </div>

                {/* Submit */}
                <div className="pt-4 border-t border-slate-100">
                    <button
                        disabled={loading || uploading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <Save />}
                        {loading ? "Saving..." : existingData ? "Update Story" : "Publish Story"}
                    </button>
                </div>

            </form>
        </div>
    );
}
