export const metadata = {
    title: 'Data Deletion Instructions | Bangladesh News',
    description: 'Instructions on how to request deletion of your data from Bangladesh News.',
};

export default function DataDeletion() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
            <h1>Data Deletion Instructions – Bangladesh News</h1>

            <p>
                Bangladesh News respects your privacy. According to Facebook Platform Policies, Google Login Policies, and global data protection standards, users have the right to request deletion of their personal data collected through our services.
            </p>

            <h2>What Data We Collect:</h2>
            <ul>
                <li>Name, email address, and profile picture (when using Google Login or Facebook Login)</li>
                <li>Basic analytics information such as browser data and device type</li>
                <li>Comments or messages submitted by users (if applicable)</li>
            </ul>

            <h2>How to Request Data Deletion:</h2>
            <p>If you want to delete your account information or personal data collected by Bangladesh News, please follow the steps below:</p>

            <ol>
                <li>Send us an email at: <strong>almabruk786@gmail.com</strong></li>
                <li>Use the subject line: <strong>“Data Deletion Request”</strong></li>
                <li>
                    Include:
                    <ul>
                        <li>Your full name</li>
                        <li>The email address used for login</li>
                        <li>Whether you logged in with Google or Facebook</li>
                    </ul>
                </li>
            </ol>

            <p>
                After your request is verified, all your personal data (name, email, profile picture, login-related information) will be permanently deleted from our databases within <strong>48–72 hours.</strong>
            </p>

            <h2>Platform-Specific Deletion Options:</h2>

            <h3>Facebook Data Deletion:</h3>
            <p>Users who logged in with Facebook can also delete their data directly from Facebook:</p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm mb-4">
                Facebook → Settings & Privacy → Settings → Apps and Websites → Bangladesh News → Remove
            </div>

            <h3>Google Data Deletion:</h3>
            <p>Users who logged in with Google may remove account access from:</p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm break-all mb-4">
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">https://myaccount.google.com/permissions</a>
            </div>

            <p>Once access is removed, you may still email us for complete data deletion from our system.</p>

            <h2>Additional Notes:</h2>
            <ul>
                <li>Deleting your data will also permanently remove your access to comment login or future use of your profile on Bangladesh News.</li>
                <li>We do not store any financial, password, or sensitive personal information.</li>
                <li>After deletion, your data cannot be recovered.</li>
            </ul>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                <p className="font-bold">If you have any questions, contact us at:</p>
                <p><a href="mailto:almabruk786@gmail.com" className="text-red-600 hover:underline">almabruk786@gmail.com</a></p>
            </div>
        </div>
    );
}
