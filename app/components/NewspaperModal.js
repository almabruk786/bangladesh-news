import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function NewspaperModal({ isOpen, onClose }) {
    const [newspapers, setNewspapers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchPapers = async () => {
                try {
                    const q = query(collection(db, "newspapers"), orderBy("name"));
                    const querySnapshot = await getDocs(q);
                    const papers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setNewspapers(papers);
                } catch (error) {
                    console.error("Error fetching newspapers:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPapers();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">All Bangla Newspapers</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Grid Content */}
                <div className="overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950/50">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {newspapers.map((paper) => (
                                <Link
                                    key={paper.id || paper.name}
                                    href={paper.url}
                                    target="_blank"
                                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 md:p-3 hover:shadow-lg hover:border-red-200 transition-all duration-300 flex flex-col items-center justify-between gap-3 text-center h-32 md:h-36"
                                >
                                    <div className="flex-1 w-full flex items-center justify-center p-2 relative">
                                        {paper.logo ? (
                                            <img src={paper.logo} alt={paper.name} className="max-h-12 md:max-h-14 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition duration-300" />
                                        ) : (
                                            <span className="text-xl font-bold font-serif text-slate-400">{paper.bn}</span>
                                        )}
                                        <ExternalLink size={12} className="absolute top-0 right-0 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-2">
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-red-600 transition-colors">
                                            {paper.name}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm">More newspapers coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
