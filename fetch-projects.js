const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local to find the token
const envPath = path.join(__dirname, '.env.local');
let token = '';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VERCEL_TOKEN=([^\s]+)/);
    if (match) token = match[1];
}

if (!token) {
    console.error("No VERCEL_TOKEN found in .env.local");
    process.exit(1);
}

const options = {
    hostname: 'api.vercel.com',
    path: '/v9/projects',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            const projects = JSON.parse(data).projects;
            console.log("Projects Found:");
            projects.forEach(p => {
                console.log(`- Name: ${p.name}, ID: ${p.id}`);
            });
        } else {
            console.error(`Error: ${res.statusCode} - ${data}`);
        }
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();
