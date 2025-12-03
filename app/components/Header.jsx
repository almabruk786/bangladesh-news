import Link from 'next/link';
import { Newspaper, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* ১. লোগো সেকশন */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-red-600 p-2 rounded-lg text-white group-hover:bg-red-700 transition shadow-sm">
            <Newspaper size={22} />
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">
            Bangladesh<span className="text-red-600">News</span>
          </span>
        </Link>

        {/* ২. নেভিগেশন মেনু (এডমিন বাটন সরিয়ে ফেলা হয়েছে) */}
        <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
          <Link href="/" className="hover:text-red-600 transition-colors">প্রচ্ছদ</Link>
          <Link href="/about" className="hover:text-red-600 transition-colors">আমাদের সম্পর্কে</Link>
          <Link href="/contact" className="hover:text-red-600 transition-colors">যোগাযোগ</Link>
        </nav>

        {/* ৩. মোবাইল মেনু আইকন (আপাতত শুধু আইকন, ফাংশনালিটি পরে) */}
        <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}