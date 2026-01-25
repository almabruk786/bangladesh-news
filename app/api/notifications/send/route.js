import { NextResponse } from 'next/server';
import { adminMessaging, adminDb } from '../../../lib/firebaseAdmin';
import admin from 'firebase-admin';

export async function POST(req) {
    try {
        const { title, body, link, imageUrl, targetToken } = await req.json();

        if (!title || !body) {
            return NextResponse.json({ error: 'Title and Body required' }, { status: 400 });
        }

        // ... validation ...

        if (!admin.apps.length) {
            return NextResponse.json({ success: false, error: 'CRITICAL: Firebase Admin Service is NOT initialized. Check server logs/credentials.' });
        }

        let tokens = [];

        // 1. Fetch tokens (Targeted vs Broadcast)
        if (targetToken) {
            tokens = [targetToken];
            console.log(`[Notification] Sending targeted message to: ${targetToken.substring(0, 15)}...`);
        } else {
            // Fetch all subscriber tokens
            const snapshot = await adminDb.collection('subscribers').get();
            if (snapshot.docs.length === 0) {
                return NextResponse.json({ success: false, error: 'Database Connected but No subscribers found. (Collection Empty)' });
            }
            tokens = snapshot.docs.map(doc => doc.data().token).filter(t => t);
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
            const deletePromises = [];

            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const token = tokens[idx];
                    failedTokens.push(token);

                    // Log the specific error
                    const errorCode = resp.error?.code;
                    console.error(`Failure sending to ${token.substring(0, 20)}...:`, errorCode || resp.error);

                    // Delete invalid tokens (unregistered, expired, or invalid)
                    // Common FCM error codes that indicate token should be removed:
                    // - messaging/invalid-registration-token
                    // - messaging/registration-token-not-registered
                    if (errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered') {
                        deletePromises.push(
                            adminDb.collection('subscribers').doc(token).delete()
                                .then(() => console.log(`✓ Cleaned up invalid token: ${token.substring(0, 20)}...`))
                                .catch(err => console.error(`✗ Failed to delete token:`, err))
                        );
                    }
                }
            });

            // Wait for all deletions to complete
            if (deletePromises.length > 0) {
                await Promise.all(deletePromises);
                console.log(`🧹 Cleaned up ${deletePromises.length} invalid tokens out of ${failedTokens.length} failures`);
            }

            console.log(`📊 Notification Stats: ${response.successCount} success, ${failedTokens.length} failed`);
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
