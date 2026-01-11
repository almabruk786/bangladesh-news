const https = require('https');

// Read API Key from environment or hardcode for testing if needed
// For this script running in terminal with dotenv, we need to load it.
// Assuming we can run it via `node -r dotenv/config scripts/check_models.js`
// OR I will just read the file content of .env.local if existing?
// The user has .env.local likely. I'll assume the environment has the key or I need to find it.
// I'll try to use the one from code if I can find it, or ask user.
// Wait, I can see the key in `firebase-messaging-sw.js`? No that's firebase config.
// The key is likely in `.env.local`. I'll try to read `.env.local` first.

const fs = require('fs');
const path = require('path');

let apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/GEMINI_API_KEY=(.*)/);
            if (match) {
                apiKey = match[1].trim();
            }
        }
    } catch (e) {
        console.error("Error reading .env.local", e);
    }
}

if (!apiKey) {
    console.error("GEMINI_API_KEY not found.");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error);
            } else {
                console.log("Available Models:");
                json.models.forEach(m => {
                    if (m.supportedGenerationMethods.includes('generateContent')) {
                        console.log(`- ${m.name}`);
                    }
                });
            }
        } catch (e) {
            console.error("Parse Error:", e);
            console.log("Raw Data:", data);
        }
    });
}).on('error', (e) => {
    console.error("Request Error:", e);
});
