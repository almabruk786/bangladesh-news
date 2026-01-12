import { adminDb } from '../../lib/firebaseAdmin';
import RedirectClient from './RedirectClient';

// Server Component for Metadata & Data Fetching
export async function generateMetadata({ params }) {
    const { id } = await params;

    if (!adminDb) return { title: 'Newspaper Not Found' };

    const snap = await adminDb.collection("newspapers").doc(id).get();

    if (snap.exists) {
        const data = snap.data();
        return {
            title: `${data.name} - Read Online | Bakalia News`,
            description: `Read ${data.name} (${data.bn}) online. Official link and details for ${data.name} newspaper.`,
            openGraph: {
                title: `${data.name} - Read Online`,
                images: data.logo ? [data.logo] : [],
            }
        };
    }
    return { title: 'Newspaper Not Found' };
}

export default async function SitePage({ params }) {
    const { id } = await params;

    // Fetch Data on Server
    if (!adminDb) return <div className="p-20 text-center text-red-500">System Error: DB Connection Failed</div>;

    const snap = await adminDb.collection("newspapers").doc(id).get();

    if (!snap.exists) {
        return <div className="p-20 text-center font-bold text-slate-500"> Newspaper not found </div>;
    }

    const paper = { id: snap.id, ...snap.data() };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <RedirectClient paper={paper} />
            </div>
        </div>
    );
}
