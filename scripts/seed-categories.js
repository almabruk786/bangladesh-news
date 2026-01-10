const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, writeBatch } = require("firebase/firestore");

// 1. HARDCODED CONFIG (To avoid env issues in standalone script)
// I will try to read this from a file or just ask the system to provide it if I can't find it.
// Actually, safely I should read the firebase config file from the project to get the keys.
// But reading 'lib/firebase.js' might be tricky if it uses 'export const'.
// Let's try to regex read the config from 'app/lib/firebase.js' or just use a known placeholder if I can't.
// Wait, I can just require the file if it's commonjs? No, likely it's 'export const db = ...' (ES Module syntax).
// So I will read the file content, extract the config object with regex, and use it here.

const fs = require('fs');
const path = require('path');

async function run() {
    try {
        // Read firebase config manually to avoid import issues
        const fbPath = path.join(__dirname, '../app/lib/firebase.js');
        const fbContent = fs.readFileSync(fbPath, 'utf8');

        // Simple regex to extract the config object
        const match = fbContent.match(/firebaseConfig\s*=\s*({[\s\S]*?});/);
        let config;

        if (match && match[1]) {
            // This uses `eval` which is risky but fine for a local seed script tool
            // We need to handle potential 'process.env' inside it.
            // If the file uses process.env, this approach fails unless we load .env
            // Let's assume it might use process.env.
            console.log("Found config structure, but it likely uses process.env. Aborting direct read.");
            // Better approach: user probably has .env.local.
            // I will try to load .env.local using 'dotenv' if available? No, not in dependencies.
            // I will Parse .env.local manually.
        }

        // MANUAL PARSE .ENV.LOCAL
        const envPath = path.join(__dirname, '../.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const [key, val] = line.split('=');
                if (key && val) process.env[key.trim()] = val.trim().replace(/"/g, '');
            });
        }

        // NOW I can hopefully "require" the existing firebase lib? 
        // No, 'app/lib/firebase.js' is likely using 'export'. 'require' fails on 'export'.

        // PLAN B: Re-construct config from process.env manually
        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        if (!firebaseConfig.apiKey) {
            console.error("❌ Could not load API Key from .env.local");
            return;
        }

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // SEED DATA
        const defaultCategories = [
            { name: "National", bn: "জাতীয়" },
            { name: "Bangladesh", bn: "বাংলাদেশ" },
            { name: "Politics", bn: "রাজনীতি" },
            { name: "International", bn: "আন্তর্জাতিক" },
            { name: "Sports", bn: "খেলা" },
            { name: "Health", bn: "স্বাস্থ্য" },
            { name: "Technology", bn: "প্রযুক্তি" },
            { name: "Education", bn: "শিক্ষা" },
            { name: "Opinion", bn: "মতামত" },
            { name: "Business", bn: "বাণিজ্য" },
            { name: "Entertainment", bn: "বিনোদন" },
            { name: "Lifestyle", bn: "জীবনযাপন" },
        ];

        const batch = writeBatch(db);
        const catRef = collection(db, "categories");

        // Check existing
        const snapshot = await getDocs(catRef);
        const existingNames = snapshot.docs.map(d => d.data().name);

        let count = 0;
        defaultCategories.forEach(cat => {
            if (!existingNames.includes(cat.name)) {
                const newRef = doc(catRef); // Auto ID
                batch.set(newRef, cat);
                count++;
            }
        });

        if (count > 0) {
            await batch.commit();
            console.log(`✅ Successfully seeded ${count} categories!`);
        } else {
            console.log("⚠️ All default categories already exist.");
        }

    } catch (error) {
        console.error("❌ Seed Failed:", error);
    }
}

run();
