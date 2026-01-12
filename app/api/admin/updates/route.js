import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!adminDb) {
            return NextResponse.json({ success: false, error: "Admin SDK missing" }, { status: 500 });
        }

        // Helper function to retry Firestore queries
        const retryQuery = async (queryFn, maxRetries = 2) => {
            for (let i = 0; i <= maxRetries; i++) {
                try {
                    return await queryFn();
                } catch (error) {
                    if (i === maxRetries || !error.message?.includes('UNAVAILABLE')) {
                        throw error;
                    }
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 500));
                }
            }
        };

        // 1. Analytics (Active Users in last 5 mins) - with retry
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);

        const logs = await retryQuery(async () => {
            const logsQuery = adminDb.collection("analytics")
                .where("timestamp", ">=", fiveMinutesAgo)
                .orderBy("timestamp", "desc")
                .limit(100); // Reduced limit for faster queries

            const logsSnap = await logsQuery.get();
            return logsSnap.docs.map(d => d.data());
        });

        const uniqueActiveIPs = new Set(logs.map(l => l.ip)).size;
        const pwaLogs = logs.filter(l => l.isPWA || l.source === 'PWA');
        const uniquePWA = new Set(pwaLogs.map(l => l.ip)).size;

        // 2. Messages (Popups) - with retry
        const popupMsg = await retryQuery(async () => {
            const msgQuery = adminDb.collection("messages")
                .where("isPopup", "==", true)
                .where("receiverId", "==", "all")
                .orderBy("createdAt", "desc")
                .limit(1);

            const msgSnap = await msgQuery.get();
            if (msgSnap.empty) return null;

            const data = msgSnap.docs[0].data();
            return { id: msgSnap.docs[0].id, ...data, createdAt: data.createdAt?.toDate() };
        });

        return NextResponse.json({
            success: true,
            stats: {
                activeUsers: uniqueActiveIPs,
                activePWA: uniquePWA
            },
            popupMsg
        });

    } catch (error) {
        console.error("Updates API Error:", error.message);
        // Return empty stats instead of failing completely
        return NextResponse.json({
            success: false,
            stats: { activeUsers: 0, activePWA: 0 },
            error: error.message
        });
    }
}
