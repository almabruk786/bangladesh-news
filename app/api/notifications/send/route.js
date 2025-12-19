import { NextResponse } from 'next/server';
import { adminMessaging, adminDb } from '../../../lib/firebaseAdmin';

export async function POST(req) {
    try {
        const { title, body, link, imageUrl } = await req.json();

        if (!title || !body) {
            return NextResponse.json({ error: 'Title and Body required' }, { status: 400 });
        }

        // DEBUG: Check connection
        if (adminDb.constructor.name === 'Object' && !adminDb.collection) {
            // This detects if it is the Mock DB
        }

        import admin from 'firebase-admin'; // Ensure we can check admin.apps

        if (!admin.apps.length) {
            return NextResponse.json({ success: false, error: 'CRITICAL: Firebase Admin Service is NOT initialized. Check server logs/credentials.' });
        }

        // 1. Fetch all subscriber tokens
        const snapshot = await adminDb.collection('subscribers').get();

        if (snapshot.docs.length === 0) {
            // Differentiate Empty vs Error
            return NextResponse.json({ success: false, error: 'Database Connected but No subscribers found. (Collection Empty)' });
        }

        const tokens = snapshot.docs.map(doc => doc.data().token).filter(t => t);

        // 2. Prepare Payload for 'sendEach' (Data-Only Message)
        // We use Data-Only to prevent the browser from automatically showing a notification
        // so we can have full control in the Service Worker and Foreground.
        const messages = tokens.map(token => ({
            token: token,
            data: {
                title: title,
                body: body,
                imageUrl: imageUrl || 'https://bakalia.xyz/bn-icon.png',
                link: link || 'https://bakalia.xyz',
                tag: `news-${Date.now()}`
            }
        }));

        // 3. Send Batch
        // adminMessaging.sendEach handles up to 500 messages per batch.
        // For simplicity assuming <500 subscribers for now.
        const response = await adminMessaging.sendEach(messages);

        // 4. Cleanup invalid tokens
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                    console.error(`Failure sending to ${tokens[idx]}:`, resp.error);
                }
            });
            console.log('Failed tokens count:', failedTokens.length);
        }

        return NextResponse.json({
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount
        });

    } catch (error) {
        console.error('Notification Send Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
