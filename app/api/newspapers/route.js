import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebaseAdmin";

export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json({ success: false, error: "Admin SDK missing" }, { status: 500 });
        }

        const snapshot = await adminDb.collection("newspapers").get();
        const papers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort
        papers.sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : 999;
            const orderB = b.order !== undefined ? b.order : 999;
            if (orderA !== orderB) return orderA - orderB;
            return a.name.localeCompare(b.name);
        });

        return NextResponse.json({ success: true, papers });

    } catch (error) {
        // console.error("Newspapers API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
