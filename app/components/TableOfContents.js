"use client";
import { useEffect, useState } from 'react';
import { List } from 'lucide-react';

export default function TableOfContents({ content }) {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Extract headings from article content
        const article = document.querySelector('.article-content');
        if (!article) return;

        const headingElements = article.querySelectorAll('h2, h3');
        const extractedHeadings = Array.from(headingElements).map((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id; // Add ID for scroll linking
            return {
                id,
                text: heading.textContent,
                level: heading.tagName === 'H2' ? 2 : 3
            };
        });

        setHeadings(extractedHeadings);

        // Intersection Observer for active heading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -70% 0px' }
        );

        headingElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [content]);

    const scrollToHeading = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setIsOpen(false);
    };

    if (headings.length === 0) return null;

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed bottom-40 right-4 z-40 bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all"
                aria-label="Table of contents"
            >
                <List size={20} className="text-slate-700 dark:text-slate-300" />
            </button>

            {/* Desktop Sticky Sidebar & Mobile Modal */}
            <div className={`
                ${isOpen ? 'fixed inset-0 bg-black/50 z-50 lg:bg-transparent lg:static lg:inset-auto' : 'hidden lg:block'}
                lg:sticky lg:top-24 lg:h-fit
            `} onClick={() => setIsOpen(false)}>
                <div
                    className={`
                        bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6
                        ${isOpen ? 'fixed right-4 top-20 max-w-xs w-full shadow-2xl' : ''}
                        lg:static lg:max-w-none
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <List size={18} />
                            সূচিপত্র
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden text-slate-500 hover:text-slate-700"
                        >
                            ✕
                        </button>
                    </div>
                    <nav className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {headings.map((heading) => (
                            <button
                                key={heading.id}
                                onClick={() => scrollToHeading(heading.id)}
                                className={`
                                    block w-full text-left text-sm transition-colors py-1.5 px-2 rounded
                                    ${heading.level === 3 ? 'pl-6' : ''}
                                    ${activeId === heading.id
                                        ? 'text-red-600 dark:text-red-500 font-semibold bg-red-50 dark:bg-red-950/30'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }
                                `}
                            >
                                {heading.text}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
}
