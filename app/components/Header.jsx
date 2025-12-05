"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Moon, Sun, Globe, Calendar, Clock, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

import { usePathname } from 'next/navigation';

export default function Header() {
  const { darkMode, toggleTheme, lang, toggleLang } = useTheme();
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide Header on Admin Dashboard
  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    // Clock Logic
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      setCurrentTime(now.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: "National", bn: "জাতীয়", link: "/category/National" },
    { name: "Politics", bn: "রাজনীতি", link: "/category/Politics" },
    { name: "Global", bn: "আন্তর্জাতিক", link: "/category/International" },
    { name: "Sports", bn: "খেলাধুলা", link: "/category/Sports" },
    { name: "Tech", bn: "প্রযুক্তি", link: "/category/Technology" },
    { name: "Entertainment", bn: "বিনোদন", link: "/category/Entertainment" },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>

      {/* Top Bar (Date & Time) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 border-b border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Calendar size={12} className="text-red-500" /> {currentDate}</span>
            <span className="flex items-center gap-1"><Clock size={12} className="text-red-500" /> {currentTime}</span>
          </div>
          <div className="flex gap-4">
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 relative z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className={`relative bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30 transform group-hover:rotate-3 transition duration-300 ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <span className="text-white font-black text-lg">B</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                BANGLA<span className="text-red-600">DESH</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink href="/" active>{lang === 'bn' ? 'হোম' : 'Home'}</NavLink>
            {categories.map(cat => (
              <NavLink key={cat.name} href={cat.link}>{lang === 'bn' ? cat.bn : cat.name}</NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={toggleLang} className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-red-500 transition text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Globe size={12} /> {lang === 'bn' ? 'EN' : 'BN'}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-600" />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-slate-900 dark:text-white">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xl p-4 flex flex-col gap-2 lg:hidden">
          <Link href="/" className="p-3 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">Home</Link>
          {categories.map(cat => (
            <Link key={cat.name} href={cat.link} className="p-3 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children, active }) {
  return (
    <Link href={href} className={`px-4 py-2 text-sm font-bold transition-colors uppercase tracking-tight
      ${active ? 'text-red-600' : 'text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400'}
    `}>
      {children}
    </Link>
  );
}