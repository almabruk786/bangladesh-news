export const metadata = {
    title: 'Careers | Bakalia News',
};

export default function Careers() {
    return (
        <main className="container mx-auto px-4 py-12 max-w-4xl text-center">
            <h1 className="text-3xl font-black mb-6">Join Our Team</h1>
            <p className="text-lg text-slate-600 mb-8">
                Help us shape the future of digital journalism in Bangladesh.
            </p>
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
                <p className="italic text-slate-500">There are currently no open positions.</p>
                <p className="mt-4 text-sm">
                    You can send your CV to <a href="mailto:jobs@bakalia.xyz" className="text-blue-600 hover:underline">jobs@bakalia.xyz</a> for future consideration.
                </p>
            </div>
        </main>
    );
}
