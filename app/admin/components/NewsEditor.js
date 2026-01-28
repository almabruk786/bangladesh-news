import { useState, useEffect, useCallback, useRef } from "react";
import { PenTool, Upload, Sparkles, Calendar, XCircle, Save, ArrowLeft, RefreshCw, Hash, Loader2, Eye, Wand2, BarChart3, AlertTriangle, Star } from "lucide-react";
import { addDoc, collection, updateDoc, doc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import TiptapEditor from "./TiptapEditor";
import ImageConverter from "./ImageConverter"; // Import the tool
import SeoSidebar from "./SeoSidebar"; // Import SEO Sidebar

export default function NewsEditor({ user, existingData, onCancel, onSuccess }) {
    const [form, setForm] = useState({
        title: "", content: "", imageUrls: [], category: "বাংলাদেশ", categories: ["বাংলাদেশ"], scheduledAt: "", tags: [], ogImage: "", videoUrl: "", metaDescription: "", authorName: "", imageCaption: "", imageAlt: ""
    });
    const [tagInput, setTagInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [docId, setDocId] = useState(existingData?.id || null);
    const [uploading, setUploading] = useState(false);
    const [uploadingEditor, setUploadingEditor] = useState(false);
    const [generatingTags, setGeneratingTags] = useState(false);
    const [categories, setCategories] = useState([]); // Dynamic fetch
    const [showImageTool, setShowImageTool] = useState(false); // State for modal
    const [showSeo, setShowSeo] = useState(false); // State for SEO sidebar

    const [showRecoveryAlert, setShowRecoveryAlert] = useState(false);

    // 🛡️ Local Storage Key (Crash-Proof)
    const DRAFT_KEY = "news_draft_autosave";

    const autoSaveTimerRef = useRef(null);
    const localSaveTimerRef = useRef(null); // Separate timer for local storage

    // Determine Default Author Name
    const defaultAuthorName = user.role === "admin" ? "Md Arif Mainuddin" : user.name;

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

    // 🛡️ Mount Check: Look for crash data
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Only prompt if data is substantial and different from initial empty state
                if (parsed.title || parsed.content.length > 20) {
                    setShowRecoveryAlert(true);
                }
            } catch (e) { }
        }
    }, []);

    // 🛡️ Fetch Categories from DB
    useEffect(() => {
        // Fetch categories for dropdown with cache
        const fetchCategoriesForEditor = async () => {
            try {
                // Check cache first (shared with CategoryManager)
                const cacheKey = 'admin_categories_cache';
                const cached = sessionStorage.getItem(cacheKey);
                const cacheTime = sessionStorage.getItem(cacheKey + '_time');
                const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
                const isCacheValid = cacheTime && (Date.now() - parseInt(cacheTime) < CACHE_DURATION);

                if (isCacheValid && cached) {
                    console.log('[NewsEditor] Using cached categories');
                    const parsedCache = JSON.parse(cached);
                    console.log('[NewsEditor] Cached categories:', parsedCache);

                    // Validate cache format - if it's old string format, invalidate it
                    if (parsedCache.length > 0 && typeof parsedCache[0] === 'string') {
                        console.warn('[NewsEditor] Old cache format detected, clearing...');
                        sessionStorage.removeItem(cacheKey);
                        sessionStorage.removeItem(cacheKey + '_time');
                        // Continue to fetch fresh data
                    } else {
                        setCategories(parsedCache);
                        return;
                    }
                }

                console.log('[NewsEditor] Cache miss - fetching categories from Firestore');
                const q = query(collection(db, "categories"), orderBy("name"));
                const snapshot = await getDocs(q);
                const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                console.log('[NewsEditor] Fetched categories:', cats);

                // Sort: Order first (asc), then Name (asc)
                cats.sort((a, b) => {
                    const orderA = a.order !== undefined ? a.order : 999;
                    const orderB = b.order !== undefined ? b.order : 999;
                    return (orderA - orderB) || a.name.localeCompare(b.name);
                });

                // Cache the results
                sessionStorage.setItem(cacheKey, JSON.stringify(cats));
                sessionStorage.setItem(cacheKey + '_time', Date.now().toString());

                setCategories(cats);
            } catch (error) {
                console.error("[NewsEditor] Error fetching categories:", error);
                setCategories([]); // Set empty array on error
            }
        };
        fetchCategoriesForEditor();
    }, []);

    // 🛡️ Recovery Actions
    const restoreDraft = () => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            setForm(prev => ({ ...prev, ...parsed }));
            alert("Draft Restored Successfully! 🛡️");
        }
        setShowRecoveryAlert(false);
    };

    const discardDraft = () => {
        if (confirm("Are you sure? This will delete the unsaved draft permanently.")) {
            localStorage.removeItem(DRAFT_KEY);
            setShowRecoveryAlert(false);
        }
    };

    useEffect(() => {
        if (existingData) {
            setForm({
                title: existingData.title,
                content: cleanContent(existingData.content),
                imageUrls: existingData.imageUrls || (existingData.imageUrl ? [existingData.imageUrl] : []),
                category: existingData.category || "National",
                category: existingData.category || existingData.categories?.[0] || "National",
                categories: existingData.categories?.length > 0 ? existingData.categories : (existingData.category ? [existingData.category] : ["National"]),
                scheduledAt: existingData.scheduledAt || "",
                tags: existingData.tags || [],
                ogImage: existingData.ogImage || "",
                videoUrl: existingData.videoUrl || "",
                metaDescription: existingData.metaDescription || "",
                isLive: existingData.isLive || false,
                authorName: existingData.authorName || "",
                authorName: existingData.authorName || "",
                imageCaption: existingData.imageCaption || "",
                imageAlt: existingData.imageAlt || ""
            });
            setDocId(existingData.id);
        }
    }, [existingData]);

    // Handle Input Change
    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditorChange = (html) => {
        setForm(prev => ({ ...prev, content: html }));
    };

    // 🛡️ Local Auto-Save Logic (Every time form changes)
    useEffect(() => {
        if (localSaveTimerRef.current) clearTimeout(localSaveTimerRef.current);

        localSaveTimerRef.current = setTimeout(() => {
            // Don't save if empty
            if (!form.title && !form.content) return;

            // Don't save large images to LS (quota safety)
            const safeForm = { ...form, imageUrls: form.imageUrls.map(u => u.length > 500 ? '' : u) };

            localStorage.setItem(DRAFT_KEY, JSON.stringify(safeForm));
        }, 1000); // Save to device every 1 second of inactivity

        return () => clearTimeout(localSaveTimerRef.current);
    }, [form]);


    // Reusable Upload Helper (Image/Video/Audio)
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

        const resourceType = file.type.startsWith("image/") ? "image" : "video"; // Cloudinary uses 'video' for audio too
        const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

        const res = await fetch(endpoint, { method: "POST", body: formData });
        const data = await res.json();
        return data.secure_url;
    };

    // Editor Image Upload Handler
    const handleEditorImageUpload = useCallback(() => {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    setUploadingEditor(true);
                    try {
                        const url = await uploadToCloudinary(file);
                        resolve(url);
                    } catch (err) {
                        console.error("Editor upload failed", err);
                        resolve(null);
                    }
                    setUploadingEditor(false);
                } else {
                    resolve(null);
                }
            };
            input.click();
        });
    }, []);

    // Auto Save Logic (Firestore)
    useEffect(() => {
        // Don't auto-save if untitled or empty content (optional)
        if (!form.title && !form.content) return;
        // Don't autosave to firestore if recovering
        if (showRecoveryAlert) return;

        // Clear previous timer
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

        // Set new timer (debounce 3s)
        autoSaveTimerRef.current = setTimeout(async () => {
            // Only auto-save if we have a docId (existing draft) or we want to create one
            // Ideally we create a draft on first auto-save.
            // Skipping auto-save if published to avoid accidental publish updates? 
            // " লেখাও সময় অটো-সেভ" implies saving drafts.

            // For now, let's just log or simple save if it's not published ?
            // Implementing a simpler version: Just save to state/localstorage? 
            // The requirement says "Auto Save + Draft System".
            // We should save to Firestore with status 'draft' if no status exists.

            if (loading || uploading) return; // don't interrupt

            setSavingDraft(true);
            try {
                const payload = {
                    ...form,
                    imageUrl: form.imageUrls[0] || "",
                    authorName: form.authorName || defaultAuthorName,
                    authorRole: user.role,
                    updatedAt: new Date().toISOString(),
                };

                // If it's a new entry and we have enough data to be worth saving
                if (!docId && form.title) {
                    payload.status = 'draft';
                    payload.createdAt = new Date().toISOString();
                    const ref = await addDoc(collection(db, "articles"), payload);
                    setDocId(ref.id);
                } else if (docId) {
                    // Update existing
                    await updateDoc(doc(db, "articles", docId), payload);
                }
                setLastSaved(new Date());
            } catch (err) {
                console.error("Auto-save failed", err);
            }
            setSavingDraft(false);

        }, 3000);

        return () => clearTimeout(autoSaveTimerRef.current);
    }, [form, docId, showRecoveryAlert]); // Depend on form changes

    // Handle Tag Input
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTags(tagInput);
        }
    };

    const addTags = (input) => {
        const newTags = input.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag && !form.tags.includes(tag));

        if (newTags.length > 0) {
            setForm(p => ({ ...p, tags: [...p.tags, ...newTags] }));
            setTagInput("");
        }
    };

    // Also handle comma on change for mobile keyboards which might not fire keydown properly
    const handleTagInput = (e) => {
        const val = e.target.value;
        if (val.includes(',')) {
            addTags(val);
        } else {
            setTagInput(val);
        }
    };

    const handleTagPaste = (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        const newTags = paste.split(',').map(tag => tag.trim()).filter(tag => tag && !form.tags.includes(tag));
        if (newTags.length > 0) {
            setForm(p => ({ ...p, tags: [...p.tags, ...newTags] }));
        }
    };

    const removeTag = (tag) => {
        setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }));
    };

    // AI Title Generator (Mock) - Replaced with real logic later if needed
    const generateTitle = () => {
        if (!form.content) return alert("Write some content first!");
        const words = form.content.split(" ").slice(0, 5).join(" ");
        alert(`AI Suggestion: Important Update: ${words}...`);
    };

    // Auto Tags Generator
    const generateAutoTags = async () => {
        if (!form.title && !form.content) return alert("Please write a title or content first!");
        setGeneratingTags(true);
        try {
            const res = await fetch('/api/generate-tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: form.title, content: form.content })
            });
            const data = await res.json();
            if (data.tags && Array.isArray(data.tags)) {
                // Merge unique tags
                const newTags = [...new Set([...form.tags, ...data.tags])];
                setForm(p => ({ ...p, tags: newTags }));
            } else if (data.error) {
                alert("Auto Tag Error: " + data.error);
            }
        } catch (error) {
            console.error("Tag Gen Error:", error);
            alert("Failed to generate tags. Check your connection or API Key.");
        }
        setGeneratingTags(false);
    };

    // Image Upload
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploading(true);

        const newUrls = [];
        for (const file of files) {
            try {
                const url = await uploadToCloudinary(file);
                if (url) newUrls.push(url);
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

                status: existingData?.status === 'published' ? 'published' : status, // Keep published if already published
                updatedAt: new Date().toISOString(),
                publishedAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : (existingData?.publishedAt || new Date().toISOString()),

                authorName: form.authorName || defaultAuthorName,
                authorRole: user.role,

                tags: form.tags,
                ogImage: form.ogImage, // Include OG Image
                videoUrl: form.videoUrl, // Include Video URL
                metaDescription: form.metaDescription, // Manual SEO Description
                categories: form.categories, // Array of categories
                category: form.categories[0] || form.category, // Primary category
                category: form.categories[0] || form.category, // Primary category
                imageCaption: form.imageCaption, // Main Image Caption
                imageAlt: form.imageAlt // Main Image Alt Text
            };

            if (docId) {
                await updateDoc(doc(db, "articles", docId), payload);
            } else {
                const ref = await addDoc(collection(db, "articles"), payload);
                setDocId(ref.id);
            }

            // 🛡️ Clear Local Storage on Success
            localStorage.removeItem(DRAFT_KEY);

            onSuccess();
        } catch (error) {
            alert("Error saving news: " + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden max-w-4xl mx-auto relative">

            {/* 🛡️ Crash Recovery Alert */}
            {showRecoveryAlert && (
                <div className="absolute top-0 left-0 w-full z-50 bg-red-50 border-b border-red-200 p-4 flex items-center justify-between animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-full text-red-600">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-800 text-sm">Found Unsaved Draft!</h3>
                            <p className="text-xs text-red-600">It seems your last session crashed. Do you want to restore it?</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={discardDraft}
                            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50"
                        >
                            Discard
                        </button>
                        <button
                            type="button"
                            onClick={restoreDraft}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 shadow-sm"
                        >
                            Yes, Restore
                        </button>
                    </div>
                </div>
            )}


            {/* Modal for Image Tool */}
            {showImageTool && (
                <ImageConverter
                    onClose={() => setShowImageTool(false)}
                    onProcessed={(url) => {
                        // Add to images (at start if primary)
                        setForm(prev => ({ ...prev, imageUrls: [url, ...prev.imageUrls] }));
                    }}
                />
            )}

            {/* SEO Sidebar */}
            <SeoSidebar
                form={form}
                visible={showSeo}
                onClose={() => setShowSeo(false)}
            />

            {/* Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <PenTool size={20} className="text-blue-600" />
                    {existingData || docId ? "Edit Story" : "Write New Story"}
                    {savingDraft && <span className="text-xs font-normal text-slate-500 animate-pulse ml-2">Saving draft...</span>}
                    {!savingDraft && !showRecoveryAlert && <span className="text-xs font-normal text-green-500 ml-2">Saved to Device 🛡️</span>}
                </h2>
                {onCancel && (
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Back
                    </button>
                )}

                {/* SEO Toggle */}
                <button
                    type="button"
                    onClick={() => setShowSeo(!showSeo)}
                    className={`ml-auto mr-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${showSeo ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    <BarChart3 size={14} /> SEO Check
                </button>
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

                {/* Author Name - Admin Only */}
                {user.role === "admin" && (
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Author Name</label>
                        <input
                            name="authorName"
                            placeholder={`Default: ${defaultAuthorName}`}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.authorName}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {/* Meta Description */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-sm font-bold text-slate-700">Meta Description (SEO)</label>
                        <span className={`text-xs font-bold ${form.metaDescription?.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                            {form.metaDescription?.length || 0}/160
                        </span>
                    </div>
                    <textarea
                        name="metaDescription"
                        placeholder="Write a short summary for Google (150-160 characters)..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                        value={form.metaDescription}
                        onChange={handleChange}
                    />
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Categories (Select Multiple)</label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto">
                            {categories.map((cat, i) => {
                                // Check if this category is selected (check both name and bn)
                                const isChecked = form.categories.includes(cat.name) || form.categories.includes(cat.bn);
                                const isPrimary = form.category === cat.name || form.category === cat.bn;

                                return (
                                    <div key={i} className={`flex items-center justify-between p-2 rounded transition-colors ${isChecked ? 'bg-blue-50 border-blue-100' : 'hover:bg-slate-100'}`}>
                                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setForm(prev => {
                                                        let newCats = checked
                                                            ? [...new Set([...prev.categories.filter(c => c !== cat.bn), cat.name])] // Use English name
                                                            : prev.categories.filter(c => c !== cat.name && c !== cat.bn); // Remove both

                                                        // If we are unchecking the PRIMARY category, we must pick a new one.
                                                        let newPrimary = prev.category;

                                                        if (checked) {
                                                            // Adding a new one: Don't change primary unless it was empty
                                                            if (!newPrimary) newPrimary = cat.name;
                                                        } else {
                                                            // Removing one
                                                            if (prev.category === cat.name || prev.category === cat.bn) {
                                                                // If we removed the primary, default to the first one available
                                                                newPrimary = newCats.length > 0 ? newCats[0] : "";
                                                            }
                                                        }

                                                        return { ...prev, categories: newCats, category: newPrimary };
                                                    });
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <div className="flex flex-col">
                                                <span className={`text-sm ${isPrimary ? 'font-bold text-blue-700' : 'text-slate-700'}`}>
                                                    {cat.bn || cat.name}
                                                </span>
                                                {isPrimary && <span className="text-[10px] text-blue-600 font-bold">Primary</span>}
                                            </div>
                                        </label>

                                        {/* Star Button to Set Primary */}
                                        {isChecked && (
                                            <button
                                                type="button"
                                                onClick={() => setForm(p => ({ ...p, category: cat.name }))}
                                                className="p-1 hover:bg-white rounded-full transition-colors"
                                                title="Set as Primary Category"
                                            >
                                                <Star
                                                    size={16}
                                                    className={isPrimary ? "fill-orange-400 text-orange-400" : "text-slate-300 hover:text-orange-300"}
                                                />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Ghost/Legacy Categories */}
                        {(() => {
                            // Check both English name and Bengali name
                            const ghostCategories = form.categories.filter(c =>
                                !categories.some(cat => cat.name === c || cat.bn === c)
                            );
                            if (ghostCategories.length === 0) return null;
                            return (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="text-xs font-bold text-yellow-800 mb-1 flex items-center gap-1">
                                        <AlertTriangle size={12} /> Legacy / Invalid Categories
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {ghostCategories.map((ghost, i) => (
                                            <span key={i} className="flex items-center gap-1 bg-white border border-yellow-200 text-slate-500 text-xs px-2 py-1 rounded">
                                                {ghost}
                                                <button
                                                    type="button"
                                                    onClick={() => setForm(prev => {
                                                        const newCats = prev.categories.filter(c => c !== ghost);
                                                        // If we removed the primary, reset it
                                                        let newPrimary = prev.category;
                                                        if (newPrimary === ghost) {
                                                            newPrimary = newCats.length > 0 ? newCats[0] : "";
                                                        }
                                                        return { ...prev, categories: newCats, category: newPrimary };
                                                    })}
                                                    className="text-red-400 hover:text-red-600"
                                                    title="Remove this invalid category"
                                                >
                                                    <XCircle size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
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



                {/* Tags Section */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-700">Tags (SEO)</label>
                        <button
                            type="button"
                            onClick={generateAutoTags}
                            disabled={generatingTags || (!form.title && !form.content)}
                            className={`text-xs flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-sm transition-all
                                 ${!form.title && !form.content
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-md hover:scale-105 active:scale-95'
                                }
                             `}
                            title={!form.title && !form.content ? "Write a headline or content first" : "Generate SEO tags using AI"}
                        >
                            {generatingTags ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} className="text-yellow-200" />
                                    <span>Auto Generate Tags</span>
                                </>
                            )}
                        </button>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-wrap gap-2 items-center min-h-[50px]">
                        {form.tags.map((tag, i) => (
                            <span key={i} className="bg-white border border-slate-200 text-slate-700 text-sm font-medium px-2 py-1 rounded-lg flex items-center gap-1">
                                <Hash size={12} className="text-slate-400" />
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500">
                                    <XCircle size={14} />
                                </button>
                            </span>
                        ))}
                        <input
                            value={tagInput}
                            onChange={handleTagInput}
                            onKeyDown={handleTagKeyDown}
                            onPaste={handleTagPaste}
                            placeholder="Add tag..."
                            className="bg-transparent outline-none text-sm text-slate-700 flex-1 min-w-[80px] p-1"
                        />
                    </div>
                    <p className="text-xs text-slate-400">Press Enter or Comma to add tags manually.</p>
                </div>

                {/* Media Upload */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-700">Cover Image & Gallery</label>
                        <button
                            type="button"
                            onClick={() => setShowImageTool(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg hover:shadow-pink-500/30 hover:scale-105 transition-all"
                        >
                            <Wand2 size={14} /> Magic Create
                        </button>
                    </div>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center transition-colors hover:bg-slate-50">
                        <input type="file" multiple onChange={handleImageUpload} className="hidden" id="file-upload" accept="image/*,video/*,audio/*" />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            {uploading ? <RefreshCw className="animate-spin text-blue-500" size={32} /> : <Upload className="text-slate-400" size={32} />}
                            <span className="text-slate-600 font-medium">{uploading ? "Uploading media..." : "Click to upload media"}</span>
                            <span className="text-xs text-slate-400">Supported: JPG, PNG, MP4, MP3, etc.</span>
                        </label>
                    </div>

                    {/* Image Preview */}
                    {form.imageUrls.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {form.imageUrls.map((url, idx) => (
                                <div key={idx} className={`relative w-48 aspect-[2/1] shrink-0 group rounded-lg overflow-hidden border ${idx === 0 ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'} bg-slate-100`}>
                                    <img src={url} alt="preview" className="w-full h-full object-cover" />

                                    {/* Cover Badge */}
                                    {idx === 0 && (
                                        <div className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                                            MAIN COVER
                                        </div>
                                    )}

                                    {/* Set as Cover Button (for non-first images) */}
                                    {idx !== 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newUrls = [...form.imageUrls];
                                                const [selected] = newUrls.splice(idx, 1);
                                                newUrls.unshift(selected); // Move to front
                                                setForm(p => ({ ...p, imageUrls: newUrls }));
                                            }}
                                            className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                                        >
                                            Set as Cover
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, imageUrls: p.imageUrls.filter((_, i) => i !== idx) }))}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                    >
                                        <XCircle size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Image Caption */}
                <div className="space-y-2 mt-4">
                    <label className="text-sm font-bold text-slate-700">Image Caption (Main Image)</label>
                    <input
                        name="imageCaption"
                        placeholder="e.g. ছবি: সংগৃহীত or Photo Credit..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.imageCaption || ""}
                        onChange={handleChange}
                    />
                </div>

                {/* Image Alt Text (SEO) */}
                <div className="space-y-2 mt-4">
                    <label className="text-sm font-bold text-slate-700">Image Alt Text (SEO)</label>
                    <input
                        name="imageAlt"
                        placeholder="Describe the image for Google (e.g. 'Prime Minister at Press Conference')"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.imageAlt || ""}
                        onChange={handleChange}
                    />
                    <p className="text-xs text-slate-400">Important for SEO and Accessibility. Leave empty to use Title.</p>
                </div>


                {/* Video URL Option */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Video URL (YouTube/Vimeo - Optional)</label>
                    <div className="flex gap-2">
                        <input
                            name="videoUrl"
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.videoUrl}
                            onChange={handleChange}
                        />
                    </div>
                    <p className="text-xs text-slate-400">If provided, this video might be shown effectively instead of the cover image.</p>
                </div>

                {/* SEO Image (OG Image) */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">SEO / OG Image</label>
                    <div className="flex gap-2">
                        <input
                            name="ogImage"
                            placeholder="https://... (Leave empty to use cover image)"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.ogImage}
                            onChange={handleChange}
                        />
                        <label className="flex items-center justify-center p-3 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors" title="Upload OG Image">
                            {uploading ? <Loader2 className="animate-spin text-slate-600" size={20} /> : <Upload className="text-slate-600" size={20} />}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    if (e.target.files[0]) {
                                        setUploading(true);
                                        try {
                                            const url = await uploadToCloudinary(e.target.files[0]);
                                            if (url) setForm(p => ({ ...p, ogImage: url }));
                                        } catch (err) { console.error(err); }
                                        setUploading(false);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-bold text-slate-700">Story Content</label>
                        {uploadingEditor && <span className="text-xs text-blue-500 animate-pulse">Uploading image...</span>}
                    </div>

                    <TiptapEditor
                        content={form.content}
                        onChange={handleEditorChange}
                        onImageUpload={handleEditorImageUpload}
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

            </form >
        </div >
    );
}
