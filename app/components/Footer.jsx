import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm">
          &copy; {new Date().getFullYear()} Bangladesh News. All rights reserved.
        </div>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/about" className="hover:text-white transition">About Us</Link>
          <Link href="/contact" className="hover:text-white transition">Contact</Link>
          <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}