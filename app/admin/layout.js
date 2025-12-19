"use client";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
    useEffect(() => {
        // 1. Force Light Mode on Mount
        document.documentElement.classList.remove("dark");

        // 2. Cleanup on Unmount (Restore User Preference)
        return () => {
            const localTheme = localStorage.getItem('theme');
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (localTheme === 'dark' || (!localTheme && systemDark)) {
                document.documentElement.classList.add("dark");
            }
        };
    }, []);

    // Force a light background wrapper just in case
    return (
        <div className="bg-slate-50 min-h-screen text-slate-900 light">
            {children}
        </div>
    );
}
