"use client";
import Link from 'next/link';
import SubscriptionBox from './SubscriptionBox';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 py-16 mt-12 border-t border-slate-800 relative z-40">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">

        {/* 1. Publisher Identity & Trust Statement */}
        <div className="lg:col-span-4 space-y-6">
          <Link href="/" className="inline-block">
            <h3 className="text-white font-black text-2xl tracking-tighter">
              BAKALIA NEWS
            </h3>
          </Link>
          <p className="text-sm leading-relaxed text-slate-300">
            <strong>Independent Digital News Platform of Bangladesh.</strong><br />
            We are committed to delivering accurate, unbiased, and timely news from Bangladesh and across the globe. Our dedicated editorial team ensures the highest standards of journalism.
          </p>

          <address className="not-italic text-sm space-y-2 border-l-2 border-red-600 pl-4 py-1 my-4">
            <div className="text-white font-bold">Editorial Contact</div>
            <div>
              <a href="mailto:editor@bakalia.xyz" className="hover:text-white transition-colors flex items-center gap-2">
                ✉️ editor@bakalia.xyz
              </a>
            </div>
            {/* Optional: Add physical address if available for higher trust */}
            <div>Dhaka, Bangladesh</div>
          </address>

          <div className="flex gap-4">
            <SocialLink href="https://facebook.com" icon={<Facebook size={18} />} label="Facebook" />
            <SocialLink href="https://twitter.com" icon={<Twitter size={18} />} label="Twitter" />
            <SocialLink href="https://youtube.com" icon={<Youtube size={18} />} label="YouTube" />
            <SocialLink href="https://linkedin.com" icon={<Linkedin size={18} />} label="LinkedIn" />
          </div>
        </div>

        {/* 2. Navigation Links */}
        <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">

          {/* Categories */}
          <nav aria-label="News Categories">
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs border-b border-slate-700 pb-2">News Sections</h4>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/category/National">National</FooterLink>
              <FooterLink href="/category/Politics">Politics</FooterLink>
              <FooterLink href="/category/International">International</FooterLink>
              <FooterLink href="/category/Sports">Sports</FooterLink>
              <FooterLink href="/category/Business">Business</FooterLink>
              <FooterLink href="/category/Technology">Technology</FooterLink>
              <FooterLink href="/category/Entertainment">Entertainment</FooterLink>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company Links">
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs border-b border-slate-700 pb-2">Company</h4>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
              <FooterLink href="/advertising">Advertise</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
            </ul>
          </nav>

          {/* Legal / Policy */}
          <nav aria-label="Legal and Policy">
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs border-b border-slate-700 pb-2">Policies</h4>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/editorial-policy">Editorial Policy</FooterLink>
              <FooterLink href="/corrections-policy">Corrections Policy</FooterLink>
              <FooterLink href="/disclaimer">Disclaimer</FooterLink>
            </ul>
          </nav>
        </div>

        {/* 3. Subscription & Tools */}
        <div className="lg:col-span-3">
          <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs border-b border-slate-700 pb-2">Stay Connected</h4>
          <SubscriptionBox />

        </div>
      </div>

      {/* 4. Bottom Bar */}
      <div className="bg-slate-950/50 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">© {currentYear} Bakalia News. All rights reserved.</p>
            <p className="mt-1">Breaking news and in-depth updates from Bangladesh and around the world.</p>
          </div>
          <div className="flex gap-6">
            {/* Additional bottom links if needed */}
            <span>Designed & Developed by PortalX</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper Components for cleaner code
function FooterLink({ href, children }) {
  return (
    <li>
      <Link href={href} className="hover:text-red-500 transition-colors duration-200 block">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300"
    >
      {icon}
    </a>
  );
}