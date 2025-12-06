"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Moon, Sun, Search, User, X, Facebook, Twitter, Youtube, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePathname } from 'next/navigation';
import NewspaperModal from './NewspaperModal';

export default function Header() {
  const { darkMode, toggleTheme, lang, toggleLang } = useTheme();
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEpaperOpen, setIsEpaperOpen] = useState(false);

  // Hide Header on Admin Dashboard
  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 120);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: "Bangladesh", bn: "বাংলাদেশ", link: "/category/Bangladesh" },
    { name: "International", bn: "আন্তর্জাতিক", link: "/category/International" },
    { name: "Politics", bn: "রাজনীতি", link: "/category/Politics" },
    { name: "Sports", bn: "খেলা", link: "/category/Sports" },
    { name: "Opinion", bn: "মতামত", link: "/category/Opinion" },
    { name: "Business", bn: "বাণিজ্য", link: "/category/Business" },
    { name: "Entertainment", bn: "বিনোদন", link: "/category/Entertainment" },
    { name: "Lifestyle", bn: "জীবনযাপন", link: "/category/Lifestyle" },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-sans">

      {/* 1. Main Header Area (Logo + Utilities) */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-5 flex justify-between items-center relative">

        {/* Left: Hamburger (Mobile) + Date */}
        <div className="flex items-center gap-4 flex-1">
          <button className="lg:hidden p-1 text-slate-800 dark:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <MenuIcon size={26} />
          </button>
          <div className="hidden lg:flex flex-col text-xs text-slate-500 font-medium">
            <span>{currentDate}</span>
            <span className="text-slate-400">Dhaka, Bangladesh</span>
          </div>
        </div>

        {/* Center: LOGO */}
        <Link href="/" className="flex-none flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-slate-900 dark:text-white leading-none">
            BANGLA<span className="text-red-600">DESH</span>
          </h1>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-3 flex-1 lg:gap-5">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition">
            <Search size={20} />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <button onClick={toggleTheme} className="p-1.5 hover:text-red-500 transition text-slate-500">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <button onClick={() => setIsEpaperOpen(true)} className="px-3 py-1 border border-red-600 text-red-600 font-bold text-xs rounded hover:bg-red-600 hover:text-white transition uppercase">
            E-Paper
          </button>
        </div>

        {/* Search Bar Dropdown */}
        {isSearchOpen && (
          <div className="absolute top-full right-4 w-64 md:w-80 bg-white shadow-xl border border-slate-100 p-2 z-50 rounded mt-2">
            <input type="text" autoFocus placeholder="Search news..." className="w-full px-3 py-2 border rounded focus:outline-none focus:border-red-500 text-sm" />
          </div>
        )}
      </div>

      {/* 2. Navigation Bar (Centered & Sticky) */}
      <div className={`border-t border-slate-100 dark:border-slate-800 ${isScrolled ? 'fixed top-0 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md z-50 transition-all duration-300' : 'relative z-40'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-center gap-1 overflow-x-auto no-scrollbar md:gap-6">
            <Link href="/" className="py-3 px-1 border-b-2 border-transparent hover:border-red-600 text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100 hover:text-red-600 transition shrink-0">
              {lang === 'bn' ? 'প্রচ্ছদ' : 'Home'}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.link}
                className={`py-3 px-1 border-b-2 border-transparent hover:border-red-600 text-sm font-bold uppercase tracking-tight hover:text-red-600 transition shrink-0 whitespace-nowrap ${pathname === cat.link ? 'border-red-600 text-red-600' : 'text-slate-700 dark:text-slate-300'}`}
              >
                {lang === 'bn' ? cat.bn : cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white dark:bg-slate-900 w-[280px] h-full shadow-2xl flex flex-col transform transition-transform" onClick={e => e.stopPropagation()}>
            <div className="p-4 flex justify-between items-center border-b border-slate-100">
              <h2 className="font-black text-xl">MENU</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-slate-100 rounded"><X size={24} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              <nav className="flex flex-col space-y-1">
                <Link href="/" className="block px-4 py-3 rounded-lg bg-red-50 text-red-700 font-bold">Home</Link>
                {categories.map((cat) => (
                  <Link key={cat.name} href={cat.link} className="block px-4 py-3 rounded-lg hover:bg-slate-50 font-semibold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? cat.bn : cat.name}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                <button onClick={() => { setIsEpaperOpen(true); setIsMobileMenuOpen(false); }} className="w-full py-2 bg-red-600 text-white font-bold rounded">
                  E-Paper
                </button>
                <button onClick={toggleTheme} className="flex items-center gap-2 font-bold text-slate-600">
                  {darkMode ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Newspaper Modal */}
      <NewspaperModal isOpen={isEpaperOpen} onClose={() => setIsEpaperOpen(false)} />
    </header>
  );
}