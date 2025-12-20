"use client";
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function DateDisplay() {
    const { lang } = useTheme();
    const [dateStr, setDateStr] = useState("");

    useEffect(() => {
        const updateDate = () => {
            const now = new Date();
            const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' };
            setDateStr(now.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', options));
        };

        updateDate();
        // Update every minute just in case, though date rarely changes
        const timer = setInterval(updateDate, 60000);
        return () => clearInterval(timer);
    }, [lang]);

    if (!dateStr) return null;

    return (
        <div className="font-bold text-sm text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">
            {dateStr}
        </div>
    );
}
