import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        let serviceAccount;
        // 1. Try Environment Variable (Best for Production/Vercel)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            } catch (e) {
                console.error("[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON", e);
            }
        }

        // 2. Fallback to File (Best for Localhost)
        if (!serviceAccount) {
            try {
                // Use fs to avoid Webpack trying to bundle the missing file in production
                const fs = require('fs');
                const path = require('path');
                const filePath = path.join(process.cwd(), 'service-account.json');
                console.log(`[FirebaseAdmin] Checking path: ${filePath}`);

                if (fs.existsSync(filePath)) {
                    serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    console.log("[FirebaseAdmin] Using local service-account.json file.");
                } else {
                    console.warn("[FirebaseAdmin] Local service-account.json NOT FOUND at " + filePath);
                }
            } catch (e) {
                console.warn("[FirebaseAdmin] Local service-account.json read error:", e);
            }
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("[FirebaseAdmin] Firebase Admin initialized successfully.");
        } else {
            console.error("[FirebaseAdmin] No valid credentials found for Firebase Admin.");
        }
    } catch (error) {
        console.error('[FirebaseAdmin] Firebase admin initialization error', error);
    }
} else {
    console.log("[FirebaseAdmin] Already initialized (apps.length > 0)");
}

// Helper to safely get admin instances
const getAdminDb = () => {
    if (!admin.apps.length) return null;
    try { return admin.firestore(); } catch (e) { return null; }
};

const getAdminMessaging = () => {
    if (!admin.apps.length) return null;
    try { return admin.messaging(); } catch (e) { return null; }
};

// Robust mock to prevent crashes if init fails
// Robust mock to prevent crashes if init fails
const mockDb = {
    collection: () => ({
        where: function () { return this; },
        orderBy: function () { return this; },
        limit: function () { return this; },
        select: function () { return this; },
        get: async () => ({ docs: [], empty: true }),
        doc: () => ({
            set: async () => console.warn("Mock Firestore: Data not saved (Init failed)"),
            get: async () => ({ exists: false, data: () => ({}) }),
            update: async () => console.warn("Mock Firestore: Data not updated"),
            delete: async () => console.warn("Mock Firestore: Data not deleted")
        })
    })
};

const mockMessaging = {
    sendMulticast: async () => ({ successCount: 0, failureCount: 0, responses: [] }),
    sendEach: async () => ({ successCount: 0, failureCount: 0, responses: [] })
};

export const adminDb = getAdminDb() || mockDb;
export const adminMessaging = getAdminMessaging() || mockMessaging;
