import NewspapersList from '../components/NewspapersList';

export const metadata = {
    title: "List of All Bangladesh Newspapers - বাংলাদেশের সংবাদপত্রসমূহ",
    description: "e prothom alo, e kaler kantho, e jugantor, e samakal, e ittefaq, e bangladesh protidin is the most popular epaper. Manab Zamin, Janakantha, Bhorer Kagoj, Manob Kantha, Inqilab, Sangram, Bhorer Pata, Alokito Bangladesh, Ajker Patrika.",
    alternates: {
        canonical: 'https://bakalia.xyz/newspapers',
    },
    openGraph: {
        title: "List of All Bangladesh Newspapers - বাংলাদেশের সংবাদপত্রসমূহ",
        description: "Read all Bangla newspapers online. Prothom Alo, Kaler Kantho, Jugantor, and more.",
        url: 'https://bakalia.xyz/newspapers',
        type: 'website',
    }
};

export default function NewspapersPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 font-sans">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                {/* Page Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-8 bg-red-600 rounded-full"></div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">All Bangla Newspapers</h1>
                </div>

                {/* Grid Content */}
                <NewspapersList />
            </div>
        </div>
    );
}
