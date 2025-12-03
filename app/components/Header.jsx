import Link from 'next/link';
import { Newspaper, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* লোগো সেকশন - এখানে নাম আপডেট করা হয়েছে */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-red-600 p-2 rounded-lg text-white group-hover:bg-red-700 transition">
            <Newspaper size={20} />
          </div>
          <span className="text-2xl font-bold text-slate-800">
            Bangladesh<span className="text-red-600">News</span>
          </span>
        </Link>

        {/* নেভিগেশন মেনু (বড় স্ক্রিনে) */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-red-600">জাতীয়</Link>
          <Link href="/" className="hover:text-red-600">খেলাধুলা</Link>
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-bold border border-blue-100 px-3 py-1 rounded-full bg-blue-50">
            এডমিন প্যানেল
          </Link>
        </nav>

        {/* মোবাইল মেনু বাটন */}
        <button className="md:hidden p-2 text-slate-600">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}