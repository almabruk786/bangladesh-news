import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range") || "7days";

        const now = new Date();
        const labels = [];
        const views = [];

        // Simple aggregation logic for 7 days
        // In a real high-scale app, we would use pre-aggregated stats.
        // For now, we query analytics collection.

        let daysToFetch = range === '30days' ? 30 : 7;

        // Prepare buckets
        const bucketMap = {};
        for (let i = daysToFetch - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            labels.push(key);
            bucketMap[key] = 0;
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysToFetch);

        const snap = await adminDb.collection("analytics")
            .where("timestamp", ">=", startDate)
            .select("timestamp") // Optimize: only fetch timestamp
            .get();

        snap.docs.forEach(doc => {
            const date = doc.data().timestamp.toDate();
            const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (bucketMap[key] !== undefined) {
                bucketMap[key]++;
            }
        });

        labels.forEach(l => {
            views.push(bucketMap[l]);
        });

        return NextResponse.json({ success: true, labels, views });

    } catch (error) {
        console.error("Chart API Error", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
