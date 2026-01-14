import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// GET: Fetch published comments for an article
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const articleId = searchParams.get("articleId");

        if (!articleId) {
            return NextResponse.json({ success: false, error: "Article ID missing" }, { status: 400 });
        }

        const commentsRef = adminDb.collection("comments");
        const q = commentsRef
            .where("articleId", "==", articleId)
            .where("status", "==", "published") // Only published
            .orderBy("createdAt", "desc")
            .limit(20); // Limit to 20 to save Quota

        const snapshot = await q.get();

        const comments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Serialize timestamps
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
            };
        });

        return NextResponse.json({ success: true, comments });

    } catch (error) {
        console.error("Fetch Comments API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { text, user, articleId } = await request.json();

        if (!text || !user || !articleId) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Use Admin SDK to write (Bypasses Firestore Rules)
        await adminDb.collection("comments").add({
            articleId,
            text,
            uid: user.uid,
            displayName: user.displayName || "Anonymous",
            photoURL: user.photoURL || null,
            createdAt: FieldValue.serverTimestamp(),
            status: "pending" // Manual Moderation
        });

        return NextResponse.json({ success: true, message: "Comment submitted for approval." });

    } catch (error) {
        console.error("Comment API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
