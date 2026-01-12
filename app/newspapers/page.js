import NewspapersList from '../components/NewspapersList';
import { adminDb } from '../lib/firebaseAdmin'; // Use Admin SDK

export const metadata = {
    title: "All Bangla Newspapers List | Online & E-Paper | বাংলাদেশের সব সংবাদপত্র",
    description: "Read all top Bangla newspapers (Online & E-Paper) in one place. Prothom Alo, Bangladesh Pratidin, Jugantor, Kaler Kantho, The Daily Star, and more. All Bangladesh newspaper links.",
    alternates: {
        canonical: 'https://bakalia.xyz/newspapers',
    },
    openGraph: {
        title: "All Bangla Newspapers List | Online & E-Paper",
        description: "Access all popular Bangla newspapers and e-papers in one click. Prothom Alo, Kaler Kantho, Jugantor, Bhorer Kagoj, and other top dailies.",
        url: 'https://bakalia.xyz/newspapers',
        type: 'website',
    }
};

async function getNewspapers() {
    try {
        // Use Admin SDK to bypass client rules
        // adminDb is already initialized in lib/firebaseAdmin.js
        if (!adminDb) return [];

        const snapshot = await adminDb.collection("newspapers").get();
        const papers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort on Server
        papers.sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : 999;
            const orderB = b.order !== undefined ? b.order : 999;
            if (orderA !== orderB) return orderA - orderB;
            return a.name.localeCompare(b.name);
        });

        return papers;
    } catch (error) {
        console.error("Error fetching newspapers on server:", error);
        return [];
    }
}

export const revalidate = 60; // Cache for 1 minute

export default async function NewspapersPage() {
    // Fetch data safely
    const rawPapers = await getNewspapers();
    // Serialize to ensure plain JSON (removes Timestamps, undefined, etc) to prevent hydration mismatch
    // Also Admin SDK timestamps need .toDate() but JSON.stringify handles basic ISO conversion if toJSON exists, 
    // but better to be explicit or use the lazy parse/stringify hack which is robust enough for simple data.
    const papers = JSON.parse(JSON.stringify(rawPapers));

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 font-sans">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                {/* Page Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-8 bg-red-600 rounded-full"></div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">All Bangla Newspapers</h1>
                </div>

                <div className="mb-8">
                    {/* Manual Ad Removed */}
                </div>

                {/* Grid Content */}
                <NewspapersList initialPapers={papers} />
            </div>
        </div>
    );
}
