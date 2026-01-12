import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";

// GET: Fetch All Comments
export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json({ success: false, error: "Firebase Admin not initialized" }, { status: 500 });
        }

        const snapshot = await adminDb.collection("comments").orderBy("createdAt", "desc").get();

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
        console.error("Fetch Comments Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Delete a Comment
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, error: "Comment ID missing" }, { status: 400 });
        }

        await adminDb.collection("comments").doc(id).delete();

        return NextResponse.json({ success: true, message: "Comment deleted" });

    } catch (error) {
        console.error("Delete Comment Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH: Approve (Update Status)
export async function PATCH(request) {
    try {
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ success: false, error: "Missing ID or Status" }, { status: 400 });
        }

        await adminDb.collection("comments").doc(id).update({ status });

        return NextResponse.json({ success: true, message: "Comment updated" });

    } catch (error) {
        console.error("Update Comment Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
