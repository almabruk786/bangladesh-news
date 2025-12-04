"use client";
import Link from 'next/link';
import { Newspaper, Menu, Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // হুক ইম্পোর্ট

export default function Header() {
  const { darkMode, toggleTheme, lang, toggleLang, t } = useTheme();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* লোগো */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-red-600 p-2 rounded-lg text-white group-hover:bg-red-700 transition">
            <Newspaper size={22} />
          </div>
          <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Bangladesh<span className="text-red-600">News</span>
          </span>
        </Link>

        {/* নেভিগেশন + বাটন */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-red-600 dark:hover:text-red-400">{t.home}</Link>
          <Link href="/about" className="hover:text-red-600 dark:hover:text-red-400">{t.about}</Link>
          
          {/* ভাষা বাটন */}
          <button onClick={toggleLang} className="flex items-center gap-1 border px-2 py-1 rounded hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
            <Globe size={16}/> {lang === 'bn' ? 'EN' : 'BN'}
          </button>

          {/* ডার্ক মোড বাটন */}
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            {darkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-slate-600"/>}
          </button>
        </nav>

        <button className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}