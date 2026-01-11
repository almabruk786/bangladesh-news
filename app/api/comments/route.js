import { NextResponse } from "next/server";
import { db } from "../../lib/firebase"; // Assumes server-side firebase init or same client if using client SDK on server (not recommended but common in simple Next apps)
// NOTE: For robust server-side Firestore, we usually use firebase-admin. 
// However, since the existing project uses client SDK in 'lib/firebase.js', we will use it here for simplicity,
// but usually API routes should use Admin SDK. 
// Given the constraints and existing file structure, let's try using the existing 'db' export.
// IF that fails due to auth, we might need a separate simple fetch to Gemini and return verdict, letting client save (insecure).
// BETTER SECURE APPROACH: Use this API to Check AND Save.
// To save from server using client SDK, we need to be careful about rules. 
// If rules require Auth, server can't easily sign in.
// ALTERNATIVE: Use the API *only* for validation signature or just do the check and let the client save if check passes?
// SECURE: API does everything. But we need Admin SDK for that.
// COMPROMISE: We will assume we can use the Gemini API here to Validate.
// AND we will try to save using the client SDK if possible, OR we return a "token" (simplified: just return success: true).
//
// LET'S GO WITH:
// 1. Receive comment
// 2. Check with Gemini
// 3. If Safe -> Save to DB (We might need Admin SDK for server-side saving if rules block unauth, but assuming rules allow writing comments or simple validation).
// Wait, 'lib/firebase.js' is Client SDK. It works in API routes but treats it as a client.
// If Firestore rules allow "create", it works.

import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request) {
    try {
        const { text, user, articleId } = await request.json();

        if (!text || !user || !articleId) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Save to Firestore as Pending
        await addDoc(collection(db, "comments"), {
            articleId,
            text,
            uid: user.uid,
            displayName: user.displayName || "Anonymous",
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            status: "pending" // Manual Moderation
        });

        return NextResponse.json({ success: true, message: "Comment submitted for approval." });

    } catch (error) {
        console.error("Comment API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
