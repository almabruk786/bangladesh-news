"use client";
import { createContext, useContext, useState, useEffect } from 'react';

// ডিফল্ট ভ্যালু যোগ করা হলো (যাতে প্রোভাইডার মিস হলেও ক্র্যাশ না করে)
const ThemeContext = createContext({
  darkMode: false,
  toggleTheme: () => {},
  lang: 'bn',
  toggleLang: () => {},
  t: {
    home: 'প্রচ্ছদ', about: 'আমাদের সম্পর্কে', contact: 'যোগাযোগ', latest: 'সর্বশেষ', 
    popular: 'জনপ্রিয়', breaking: 'ব্রেকিং', readMore: 'আরো পড়ুন', share: 'শেয়ার', reporter: 'প্রতিবেদক'
  }
});

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState('bn');

  useEffect(() => {
    // লোড হওয়ার সাথে সাথে চেক করবে
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const toggleLang = () => {
    setLang(prev => (prev === 'bn' ? 'en' : 'bn'));
  };

  const t = {
    bn: { home: 'প্রচ্ছদ', about: 'আমাদের সম্পর্কে', contact: 'যোগাযোগ', latest: 'সর্বশেষ', popular: 'জনপ্রিয়', breaking: 'ব্রেকিং', readMore: 'আরো পড়ুন', share: 'শেয়ার', reporter: 'প্রতিবেদক' },
    en: { home: 'Home', about: 'About Us', contact: 'Contact', latest: 'Latest', popular: 'Popular', breaking: 'Breaking', readMore: 'Read More', share: 'Share', reporter: 'Reporter' }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, lang, toggleLang, t: t[lang] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);