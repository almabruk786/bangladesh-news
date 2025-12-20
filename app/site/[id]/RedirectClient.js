"use client";
import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RedirectClient({ paper }) {
    const [seconds, setSeconds] = useState(8);
    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Check if window exists to prevent SSR errors
                    if (typeof window !== 'undefined') {
                        // Use replace to prevent history loop when clicking Back/Close
                        window.location.replace(paper.url);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [paper.url]);

    return (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 shadow-xl border border-slate-100 dark:border-slate-800 text-center relative">
            {/* Close Button */}
            <button
                onClick={() => router.push('/newspapers')}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                aria-label="Close"
            >
                <X size={24} />
            </button>
            {/* Header */}
            <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4 p-4 border border-slate-100">
                    {paper.logo ? (
                        <img src={paper.logo} alt={paper.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                        <span className="text-2xl font-bold text-slate-400">{paper.name[0]}</span>
                    )}
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{paper.name}</h1>
                <h2 className="text-xl text-slate-500 font-serif">{paper.bn}</h2>
            </div>

            {/* Timer State */}
            <div className="mb-8">
                {seconds > 0 ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-red-600 animate-spin flex items-center justify-center"></div>
                        <p className="text-slate-500 text-sm">Redirecting in <span className="font-bold text-red-600 text-lg">{seconds}</span> seconds...</p>
                    </div>
                ) : (
                    <div className="text-green-600 font-bold flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" />
                        Opening Website...
                    </div>
                )}
            </div>

            {/* Manual Action */}
            <a
                href={paper.url}
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-red-600/30"
            >
                Visit Website Now <ExternalLink size={20} />
            </a>

            <p className="mt-6 text-xs text-slate-400 max-w-sm mx-auto">
                You are being redirected to the official website of {paper.name}. Bakalia News is not affiliated with this publication.
            </p>
        </div>
    );
}
