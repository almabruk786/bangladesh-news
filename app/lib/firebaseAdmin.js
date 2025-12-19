import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        let serviceAccount;

        // 1. Try Environment Variable (Best for Production/Vercel)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
                console.log("Using FIREBASE_SERVICE_ACCOUNT_JSON from environment.");
            } catch (e) {
                console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON", e);
            }
        }

        // 2. Fallback to File (Best for Localhost)
        if (!serviceAccount) {
            try {
                serviceAccount = require('../../service-account.json');
                console.log("Using local service-account.json file.");
            } catch (e) {
                console.warn("Local service-account.json not found.");
            }
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("Firebase Admin initialized successfully.");
        } else {
            console.error("No valid credentials found for Firebase Admin.");
        }
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
