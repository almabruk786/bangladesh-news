const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
let token = '';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VERCEL_TOKEN=([^\s]+)/);
    if (match) token = match[1];
}

if (!token) process.exit(1);

const options = {
    hostname: 'api.vercel.com',
    path: '/v9/projects',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const projects = JSON.parse(data).projects;
            // Find project matching "bangladesh" or take first
            const project = projects.find(p => p.name.includes('bangladesh')) || projects[0];

            if (project) {
                fs.appendFileSync(envPath, `\nVERCEL_PROJECT_ID=${project.id}\n`);
                console.log(`Saved VERCEL_PROJECT_ID=${project.id}`);
            }
        }
    });
});
req.end();
