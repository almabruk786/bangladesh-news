export const metadata = {
    title: 'Advertising | Bakalia News',
    description: 'Advertise with Bakalia News. Reach a wider audience.',
};

export default function Advertising() {
    return (
        <main className="container mx-auto px-4 py-12 max-w-4xl text-center">
            <h1 className="text-3xl font-black mb-6">Advertise with Bakalia News</h1>
            <p className="text-lg text-slate-600 mb-8">
                Reach millions of readers in Bangladesh and beyond.
            </p>
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
                <p className="mb-4">For ad placements, sponsored content, and partnership opportunities, please contact our sales team:</p>
                <a href="mailto:ads@bakalia.xyz" className="text-2xl font-bold text-red-600 hover:underline">ads@bakalia.xyz</a>
            </div>
        </main>
    );
}
