import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { email } = await request.json();

        // 1. Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return NextResponse.json({ success: false, message: "Invalid email address." }, { status: 400 });
        }

        // 2. Check for Duplicate
        const q = query(collection(db, "subscribers"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return NextResponse.json({ success: false, message: "You are already subscribed!" }, { status: 400 });
        }

        // 3. Save to Firestore
        await addDoc(collection(db, "subscribers"), {
            email,
            subscribedAt: serverTimestamp(),
            isActive: true,
            source: "footer_signup"
        });

        return NextResponse.json({ success: true, message: "Successfully subscribed!" });

    } catch (error) {
        console.error("Subscription Error:", error);
        return NextResponse.json({ success: false, message: "Server error. Try again later." }, { status: 500 });
    }
}
