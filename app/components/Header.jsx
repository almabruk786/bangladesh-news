"use client";
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Moon, Sun, Search, X, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePathname, useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Header({ initialCategories = [] }) {
  const { darkMode, toggleTheme, lang } = useTheme();
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState("");
  const [currentIso, setCurrentIso] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef(null);

  // Use server-provided categories
  const categories = initialCategories;

  // Close search on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const q = e.target.value;
      if (q.trim()) {
        router.push(`/search?q=${encodeURIComponent(q)}`);
        setIsSearchOpen(false);
      }
    }
  };

  // Hide Header on Admin Dashboard
  if (pathname && pathname.startsWith("/admin")) return null;

  // Set Date Only (Run once on mount)
  useEffect(() => {
    const now = new Date();
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' };

    // Format: "Monday, 1 January, 2024" (No Time)
    const dateStr = now.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', dateOptions);

    setCurrentDate(dateStr);
    setCurrentIso(now.toISOString());
  }, [lang]);

  return (
    <>
      <header className={`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-sans sticky top-0 z-50 shadow-sm transition-colors duration-300`}>

        {/* 1. Main Header Area (Logo + Utilities) */}
        <div className="py-3 max-w-7xl mx-auto px-4 flex justify-between items-center relative">

          {/* LEFT: Logo & Menu */}
          <div className="flex items-center space-x-3 lg:space-x-4 flex-1 lg:flex-none">
            {/* Mobile Menu Trigger */}
            <div className="lg:hidden">
              <button type="button" aria-label="Open Main Menu" className="p-2 -ml-2 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <MenuIcon size={24} />
              </button>
            </div>

            {/* Logo - Fixed Size */}
            <Link href="/" className="flex items-center space-x-2 group">
              <img src="/favicon.png" alt="Bakalia News" className="transition-all duration-300 object-contain w-9 h-9 md:w-10 md:h-10" />
              <div className="flex flex-col justify-center">
                <span className="font-black text-red-600 tracking-tighter leading-none whitespace-nowrap text-xl md:text-2xl">
                  Bakalia
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px] tracking-widest uppercase leading-none -mt-0.5 block">
                  News
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER (LG): Date Only (Static) */}
          <div className="hidden lg:flex flex-col text-xs text-slate-600 dark:text-slate-400 font-bold text-center absolute left-1/2 transform -translate-x-1/2 min-w-[250px]">
            {/* dateTime helps search engines understand readability */}
            <time dateTime={currentIso}>{currentDate}</time>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center justify-end space-x-2 flex-1 lg:flex-none">
            <div className="relative" ref={searchRef}>
              <button type="button" onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label="Toggle Search" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition cursor-pointer">
                <Search size={20} />
              </button>

              {/* Search Bar Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full right-0 w-64 md:w-80 bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 rounded mt-2">
                  <input
                    type="text"
                    autoFocus
                    aria-label="Search Query"
                    placeholder="Search news..."
                    className="w-full px-3 py-2 border dark:border-slate-700 rounded focus:outline-none focus:border-red-500 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    onKeyDown={handleSearch}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-700 pl-3">
              <button type="button" onClick={toggleTheme} aria-label="Toggle Theme" className="p-1 hover:text-red-500 transition text-slate-500 dark:text-slate-400 cursor-pointer">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Navigation Bar (Multi-line) */}
        <div className="border-t border-slate-100 dark:border-slate-800 block">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <nav
              aria-label="Main Navigation"
              className="flex items-center overflow-x-auto gap-x-3 px-1 pb-2 custom-scrollbar md:flex-wrap md:justify-center md:overflow-visible md:pb-0"
            >
              <Link
                href="/"
                aria-label="Home"
                className="px-2 py-1 border-b-2 border-transparent hover:border-red-600 text-xs md:text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100 hover:text-red-600 transition shrink-0 whitespace-nowrap"
              >
                {lang === 'bn' ? 'সর্বশেষ' : 'Home'}
              </Link>

              {/* E-PAPER BUTTON */}
              <Link
                href="/newspapers"
                aria-label="NewsPapers"
                className="py-1 px-3 rounded text-xs md:text-sm font-bold uppercase text-white transition shrink-0 flex items-center space-x-1 bg-red-600 shadow-md shadow-red-500/30 hover:bg-red-700 whitespace-nowrap"
              >
                <span>NewsPapers</span> <span>📰</span>
              </Link>

              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.link}
                  aria-current={pathname === cat.link ? 'page' : undefined}
                  className={`py-1 px-2 border-b-2 border-transparent hover:border-red-600 text-xs md:text-sm font-bold uppercase tracking-tight hover:text-red-600 transition shrink-0 whitespace-nowrap ${pathname === cat.link ? 'border-red-600 text-red-600' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {lang === 'bn' ? cat.bn : cat.name} {cat.hot && <span className="text-[10px]">🔥</span>}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {
        isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="bg-white dark:bg-slate-900 w-[280px] h-full shadow-2xl flex flex-col transform transition-transform duration-300" onClick={e => e.stopPropagation()}>
              <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-black text-xl text-slate-900 dark:text-white">MENU</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"><X size={24} /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-4">
                <nav className="flex flex-col space-y-1">
                  {/* Mobile Date & Search */}
                  <div className="mb-4 space-y-3">
                    <div className="text-xs font-bold text-slate-500 text-center bg-slate-50 dark:bg-slate-800 p-2 rounded">
                      {currentDate}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search news..."
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                      />
                      <Search size={16} className="absolute right-3 top-2.5 text-slate-400" />
                    </div>
                  </div>

                  <Link href="/" className="block px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                  {categories.map((cat) => (
                    <Link key={cat.name} href={cat.link} className="block px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>
                      {lang === 'bn' ? cat.bn : cat.name}
                    </Link>
                  ))}
                </nav>
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-3">
                  <Link href="/newspapers" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-2 bg-red-600 text-white font-bold rounded text-center block shadow-lg shadow-red-600/20">
                    NewsPapers 📰
                  </Link>

                  <button onClick={toggleTheme} className="flex items-center space-x-2 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition p-2">
                    {darkMode ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}