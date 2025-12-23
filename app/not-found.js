import Link from 'next/link';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-full mb-6">
                <AlertTriangle size={48} className="text-red-600" />
            </div>
            <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-2">404</h1>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Page Not Found</h2>
            <p className="text-slate-500 max-w-md mb-8">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <Link
                href="/"
                className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition"
            >
                <Home size={20} />
                <span>Back to Home</span>
            </Link>
        </div>
    );
}
