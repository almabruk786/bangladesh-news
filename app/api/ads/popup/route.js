import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";

export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json({ success: false, error: "Admin SDK missing" }, { status: 500 });
        }

        const docSnap = await adminDb.collection("ads").doc("popup").get();

        if (docSnap.exists) {
            const data = docSnap.data();
            if (data.isActive) {
                return NextResponse.json({ success: true, ad: data });
            }
        }

        return NextResponse.json({ success: true, ad: null });

    } catch (error) {
        // console.error("Ad Popup API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
