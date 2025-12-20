"use client";
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Menu, Moon, Sun, Search, User, X, Facebook, Twitter, Youtube, Menu as MenuIcon, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePathname, useRouter } from 'next/navigation';


export default function Header() {
  const { darkMode, toggleTheme, lang, toggleLang } = useTheme();
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState("");
  const [currentIso, setCurrentIso] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const router = useRouter();
  const searchRef = useRef(null);

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

  useEffect(() => {
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

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
  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' };
      const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' };

      const dateStr = now.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', dateOptions);
      const timeStr = now.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', timeOptions);

      setCurrentDate(`${dateStr} | ${timeStr}`);
      setCurrentIso(now.toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 120);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: "National", bn: "জাতীয়", link: "/category/National" },
    { name: "Bangladesh", bn: "বাংলাদেশ", link: "/category/Bangladesh" },
    { name: "Politics", bn: "রাজনীতি", link: "/category/Politics", hot: true },
    { name: "International", bn: "আন্তর্জাতিক", link: "/category/International" },
    { name: "Sports", bn: "খেলা", link: "/category/Sports", hot: true },
    { name: "Health", bn: "স্বাস্থ্য", link: "/category/Health" },
    { name: "Technology", bn: "প্রযুক্তি", link: "/category/Technology" },
    { name: "Education", bn: "শিক্ষা", link: "/category/Education" },
    { name: "Opinion", bn: "মতামত", link: "/category/Opinion" },
    { name: "Business", bn: "বাণিজ্য", link: "/category/Business" },
    { name: "Entertainment", bn: "বিনোদন", link: "/category/Entertainment" },
    { name: "Lifestyle", bn: "জীবনযাপন", link: "/category/Lifestyle" },
  ];

  return (
    <>
      <header className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 font-sans sticky top-0 z-50 transition-all duration-300 shadow-sm`}>

        {/* 1. Main Header Area (Logo + Utilities) */}
        <div className={`transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3'} max-w-7xl mx-auto px-4 flex justify-between items-center relative`}>

          {/* LEFT: Logo & Menu */}
          <div className="flex items-center gap-3 lg:gap-4 flex-1 lg:flex-none">
            {/* Mobile Menu Trigger */}
            <div className="lg:hidden">
              <button className="p-2 -ml-2 text-slate-800 dark:text-white hover:bg-slate-100 rounded-full transition" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <MenuIcon size={24} />
              </button>
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/favicon.png" alt="Bakalia News" className={`transition-all duration-300 object-contain ${isScrolled ? 'w-8 h-8' : 'w-9 h-9 md:w-10 md:h-10'}`} />
              <div className="flex flex-col justify-center">
                <span className={`font-black text-red-600 tracking-tighter leading-none transition-all duration-300 whitespace-nowrap ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                  Bakalia
                </span>
                <span className={`font-bold text-slate-700 dark:text-slate-300 text-[10px] tracking-widest uppercase leading-none -mt-0.5 ${isScrolled ? 'hidden' : 'block'}`}>
                  News
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER (LG): Date */}
          <div className="hidden lg:flex flex-col text-xs text-slate-600 font-bold text-center absolute left-1/2 transform -translate-x-1/2 min-w-[250px]">
            <time dateTime={currentIso}>{currentDate}</time>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center justify-end gap-1 flex-1 lg:flex-none">
            <div className="relative" ref={searchRef}>
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label="Toggle Search" className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition">
                <Search size={20} />
              </button>

              {/* Search Bar Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full right-0 w-64 md:w-80 bg-white shadow-xl border border-slate-100 p-2 z-50 rounded mt-2 animate-in fade-in slide-in-from-top-2">
                  <input
                    type="text"
                    autoFocus
                    aria-label="Search Query"
                    placeholder="Search news..."
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-red-500 text-sm"
                    onKeyDown={handleSearch}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <button onClick={toggleTheme} aria-label="Toggle Theme" className="p-1 hover:text-red-500 transition text-slate-500">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {/* Install App button removed as per user request (redundant with sidebar) */}
            </div>
          </div>
        </div>

        {/* 2. Navigation Bar (Centered & Scrollable) */}
        <div className="border-t border-slate-100 dark:border-slate-800 block">
          <div className="max-w-7xl mx-auto px-4">
            <nav aria-label="Main Navigation" className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto md:overflow-hidden no-scrollbar md:gap-5 py-2">
              <Link
                href="/"
                aria-label="Home"
                className="px-1 md:px-2 border-b-2 border-transparent hover:border-red-600 text-xs md:text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100 hover:text-red-600 transition shrink-0"
              >
                {lang === 'bn' ? 'সর্বশেষ' : 'Home'}
              </Link>

              {/* GLOWING E-PAPER BUTTON (DAZZLING) */}
              <Link
                href="/newspapers"
                aria-label="NewsPapers"
                className="py-1 px-3 rounded text-xs md:text-sm font-black uppercase tracking-tight text-white transition shrink-0 flex items-center gap-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-[length:200%_auto] hover:bg-right duration-500 shadow-md shadow-red-500/30"
              >
                NewsPapers 📰
              </Link>

              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.link}
                  aria-current={pathname === cat.link ? 'page' : undefined}
                  className={`py-2 px-1 border-b-2 border-transparent hover:border-red-600 text-xs md:text-sm font-bold uppercase tracking-tight hover:text-red-600 transition shrink-0 whitespace-nowrap ${pathname === cat.link ? 'border-red-600 text-red-600' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {lang === 'bn' ? cat.bn : cat.name} {cat.hot && <span className="text-[10px]">🔥</span>}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Drawer - Moved outside Header to avoid stacking context issues due to backdrop-blur */}
      {
        isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="bg-white dark:bg-slate-900 w-[280px] h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
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
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                  <Link href="/newspapers" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-2 bg-red-600 text-white font-bold rounded text-center block shadow-lg shadow-red-600/20">
                    NewsPapers 📰
                  </Link>
                  {deferredPrompt && (
                    <button onClick={handleInstallClick} className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded text-center flex items-center justify-center gap-2">
                      <Download size={18} /> Install App
                    </button>
                  )}
                  <button onClick={toggleTheme} className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition p-2">
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