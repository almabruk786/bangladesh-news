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
        logo: ''
    });

    // Fetch Newspapers
    useEffect(() => {
        const q = query(collection(db, "newspapers"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNewspapers(newsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Handle Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.url) return;

        try {
            if (isEditing && currentId) {
                await updateDoc(doc(db, "newspapers", currentId), formData);
            } else {
                await addDoc(collection(db, "newspapers"), formData);
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
            logo: paper.logo || ''
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
        setFormData({ name: '', bn: '', url: '', logo: '' });
        setIsEditing(false);
        setCurrentId(null);
    };

    // Seed Default Data (One-time helper)
    const seedDefaults = async () => {
        const defaults = [
            // Major / Existing (Preserving manual SVGs/PNGs where good)
            { name: "Prothom Alo", bn: "প্রথম আলো", url: "https://www.prothomalo.com", logo: "/newspapers/prothom-alo.svg" },
            { name: "Bangladesh Pratidin", bn: "বাংলাদেশ প্রতিদিন", url: "https://www.bd-pratidin.com", logo: "/newspapers/bd-pratidin.svg" },
            { name: "Ittefaq", bn: "ইত্তেফাক", url: "https://www.ittefaq.com.bd", logo: "/newspapers/ittefaq.png" },
            { name: "Kaler Kantho", bn: "কালের কণ্ঠ", url: "https://www.kalerkantho.com", logo: "/newspapers/kaler-kantho.svg" },
            { name: "Naya Diganta", bn: "নয়া দিগন্ত", url: "https://www.dailynayadiganta.com", logo: "/newspapers/dailynayadiganta_com.png" },
            { name: "Amar Sangbad", bn: "আমার সংবাদ", url: "https://www.amarsangbad.com", logo: "https://www.amarsangbad.com/images/default/logo.png" },
            { name: "Jugantor", bn: "যুগান্তর", url: "https://www.jugantor.com", logo: "/newspapers/jugantor.svg" },
            { name: "Samakal", bn: "সমকাল", url: "https://samakal.com", logo: "/newspapers/samakal.png" },
            { name: "Janakantha", bn: "জনকণ্ঠ", url: "https://www.dailyjanakantha.com", logo: "/newspapers/dailyjanakantha_com.png" },
            { name: "Manab Zamin", bn: "মানবজমিন", url: "https://mzamin.com", logo: "https://mzamin.com/assets/images/logo.png" },
            { name: "The Daily Star", bn: "দ্য ডেইলি স্টার", url: "https://www.thedailystar.net", logo: "/newspapers/daily-star.svg" },
            { name: "Dhaka Tribune", bn: "ঢাকা ট্রিবিউন", url: "https://www.dhakatribune.com", logo: "/newspapers/dhaka-tribune.png" },

            // New Additions (Crawled Logos)
            { name: "Protidiners Sangbad", bn: "প্রতিদিনের সংবাদ", url: "https://www.protidinersangbad.com", logo: "" },
            { name: "Daily Sangram", bn: "সংগ্রাম", url: "https://www.dailysangram.com", logo: "/newspapers/dailysangram_com.png" },
            { name: "Amader Shomoy", bn: "আমাদের সময়", url: "https://www.dainikamadershomoy.com", logo: "/newspapers/dainikamadershomoy_com.png" },
            { name: "Bonik Barta", bn: "বণিক বার্তা", url: "https://bonikbarta.net", logo: "/newspapers/bonikbarta_net.png" },
            { name: "Jai Jai Din", bn: "যায় যায় দিন", url: "https://www.jjdin.com", logo: "" },
            { name: "Bhorer Kagoj", bn: "ভোরের কাগজ", url: "https://www.bhorerkagoj.net", logo: "/newspapers/bhorerkagoj_net.png" },
            { name: "Arthoniteer Kagoj", bn: "অর্থনীতির কাগজ", url: "https://www.arthoniteerkagoj.com", logo: "/newspapers/arthoniteerkagoj_com.png" },
            { name: "Inqilab", bn: "ইনকিলাব", url: "https://www.dailyinqilab.com", logo: "https://m.dailyinqilab.com/includes/themes/inqilabmobile/images/logo.png" },
            { name: "Sangbad", bn: "সংবাদ", url: "https://thesangbad.net", logo: "" },
            { name: "Manobkantha", bn: "মানবকিণ্ঠ", url: "https://www.manobkantha.com", logo: "" },
            { name: "Suprobhat", bn: "সুপ্রভাত", url: "https://suprobhat.com", logo: "" },
            { name: "Bangladesh Journal", bn: "বাংলাদেশ জার্নাল", url: "https://www.bd-journal.com", logo: "" },
            { name: "Dinkal", bn: "দিনকাল", url: "https://dailydinkal.net", logo: "" },
            { name: "Alokito Bangladesh", bn: "আলোকিত বাংলাদেশ", url: "https://www.alokitobangladesh.com", logo: "/newspapers/alokitobangladesh_com.png" },
            { name: "Ajker Bazzar", bn: "আজকের বাজার", url: "https://www.ajkerbazzar.com", logo: "" },
            { name: "Amader Orthoneeti", bn: "আমাদের অর্থনীতি", url: "https://www.amaderorthoneeti.com", logo: "" },
            { name: "Bangladesh Post", bn: "বাংলাদেশ পোস্ট", url: "https://bangladeshpost.net", logo: "/newspapers/bangladeshpost_net.png" },
            { name: "Sorejomin Barta", bn: "সরেজমিন বার্তা", url: "https://www.sorejominbarta.com", logo: "" },
            { name: "Khabarpatra", bn: "খবরপত্র", url: "https://www.khabarpatrabd.com", logo: "" },
            { name: "Vorer Pata", bn: "ভোরের পাতা", url: "https://www.dailyvorerpata.com", logo: "/newspapers/dailyvorerpata_com.png" },
            { name: "Shomoyer Alo", bn: "সময়ের আলো", url: "https://www.shomoyeralo.com", logo: "/newspapers/shomoyeralo_com.png" },
            { name: "Share Biz", bn: "শেয়ার বিজ", url: "https://sharebiz.net", logo: "/newspapers/sharebiz_net.png" },
            { name: "Bartoman", bn: "বর্তমান", url: "https://dailybartoman.com", logo: "" },
            { name: "Ajkaler Khobor", bn: "আজকালের খবর", url: "https://www.ajkalerkhobor.com", logo: "/newspapers/ajkalerkhobor_com.png" },
            { name: "Sangbad Konika", bn: "সংবাদ কণিকা", url: "https://sangbadkonika.com", logo: "" },
            { name: "Khola Kagoj", bn: "খোলা কাগজ", url: "https://www.kholakagojbd.com", logo: "/newspapers/kholakagojbd_com.png" },
            { name: "Gonokantho", bn: "গণকণ্ঠ", url: "https://gonokantho.com", logo: "" },
            { name: "Daily Observer", bn: "অবজারভার", url: "https://www.observerbd.com", logo: "/newspapers/observerbd_com.png" },
            { name: "Financial Express", bn: "ফাইন্যান্সিয়াল এক্সপ্রেস", url: "https://thefinancialexpress.com.bd", logo: "" },
            { name: "Desh Rupantor", bn: "দেশ রূপান্তর", url: "https://www.deshrupantor.com", logo: "/newspapers/deshrupantor_com.png" },
            { name: "Bangladesher Khabor", bn: "বাংলাদেশের খবর", url: "https://www.bangladesherkhabor.net", logo: "/newspapers/bangladesherkhabor_net.png" },
            { name: "TBS News", bn: "টিবিএস", url: "https://tbsnews.net", logo: "" },
            { name: "Business Post", bn: "বিজনেস পোস্ট", url: "https://businesspostbd.com", logo: "" },
            { name: "Ajker Patrika", bn: "আজকের পত্রিকা", url: "https://www.ajkerpatrika.com", logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Ajker_Patrika_Logo.png" },
            { name: "Dainik Bangla", bn: "দৈনিক বাংলা", url: "https://www.dainikbangla.com.bd", logo: "" },
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

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">E-Paper Manager <span className="text-sm font-normal text-slate-500">({newspapers.length} Papers)</span></h2>
                <div className="flex gap-2">
                    <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm font-bold hover:bg-green-200">
                        <Upload size={14} /> Import from Excel/CSV
                    </button>
                    <button onClick={seedDefaults} className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm font-bold hover:bg-blue-200">
                        <RefreshCw size={14} /> Import/Update Defaults
                    </button>
                </div>
            </div>

            {showImport && (
                <BulkImport
                    onClose={() => setShowImport(false)}
                    onComplete={() => {
                        // Optional: refresh logic if needed, but snapshot handles it
                    }}
                />
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-xs font-bold text-slate-500 mb-1">Logo URL (or Path)</label>
                    <input
                        type="text"
                        placeholder="/newspapers/logo.svg"
                        className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                        value={formData.logo}
                        onChange={e => setFormData({ ...formData, logo: e.target.value })}
                    />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
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
            <div className="space-y-3">
                {newspapers.map((paper) => (
                    <div key={paper.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center p-1">
                                {paper.logo ? <img src={paper.logo} alt={paper.name} className="max-w-full max-h-full object-contain" /> : <span className="text-xs font-bold text-slate-400">No Logo</span>}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">{paper.name} <span className="text-slate-400 font-normal text-sm">({paper.bn})</span></h4>
                                <a href={paper.url} target="_blank" className="text-xs text-blue-500 flex items-center gap-1 hover:underline"><ExternalLink size={10} /> {paper.url}</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(paper)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(paper.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                {newspapers.length === 0 && !loading && (
                    <div className="text-center py-10 text-slate-400 text-sm">No newspapers found. Import defaults above.</div>
                )}
            </div>
        </div>
    );
}
