import { NextResponse } from 'next/server';
import { adminMessaging, adminDb } from '../../../lib/firebaseAdmin';

/**
 * Manual Token Cleanup Endpoint
 * Tests all FCM tokens and removes invalid ones
 * Admin can call this periodically to clean up the database
 */
export async function POST(req) {
    try {
        // Fetch all subscriber tokens
        const snapshot = await adminDb.collection('subscribers').get();

        if (snapshot.docs.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No subscribers found',
                cleaned: 0,
                total: 0
            });
        }

        const tokens = snapshot.docs.map(doc => ({
            id: doc.id,
            token: doc.data().token
        }));

        // Test each token with a dry-run message
        const testMessages = tokens.map(({ token }) => ({
            token: token,
            data: {
                title: 'test',
                body: 'test',
            },
            dryRun: true  // This doesn't actually send, just validates the token
        }));

        console.log(`Testing ${testMessages.length} FCM tokens...`);
        const testResponse = await adminMessaging.sendEach(testMessages);

        // Delete invalid tokens
        const deletePromises = [];
        let cleanedCount = 0;

        testResponse.responses.forEach((resp, idx) => {
            if (!resp.success) {
                const errorCode = resp.error?.code;
                const token = tokens[idx];

                console.log(`Invalid token found: ${token.token.substring(0, 20)}... - ${errorCode}`);

                // Remove invalid tokens
                if (errorCode === 'messaging/invalid-registration-token' ||
                    errorCode === 'messaging/registration-token-not-registered') {
                    deletePromises.push(
                        adminDb.collection('subscribers').doc(token.id).delete()
                            .then(() => {
                                cleanedCount++;
                                console.log(`✓ Deleted invalid token: ${token.id.substring(0, 20)}...`);
                            })
                            .catch(err => console.error(`✗ Failed to delete:`, err))
                    );
                }
            }
        });

        // Wait for all deletions
        await Promise.all(deletePromises);

        return NextResponse.json({
            success: true,
            message: `Token cleanup complete`,
            total: tokens.length,
            cleaned: cleanedCount,
            remaining: tokens.length - cleanedCount
        });

    } catch (error) {
        console.error('Token cleanup error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
