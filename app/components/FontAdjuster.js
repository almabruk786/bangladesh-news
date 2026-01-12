"use client";
import { useEffect, useState } from 'react';
import { Type } from 'lucide-react';

export default function FontAdjuster() {
    const [fontSize, setFontSize] = useState('medium'); // small, medium, large
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem('article_font_size');
        if (saved) setFontSize(saved);
    }, []);

    useEffect(() => {
        // Apply to article content
        const article = document.querySelector('.article-content');
        if (article) {
            article.classList.remove('text-sm', 'text-base', 'text-lg');
            if (fontSize === 'small') article.classList.add('text-sm');
            else if (fontSize === 'medium') article.classList.add('text-base');
            else if (fontSize === 'large') article.classList.add('text-lg');
        }
        localStorage.setItem('article_font_size', fontSize);
    }, [fontSize]);

    return (
        <div className="fixed bottom-24 right-4 z-40">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all"
                aria-label="Adjust font size"
            >
                <Type size={20} className="text-slate-700 dark:text-slate-300" />
            </button>

            {isOpen && (
                <div className="absolute bottom-16 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3 min-w-[160px]">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Font Size</p>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setFontSize('small')}
                            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${fontSize === 'small'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            A- Small
                        </button>
                        <button
                            onClick={() => setFontSize('medium')}
                            className={`px-3 py-2 rounded text-base font-medium transition-colors ${fontSize === 'medium'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            A Medium
                        </button>
                        <button
                            onClick={() => setFontSize('large')}
                            className={`px-3 py-2 rounded text-lg font-medium transition-colors ${fontSize === 'large'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            A+ Large
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
