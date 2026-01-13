import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";

export async function GET(request) {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Free tier limits
        const LIMITS = {
            reads: 50000,
            writes: 20000,
            deletes: 20000
        };

        // Estimate usage based on analytics logs and known operations
        // Note: Firebase doesn't provide direct quota APIs, so this is an estimation

        // Count analytics entries (each is 1 write)
        const analyticsSnapshot = await adminDb.collection("analytics")
            .where("timestamp", ">=", startOfDay)
            .get();
        const analyticsWrites = analyticsSnapshot.size;

        // Count comments today (writes)
        const commentsSnapshot = await adminDb.collection("comments")
            .where("createdAt", ">=", startOfDay)
            .get();
        const commentWrites = commentsSnapshot.size;

        // Count articles published today (writes)
        const articlesSnapshot = await adminDb.collection("articles")
            .where("publishedAt", ">=", startOfDay)
            .get();
        const articleWrites = articlesSnapshot.size;

        // Estimate reads based on analytics page views
        // Each page view triggers ~2-5 reads (article + related data)
        const estimatedReads = analyticsSnapshot.size * 3;

        // Estimate additional reads from admin panel usage
        // Admin dashboard, analytics viewer, etc.
        const adminReads = Math.floor(estimatedReads * 0.4); // ~40% more for admin operations

        const totalEstimatedReads = estimatedReads + adminReads;
        const totalEstimatedWrites = analyticsWrites + commentWrites + articleWrites;
        const totalEstimatedDeletes = 0; // Track if you implement delete logging

        // Calculate time until reset (midnight PST = 2-3 PM Bangladesh time)
        const bangladeshTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
        const nextResetBangladesh = new Date(bangladeshTime);
        nextResetBangladesh.setHours(14, 0, 0, 0); // 2 PM Bangladesh time (PST midnight)

        if (bangladeshTime.getHours() >= 14) {
            nextResetBangladesh.setDate(nextResetBangladesh.getDate() + 1);
        }

        const hoursUntilReset = Math.floor((nextResetBangladesh - bangladeshTime) / (1000 * 60 * 60));
        const minutesUntilReset = Math.floor(((nextResetBangladesh - bangladeshTime) % (1000 * 60 * 60)) / (1000 * 60));

        // Calculate percentages
        const readPercentage = (totalEstimatedReads / LIMITS.reads) * 100;
        const writePercentage = (totalEstimatedWrites / LIMITS.writes) * 100;
        const deletePercentage = (totalEstimatedDeletes / LIMITS.deletes) * 100;

        // Determine alert level
        const maxPercentage = Math.max(readPercentage, writePercentage, deletePercentage);
        let alertLevel = "normal";
        if (maxPercentage >= 90) alertLevel = "critical";
        else if (maxPercentage >= 80) alertLevel = "warning";
        else if (maxPercentage >= 60) alertLevel = "caution";

        // Top query sources breakdown
        const querySources = [
            { name: "Page Views", reads: estimatedReads, category: "visitor" },
            { name: "Admin Panel", reads: adminReads, category: "admin" },
            { name: "Analytics Logging", writes: analyticsWrites, category: "system" },
            { name: "Comments", writes: commentWrites, category: "user" },
            { name: "Articles", writes: articleWrites, category: "content" }
        ];

        return NextResponse.json({
            success: true,
            quota: {
                reads: {
                    used: totalEstimatedReads,
                    limit: LIMITS.reads,
                    percentage: Math.min(readPercentage, 100),
                    remaining: Math.max(LIMITS.reads - totalEstimatedReads, 0)
                },
                writes: {
                    used: totalEstimatedWrites,
                    limit: LIMITS.writes,
                    percentage: Math.min(writePercentage, 100),
                    remaining: Math.max(LIMITS.writes - totalEstimatedWrites, 0)
                },
                deletes: {
                    used: totalEstimatedDeletes,
                    limit: LIMITS.deletes,
                    percentage: Math.min(deletePercentage, 100),
                    remaining: Math.max(LIMITS.deletes - totalEstimatedDeletes, 0)
                }
            },
            alertLevel,
            resetInfo: {
                hoursUntilReset,
                minutesUntilReset,
                nextResetTime: nextResetBangladesh.toLocaleString("en-US", {
                    timeZone: "Asia/Dhaka",
                    dateStyle: "medium",
                    timeStyle: "short"
                })
            },
            querySources: querySources.sort((a, b) => {
                const aTotal = (a.reads || 0) + (a.writes || 0);
                const bTotal = (b.reads || 0) + (b.writes || 0);
                return bTotal - aTotal;
            }).slice(0, 5),
            note: "These are estimated values based on logged operations. Actual Firestore usage may vary."
        });

    } catch (error) {
        console.error("Quota API Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
