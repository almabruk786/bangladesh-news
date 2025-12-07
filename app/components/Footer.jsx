"use client";
import Link from 'next/link';
import SubscriptionBox from './SubscriptionBox';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-12 border-t border-slate-800 relative z-40">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        <div className="col-span-1 lg:col-span-1">
          <h3 className="text-white font-bold text-lg mb-4 tracking-tight">BANGLADESH NEWS</h3>
          <p className="text-xs leading-relaxed opacity-80">
            Your trusted source for the latest breaking news, sports, and technical updates from Bangladesh and around the world.
          </p>
        </div>

        {/* Links Section */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Categories</h4>
            <ul className="space-y-2">
              <li><Link href="/category/National" className="hover:text-white transition-colors">National</Link></li>
              <li><Link href="/category/Politics" className="hover:text-white transition-colors">Politics</Link></li>
              <li><Link href="/category/Sports" className="hover:text-white transition-colors">Sports</Link></li>
              <li><Link href="/category/Technology" className="hover:text-white transition-colors">Technology</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/editorial-policy" className="hover:text-white transition-colors">Editorial Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        {/* Subscription Column */}
        <div className="col-span-1 md:col-span-1">
          <SubscriptionBox />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-60">
        <div>
          &copy; {new Date().getFullYear()} Bangladesh News. All rights reserved.
        </div>
        <div>
          Designed & Developed by PortalX
        </div>
      </div>
    </footer>
  );
}