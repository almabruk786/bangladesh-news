import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import RedirectClient from './RedirectClient';

// Server Component for Metadata & Data Fetching
export async function generateMetadata({ params }) {
    const { id } = await params;
    const docRef = doc(db, "newspapers", id);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
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
    const docRef = doc(db, "newspapers", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
        return <div className="p-20 text-center font-bold text-slate-500"> Newspaper not found </div>;
    }

    const paper = { id: snap.id, ...snap.data() };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <RedirectClient paper={paper} />

                {/* Google AdSense Display Unit */}
                <div className="mt-8 mx-auto w-full flex justify-center">
                    <ins className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client="ca-pub-1617498457221360"
                        data-ad-slot="YOUR_AD_SLOT_ID_HERE" // Ideally, user should provide this or we use auto ads
                        data-ad-format="auto"
                        data-full-width-responsive="true"></ins>
                    <script>
                        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
                    </script>
                </div>
            </div>
        </div>
    );
}
