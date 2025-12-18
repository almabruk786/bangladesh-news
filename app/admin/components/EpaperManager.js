"use client";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Trash2, Edit2, Plus, ExternalLink, RefreshCw, Upload } from 'lucide-react';
import BulkImport from './BulkImport';

export default function EpaperManager() {
    const [newspapers, setNewspapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [showImport, setShowImport] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        bn: '',
        url: '',
        logo: '',
        order: '', // Default to empty for auto-calc
        type: 'online' // Default to Online Newspaper
    });

    // Calculate next auto order based on current type selection
    const relevantPapers = newspapers.filter(n => (n.type || 'online') === formData.type);
    const maxOrder = relevantPapers.reduce((max, n) => Math.max(max, n.order || 0), 0);
    const nextAutoOrder = maxOrder + 1;

    // Fetch Newspapers
    useEffect(() => {
        const q = query(collection(db, "newspapers"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sort to avoid Firestore Index requirement
            newsData.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999;
                const orderB = b.order !== undefined ? b.order : 999;

                // Sort by Order first
                if (orderA !== orderB) return orderA - orderB;

                // Then by Name
                return a.name.localeCompare(b.name);
            });

            setNewspapers(newsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Handle Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.url) return;

        const submissionData = {
            ...formData,
            // Use manually entered order OR auto-calculated one
            order: formData.order !== '' ? parseInt(formData.order) : nextAutoOrder
        };

        try {
            if (isEditing && currentId) {
                await updateDoc(doc(db, "newspapers", currentId), submissionData);
            } else {
                await addDoc(collection(db, "newspapers"), submissionData);
            }
            resetForm();
        } catch (error) {
            console.error("Error saving newspaper:", error);
        }
    };

    const handleEdit = (paper) => {
        setFormData({
            name: paper.name,
            bn: paper.bn || '',
            url: paper.url,
            logo: paper.logo || '',
            order: paper.order !== undefined ? paper.order : '',
            type: paper.type || 'online'
        });
        setIsEditing(true);
        setCurrentId(paper.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this newspaper?")) {
            await deleteDoc(doc(db, "newspapers", id));
        }
    };

    const resetForm = () => {
        setFormData({ name: '', bn: '', url: '', logo: '', order: '', type: 'online' });
        setIsEditing(false);
        setCurrentId(null);
    };

    // Seed Default Data (One-time helper)
    const seedDefaults = async () => {
        const defaults = [
            // Major / Existing (Preserving manual SVGs/PNGs where good)
            { name: "Prothom Alo", bn: "প্রথম আলো", url: "https://www.prothomalo.com", logo: "/newspapers/prothom-alo.svg", type: 'online' },
            { name: "Bangladesh Pratidin", bn: "বাংলাদেশ প্রতিদিন", url: "https://www.bd-pratidin.com", logo: "/newspapers/bd-pratidin.svg", type: 'online' },
            { name: "Ittefaq", bn: "ইত্তেফাক", url: "https://www.ittefaq.com.bd", logo: "/newspapers/ittefaq.png", type: 'online' },
            { name: "Kaler Kantho", bn: "কালের কণ্ঠ", url: "https://www.kalerkantho.com", logo: "/newspapers/kaler-kantho.svg", type: 'online' },
            { name: "Naya Diganta", bn: "নয়া দিগন্ত", url: "https://www.dailynayadiganta.com", logo: "/newspapers/dailynayadiganta_com.png", type: 'online' },
            { name: "Amar Sangbad", bn: "আমার সংবাদ", url: "https://www.amarsangbad.com", logo: "https://www.amarsangbad.com/images/default/logo.png", type: 'online' },
            { name: "Jugantor", bn: "যুগান্তর", url: "https://www.jugantor.com", logo: "/newspapers/jugantor.svg", type: 'online' },
            { name: "Samakal", bn: "সমকাল", url: "https://samakal.com", logo: "/newspapers/samakal.png", type: 'online' },
            { name: "Janakantha", bn: "জনকণ্ঠ", url: "https://www.dailyjanakantha.com", logo: "/newspapers/dailyjanakantha_com.png", type: 'online' },
            { name: "Manab Zamin", bn: "মানবজমিন", url: "https://mzamin.com", logo: "https://mzamin.com/assets/images/logo.png", type: 'online' },
            { name: "The Daily Star", bn: "দ্য ডেইলি স্টার", url: "https://www.thedailystar.net", logo: "/newspapers/daily-star.svg", type: 'online' },
            { name: "Dhaka Tribune", bn: "ঢাকা ট্রিবিউন", url: "https://www.dhakatribune.com", logo: "/newspapers/dhaka-tribune.png", type: 'online' },

            // New Additions (Crawled Logos)
            { name: "Protidiners Sangbad", bn: "প্রতিদিনের সংবাদ", url: "https://www.protidinersangbad.com", logo: "", type: 'online' },
            { name: "Daily Sangram", bn: "সংগ্রাম", url: "https://www.dailysangram.com", logo: "/newspapers/dailysangram_com.png", type: 'online' },
            { name: "Amader Shomoy", bn: "আমাদের সময়", url: "https://www.dainikamadershomoy.com", logo: "/newspapers/dainikamadershomoy_com.png", type: 'online' },
            { name: "Bonik Barta", bn: "বণিক বার্তা", url: "https://bonikbarta.net", logo: "/newspapers/bonikbarta_net.png", type: 'online' },
            { name: "Jai Jai Din", bn: "যায় যায় দিন", url: "https://www.jjdin.com", logo: "", type: 'online' },
            { name: "Bhorer Kagoj", bn: "ভোরের কাগজ", url: "https://www.bhorerkagoj.net", logo: "/newspapers/bhorerkagoj_net.png", type: 'online' },
            { name: "Arthoniteer Kagoj", bn: "অর্থনীতির কাগজ", url: "https://www.arthoniteerkagoj.com", logo: "/newspapers/arthoniteerkagoj_com.png", type: 'online' },
            { name: "Inqilab", bn: "ইনকিলাব", url: "https://www.dailyinqilab.com", logo: "https://m.dailyinqilab.com/includes/themes/inqilabmobile/images/logo.png", type: 'online' },
            { name: "Sangbad", bn: "সংবাদ", url: "https://thesangbad.net", logo: "", type: 'online' },
            { name: "Manobkantha", bn: "মানবকিণ্ঠ", url: "https://www.manobkantha.com", logo: "", type: 'online' },
            { name: "Suprobhat", bn: "সুপ্রভাত", url: "https://suprobhat.com", logo: "", type: 'online' },
            { name: "Bangladesh Journal", bn: "বাংলাদেশ জার্নাল", url: "https://www.bd-journal.com", logo: "", type: 'online' },
            { name: "Dinkal", bn: "দিনকাল", url: "https://dailydinkal.net", logo: "", type: 'online' },
            { name: "Alokito Bangladesh", bn: "আলোকিত বাংলাদেশ", url: "https://www.alokitobangladesh.com", logo: "/newspapers/alokitobangladesh_com.png", type: 'online' },
            { name: "Ajker Bazzar", bn: "আজকের বাজার", url: "https://www.ajkerbazzar.com", logo: "", type: 'online' },
            { name: "Amader Orthoneeti", bn: "আমাদের অর্থনীতি", url: "https://www.amaderorthoneeti.com", logo: "", type: 'online' },
            { name: "Bangladesh Post", bn: "বাংলাদেশ পোস্ট", url: "https://bangladeshpost.net", logo: "/newspapers/bangladeshpost_net.png", type: 'online' },
            { name: "Sorejomin Barta", bn: "সরেজমিন বার্তা", url: "https://www.sorejominbarta.com", logo: "", type: 'online' },
            { name: "Khabarpatra", bn: "খবরপত্র", url: "https://www.khabarpatrabd.com", logo: "", type: 'online' },
            { name: "Vorer Pata", bn: "ভোরের পাতা", url: "https://www.dailyvorerpata.com", logo: "/newspapers/dailyvorerpata_com.png", type: 'online' },
            { name: "Shomoyer Alo", bn: "সময়ের আলো", url: "https://www.shomoyeralo.com", logo: "/newspapers/shomoyeralo_com.png", type: 'online' },
            { name: "Share Biz", bn: "শেয়ার বিজ", url: "https://sharebiz.net", logo: "/newspapers/sharebiz_net.png", type: 'online' },
            { name: "Bartoman", bn: "বর্তমান", url: "https://dailybartoman.com", logo: "", type: 'online' },
            { name: "Ajkaler Khobor", bn: "আজকালের খবর", url: "https://www.ajkalerkhobor.com", logo: "/newspapers/ajkalerkhobor_com.png", type: 'online' },
            { name: "Sangbad Konika", bn: "সংবাদ কণিকা", url: "https://sangbadkonika.com", logo: "", type: 'online' },
            { name: "Khola Kagoj", bn: "খোলা কাগজ", url: "https://www.kholakagojbd.com", logo: "/newspapers/kholakagojbd_com.png", type: 'online' },
            { name: "Gonokantho", bn: "গণকণ্ঠ", url: "https://gonokantho.com", logo: "", type: 'online' },
            { name: "Daily Observer", bn: "অবজারভার", url: "https://www.observerbd.com", logo: "/newspapers/observerbd_com.png", type: 'online' },
            { name: "Financial Express", bn: "ফাইন্যান্সিয়াল এক্সপ্রেস", url: "https://thefinancialexpress.com.bd", logo: "", type: 'online' },
            { name: "Desh Rupantor", bn: "দেশ রূপান্তর", url: "https://www.deshrupantor.com", logo: "/newspapers/deshrupantor_com.png", type: 'online' },
            { name: "Bangladesher Khabor", bn: "বাংলাদেশের খবর", url: "https://www.bangladesherkhabor.net", logo: "/newspapers/bangladesherkhabor_net.png", type: 'online' },
            { name: "TBS News", bn: "টিবিএস", url: "https://tbsnews.net", logo: "", type: 'online' },
            { name: "Business Post", bn: "বিজনেস পোস্ট", url: "https://businesspostbd.com", logo: "", type: 'online' },
            { name: "Ajker Patrika", bn: "আজকের পত্রিকা", url: "https://www.ajkerpatrika.com", logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Ajker_Patrika_Logo.png", type: 'online' },
            { name: "Dainik Bangla", bn: "দৈনিক বাংলা", url: "https://www.dainikbangla.com.bd", logo: "", type: 'online' },
        ];

        let added = 0;
        let updated = 0;

        if (confirm(`This will attempt to sync ${defaults.length} newspapers. It will add new ones and UPDATE logos for existing ones if missing. Continue?`)) {
            const existingMap = new Map(newspapers.map(n => [n.url, n.id]));

            for (const paper of defaults) {
                if (existingMap.has(paper.url)) {
                    // Check if we should update (e.g. if DB has no logo but we have one)
                    const id = existingMap.get(paper.url);
                    const existingPaper = newspapers.find(n => n.id === id);
                    if (!existingPaper.logo && paper.logo) {
                        await updateDoc(doc(db, "newspapers", id), { logo: paper.logo });
                        updated++;
                    }
                } else {
                    await addDoc(collection(db, "newspapers"), paper);
                    added++;
                }
            }
            alert(`Sync Complete!\nAdded: ${added}\nUpdated: ${updated}`);
        }
    };

    const handleReorder = async (targetType) => {
        if (!confirm(`Are you sure you want to re-order all ${targetType === 'epaper' ? 'E-Papers' : 'Online Newspapers'} sequentially (1, 2, 3...)?`)) return;

        const papersToReorder = newspapers
            .filter(n => (n.type || 'online') === targetType)
            .sort((a, b) => (a.order || 999) - (b.order || 999));

        if (papersToReorder.length === 0) return;

        let batchCount = 0;
        try {
            // Using Promise.all for parallel updates (Firestore batch limit is 500, we assume less here or simple concurrent)
            await Promise.all(papersToReorder.map((paper, index) => {
                const newOrder = index + 1;
                if (paper.order !== newOrder) {
                    batchCount++;
                    return updateDoc(doc(db, "newspapers", paper.id), { order: newOrder });
                }
                return Promise.resolve();
            }));
            alert(`Updated orders for ${batchCount} newspapers.`);
        } catch (error) {
            console.error("Error reordering:", error);
            alert("Failed to reorder. Check console.");
        }
    };

    const [uploading, setUploading] = useState(false);

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
        const res = await fetch(endpoint, { method: "POST", body: formData });
        const data = await res.json();
        return data.secure_url;
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            if (url) setFormData({ ...formData, logo: url });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed! Check console.");
        }
        setUploading(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            {/* Header ... (kept same, just ensuring context for replacement) */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Newspaper Manager <span className="text-sm font-normal text-slate-500">({newspapers.length} Papers)</span></h2>
                <div className="flex gap-2">
                    <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm font-bold hover:bg-green-200">
                        <Upload size={14} /> Import
                    </button>
                </div>
            </div>

            {showImport && (
                <BulkImport
                    onClose={() => setShowImport(false)}
                    onComplete={() => { }}
                />
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Newspaper Type</label>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value="online"
                                checked={formData.type === 'online'}
                                onChange={() => setFormData({ ...formData, type: 'online' })}
                                className="accent-red-600"
                            />
                            <span className="text-sm font-medium">Online Newspaper</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value="epaper"
                                checked={formData.type === 'epaper'}
                                onChange={() => setFormData({ ...formData, type: 'epaper' })}
                                className="accent-blue-600"
                            />
                            <span className="text-sm font-medium">E-Paper</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">English Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Prothom Alo"
                        className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Bangla Name</label>
                    <input
                        type="text"
                        placeholder="e.g. প্রথম আলো"
                        className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                        value={formData.bn}
                        onChange={e => setFormData({ ...formData, bn: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Website URL</label>
                    <input
                        type="url"
                        placeholder="https://..."
                        className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                        value={formData.url}
                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Logo URL (or Upload GIF/Image)</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="https://..."
                            className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                            value={formData.logo}
                            onChange={e => setFormData({ ...formData, logo: e.target.value })}
                        />
                        <label className={`flex items-center justify-center px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded cursor-pointer hover:bg-slate-300 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
                            {uploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Display Order</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder={`Auto (${nextAutoOrder})`}
                            className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                            value={formData.order}
                            onChange={e => setFormData({ ...formData, order: e.target.value })}
                        />
                    </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-2">
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-500 text-sm font-bold hover:bg-slate-200 rounded">Cancel</button>
                    )}
                    <button type="submit" className="px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 flex items-center gap-2">
                        {isEditing ? <Edit2 size={16} /> : <Plus size={16} />}
                        {isEditing ? 'Update Newspaper' : 'Add Newspaper'}
                    </button>
                </div>
            </form>

            {/* List */}
            {/* Helpers */}
            {(() => {
                const onlinePapers = newspapers.filter(p => !p.type || p.type === 'online');
                const ePapers = newspapers.filter(p => p.type === 'epaper');

                const NewspaperRow = ({ paper }) => (
                    <div key={paper.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded bg-white dark:bg-slate-900 mb-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center p-1 relative">
                                {paper.logo ? <img src={paper.logo} alt={paper.name} className="max-w-full max-h-full object-contain" /> : <span className="text-xs font-bold text-slate-400">No Logo</span>}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    {paper.name}
                                    <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">#{paper.order || 999}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${paper.type === 'epaper' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {paper.type === 'epaper' ? 'E-PAPER' : 'ONLINE'}
                                    </span>
                                </h4>
                                <a href={paper.url} target="_blank" className="text-xs text-blue-500 flex items-center gap-1 hover:underline"><ExternalLink size={10} /> {paper.url}</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(paper)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(paper.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={16} /></button>
                        </div>
                    </div>
                );

                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Online Papers Column */}
                        <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4 border-b pb-2 border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                                    Online Newspapers
                                    <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{onlinePapers.length}</span>
                                </h3>
                                <button onClick={() => handleReorder('online')} className="text-[10px] uppercase font-bold text-blue-500 hover:bg-blue-50 px-2 py-1 rounded">
                                    Fix Order
                                </button>
                            </div>
                            <div className="space-y-2">
                                {onlinePapers.map(paper => <NewspaperRow key={paper.id} paper={paper} />)}
                                {onlinePapers.length === 0 && <div className="text-center py-8 text-slate-400 text-sm italic">No online newspapers yet.</div>}
                            </div>
                        </div>

                        {/* E-Papers Column */}
                        <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4 border-b pb-2 border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                                    E-Newspapers (E-Paper)
                                    <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{ePapers.length}</span>
                                </h3>
                                <button onClick={() => handleReorder('epaper')} className="text-[10px] uppercase font-bold text-blue-500 hover:bg-blue-50 px-2 py-1 rounded">
                                    Fix Order
                                </button>
                            </div>
                            <div className="space-y-2">
                                {ePapers.map(paper => <NewspaperRow key={paper.id} paper={paper} />)}
                                {ePapers.length === 0 && <div className="text-center py-8 text-slate-400 text-sm italic">No E-Papers yet.</div>}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
