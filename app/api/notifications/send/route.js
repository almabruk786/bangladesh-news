import { NextResponse } from 'next/server';
import { adminMessaging, adminDb } from '../../../lib/firebaseAdmin';

export async function POST(req) {
    try {
        const { title, body, link, imageUrl } = await req.json();

        if (!title || !body) {
            return NextResponse.json({ error: 'Title and Body required' }, { status: 400 });
        }

        // 1. Fetch all subscriber tokens
        const snapshot = await adminDb.collection('subscribers').get();
        const tokens = snapshot.docs.map(doc => doc.data().token).filter(t => t);

        if (tokens.length === 0) {
            return NextResponse.json({ success: false, error: 'No subscribers found in database.' });
        }

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
