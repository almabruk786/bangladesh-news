import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";

export async function GET() {
    try {
        // Fetch last 10 analytics logs
        const snap = await adminDb.collection("analytics")
            .orderBy("timestamp", "desc")
            .limit(10)
            .get();

        const logs = snap.docs.map(doc => {
            const data = doc.data();
            const date = data.timestamp?.toDate() || new Date();

            // Map raw data to feed format
            let action = "visited";
            if (data.source === 'Social') action = "arrived from Social";
            if (data.source === 'Search') action = "found via Search";

            return {
                id: doc.id,
                user: data.ip ? `Visitor (${data.ip.slice(-4)})` : "Anonymous",
                action: action,
                page: data.path || "Homepage",
                timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                rawTime: date // for sorting if needed
            };
        });

        return NextResponse.json({ success: true, logs });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
