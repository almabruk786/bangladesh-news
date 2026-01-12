"use client";
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NewspapersList({ initialPapers = [] }) {
    // Purely presentational if props provided. 
    // If empty, we just show empty state (no more client fetch loop)

    // Sort logic handled on server, but can do a quick safety sort here too if needed.
    // Assuming server provides sorted data.

    const newspapers = initialPapers;

    const onlinePapers = newspapers.filter(p => !p.type || p.type === 'online');
    const ePapers = newspapers.filter(p => p.type === 'epaper');

    return (
        <div className="space-y-8 md:space-y-12">
            {!newspapers.length ? (
                <div className="flex justify-center py-20 text-slate-400">
                    No newspapers found.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
                    {/* Section 1: E-Papers (First) */}
                    {ePapers.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 h-full">
                            <div className="mb-6 border-l-4 border-blue-600 pl-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase">
                                    E-Newspaper (E-Paper)
                                </h2>
                                <p className="text-slate-500 text-xs mt-1">
                                    সকল বাংলা ই-পেপার - কাগজের পত্রিকার মতো পড়তে চাইলে এখানে দেখুন
                                </p>
                            </div>
                            <PaperGrid papers={ePapers} />
                        </div>
                    )}

                    {/* Section 2: Online Newspapers */}
                    {onlinePapers.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 h-full">
                            <div className="mb-6 border-l-4 border-green-600 pl-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase">
                                    Online Newspaper
                                </h2>
                                <p className="text-slate-500 text-xs mt-1">
                                    বাংলা অনলাইন সংবাদপত্র সমূহ
                                </p>
                            </div>
                            <PaperGrid papers={onlinePapers} />
                        </div>
                    )}
                </div>
            )}

            <div className="text-center">
                <p className="text-slate-400 text-sm">More newspapers and e-papers coming soon...</p>
            </div>
        </div>
    );
}

const PaperGrid = ({ papers }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {papers.map((paper) => (
            <Link
                key={paper.id || paper.name}
                href={`/site/${paper.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-xl hover:border-red-200 transition-all duration-300 flex flex-col items-center justify-between h-40 relative"
            >
                <div className="flex-1 w-full flex items-center justify-center relative">
                    {paper.logo ? (
                        <img
                            src={paper.logo}
                            alt={paper.name}
                            loading="lazy"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                            className="max-h-16 max-w-full object-contain transition duration-300 dark:bg-slate-200 dark:p-1 dark:rounded"
                        />
                    ) : null}
                    <span
                        style={{ display: paper.logo ? 'none' : 'block' }}
                        className="text-xl font-bold font-serif text-blue-600 dark:text-blue-400 group-hover:text-red-500 transition-colors mt-2"
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
);
