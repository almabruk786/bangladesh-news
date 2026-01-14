import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request) {
    try {
        const userAgent = request.headers.get('user-agent') || '';
        const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit/i.test(userAgent);

        if (isBot) {
            return NextResponse.json({ success: true, ignored: true });
        }

        const data = await request.json();

        // Use Admin SDK to write to 'analytics' collection
        await adminDb.collection("analytics").add({
            ...data,
            userAgent, // Store actual UA
            timestamp: FieldValue.serverTimestamp()
        });

        // If visiting an article, increment its view count (Probabilistic Update to save Quota)
        // Only update 10% of the time, but increment by 10
        if (data.path && data.path.startsWith('/news/')) {
            if (Math.random() < 0.1) {
                const articleId = data.path.split('/').pop();
                if (articleId && articleId.length > 5) {
                    adminDb.collection("articles").doc(articleId).update({
                        views: FieldValue.increment(10)
                    }).catch(e => console.error("View increment failed", e));
                }
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Analytics API Error:", error);
        // Return 200 even on error to not block client
        return NextResponse.json({ success: false }, { status: 200 });
    }
}
