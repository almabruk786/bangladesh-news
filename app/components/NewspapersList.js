"use client";
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function NewspapersList() {
    const [newspapers, setNewspapers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

    return (
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800">
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {newspapers.map((paper) => (
                        <Link
                            key={paper.id || paper.name}
                            href={`/site/${paper.id}`}
                            target="_blank"
                            rel="noopener noreferrer"

                            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-xl hover:border-red-200 transition-all duration-300 flex flex-col items-center justify-between gap-4 text-center h-40 relative"
                        >
                            <div className="flex-1 w-full flex items-center justify-center relative">
                                {paper.logo ? (
                                    <img
                                        src={paper.logo}
                                        alt={paper.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                        className="max-h-16 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition duration-300"
                                    />
                                ) : null}
                                <span
                                    style={{ display: paper.logo ? 'none' : 'block' }}
                                    className="text-xl font-bold font-serif text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                >
                                    {paper.bn || paper.name}
                                </span>
                            </div>

                            <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-3">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-red-600 transition-colors truncate block">
                                    {paper.name}
                                </span>
                            </div>

                            <div className="absolute top-3 right-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink size={14} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && newspapers.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    No newspapers found.
                </div>
            )}

            <div className="mt-12 text-center">
                <p className="text-slate-400 text-sm">More newspapers and e-papers coming soon...</p>
            </div>
        </div>
    );
}
