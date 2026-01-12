import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";

export async function GET() {
    try {
        const batch = adminDb.batch();

        // Fix E-Dainik Azadi
        const azadiRef = adminDb.collection("newspapers").doc("IzFu6zZM0YZPoKLDOlr6");
        batch.update(azadiRef, { logo: "/newspapers/dainikazadi.png" });

        // Fix E-Prothom Alo
        const paRef = adminDb.collection("newspapers").doc("TK7dsjLGRCW7zZxBWOEg");
        batch.update(paRef, { logo: "/newspapers/prothomalo_com.png" });

        await batch.commit();

        return NextResponse.json({ success: true, message: "Fixed Azadi and E-Prothom Alo" });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
