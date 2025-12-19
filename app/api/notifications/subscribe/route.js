import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';

export async function POST(req) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Save token to 'subscribers' collection
        // Use token as document ID to prevent duplicates
        await adminDb.collection('subscribers').doc(token).set({
            token: token,
            subscribedAt: new Date(),
        });

        return NextResponse.json({ success: true, message: 'Subscribed successfully' });

    } catch (error) {
        console.error('Subscription Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
