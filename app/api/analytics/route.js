import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request) {
    try {
        const data = await request.json();

        // Use Admin SDK to write to 'analytics' collection
        // This is safe because it's a server-side operation
        await adminDb.collection("analytics").add({
            ...data,
            timestamp: FieldValue.serverTimestamp()
        });

        // If visiting an article, increment its view count
        if (data.path && data.path.startsWith('/news/')) {
            const articleId = data.path.split('/').pop();
            // Validate ID format (avoid simple crashes)
            if (articleId && articleId.length > 5) {
                // Fire and forget increment using Admin SDK
                adminDb.collection("articles").doc(articleId).update({
                    views: FieldValue.increment(1)
                }).catch(e => console.error("View increment failed", e));
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Analytics API Error:", error);
        // Return 200 even on error to not block client
        return NextResponse.json({ success: false }, { status: 200 });
    }
}
