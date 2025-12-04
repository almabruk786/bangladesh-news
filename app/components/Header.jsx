"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import { Menu, Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; 

export default function Header() {
  const { darkMode, toggleTheme, lang, toggleLang, t } = useTheme();

  // ব্রাউজারের এড্রেস বার কালার চেঞ্জ করার লজিক
  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    const color = darkMode ? "#0f172a" : "#ffffff"; // স্লেট-৯০০ অথবা সাদা
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", color);
    } else {
      const meta = document.createElement('meta');
      meta.name = "theme-color";
      meta.content = color;
      document.head.appendChild(meta);
    }
  }, [darkMode]);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm/50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* 🔥 প্রফেশনাল মডার্ন লোগো ডিজাইন 🔥 */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* আইকন */}
          <div className="relative w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30 transform group-hover:rotate-3 transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M11.25 4.53l-6.72 3.84a3 3 0 00-1.53 2.6v5.06a3 3 0 001.53 2.59l6.72 3.85a3 3 0 002.96 0l6.72-3.85a3 3 0 001.53-2.6V8.37a3 3 0 00-1.53-2.59L14.21 4.53a3 3 0 00-2.96 0zM12 17.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
            </svg>
            {/* ছোট ডট (স্টাইল) */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-slate-900 dark:bg-white rounded-full border-2 border-white dark:border-slate-900"></div>
          </div>
          
          {/* টেক্সট */}
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">The</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              BANGLADESH<span className="text-red-600">NEWS</span>
            </span>
          </div>
        </Link>

        {/* নেভিগেশন + বাটন */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600 dark:text-slate-300">
          <Link href="/" className="relative px-2 py-1 hover:text-red-600 dark:hover:text-red-400 transition-colors group">
            {t?.home || 'Home'}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/about" className="relative px-2 py-1 hover:text-red-600 dark:hover:text-red-400 transition-colors group">
            {t?.about || 'About'}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full"></span>
          </Link>
          
          {/* ডিভাইডার */}
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>

          {/* ভাষা বাটন */}
          <button onClick={toggleLang} className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 transition text-xs font-bold uppercase tracking-wider">
            <Globe size={14}/> {lang === 'bn' ? 'EN' : 'BN'}
          </button>

          {/* ডার্ক মোড বাটন */}
          <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition shadow-sm">
            {darkMode ? <Sun size={18} className="text-yellow-400"/> : <Moon size={18} className="text-slate-600"/>}
          </button>
        </nav>

        {/* মোবাইল মেনু */}
        <button className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}