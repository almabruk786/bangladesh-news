export const metadata = {
    title: 'Corrections Policy | Bakalia News',
    description: 'Our commitment to accuracy and transparency.',
};

export default function CorrectionsPolicy() {
    return (
        <main className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-black mb-8 border-b pb-4 border-slate-200">Corrections Policy</h1>

            <div className="prose prose-slate max-w-none text-slate-700">
                <p className="lead">
                    At <strong>Bakalia News</strong>, we strive for the highest standards of accuracy and fairness. However, we acknowledge that errors may occasionally occur. When they do, our commitment is to correct them promptly and transparently.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-2">Reporting Errors</h3>
                <p>
                    We encourage our readers to report any errors they find in our content. You can submit potential corrections by emailing us at <a href="mailto:editor@bakalia.xyz" className="text-red-600 font-bold">editor@bakalia.xyz</a>. Please include the link to the article and a description of the error.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-2">Making Corrections</h3>
                <p>
                    When an error is confirmed, we will update the article immediately.
                </p>
                <ul className="list-disc pl-5 my-4">
                    <li><strong>Factual Errors:</strong> We will correct the text and add a note at the bottom of the story indicating the nature of the correction and the date/time it was made.</li>
                    <li><strong>Clarifications:</strong> If a story is factually correct but language is vague or misleading, we may rewrite it for clarity and append a clarification note.</li>
                    <li><strong>Editor's Notes:</strong> In significant cases, we may add an Editor's Note at the top of the article to explain serious issues or lapses in standards.</li>
                </ul>

                <h3 className="text-xl font-bold mt-6 mb-2">Social Media</h3>
                <p>
                    If an article containing a significant error has been shared on our social media platforms, we will make reasonable efforts to post the correction or delete the incorrect post if necessary.
                </p>

                <p className="mt-8 text-sm text-slate-500 border-t pt-4">
                    Last Updated: {new Date().getFullYear()}
                </p>
            </div>
        </main>
    );
}
