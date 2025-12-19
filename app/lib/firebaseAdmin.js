import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        // Direct file load strategy (Robust against Env parsing issues)
        const serviceAccount = require('../../service-account.json');

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin initialized successfully with file-based credentials.");
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
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
const mockDb = {
    collection: () => ({
        get: async () => ({ docs: [] }),
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
