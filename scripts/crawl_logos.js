const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Full list of newspapers (User provided + Existing)
const newspapers = [
    { domain: "prothomalo.com", name: "Prothom Alo" },
    { domain: "bd-pratidin.com", name: "Bangladesh Pratidin" },
    { domain: "ittefaq.com.bd", name: "Ittefaq" },
    { domain: "kalerkantho.com", name: "Kaler Kantho" },
    { domain: "dailynayadiganta.com", name: "Naya Diganta" },
    { domain: "amar-sangbad.com", name: "Amar Sangbad" },
    { domain: "protidinersangbad.com", name: "Protidiners Sangbad" },
    { domain: "jugantor.com", name: "Jugantor" },
    { domain: "dailysangram.com", name: "Daily Sangram" },
    { domain: "mzamin.com", name: "Manab Zamin" },
    { domain: "dainikamadershomoy.com", name: "Amader Shomoy" },
    { domain: "bonikbarta.net", name: "Bonik Barta" },
    { domain: "samakal.com", name: "Samakal" },
    { domain: "dailyjanakantha.com", name: "Janakantha" },
    { domain: "jjdin.com", name: "Jai Jai Din" },
    { domain: "bhorerkagoj.net", name: "Bhorer Kagoj" },
    { domain: "arthoniteerkagoj.com", name: "Arthoniteer Kagoj" },
    { domain: "dailyinqilab.com", name: "Inqilab" },
    { domain: "thesangbad.net", name: "Sangbad" },
    { domain: "manobkantha.com", name: "Manobkantha" },
    { domain: "suprobhat.com", name: "Suprobhat" },
    { domain: "bd-journal.com", name: "Bangladesh Journal" },
    { domain: "dailydinkal.net", name: "Dinkal" },
    { domain: "alokitobangladesh.com", name: "Alokito Bangladesh" },
    { domain: "ajkerbazzar.com", name: "Ajker Bazzar" },
    { domain: "amaderorthoneeti.com", name: "Amader Orthoneeti" },
    { domain: "bangladeshpost.net", name: "Bangladesh Post" },
    { domain: "sorejominbarta.com", name: "Sorejomin Barta" },
    { domain: "khabarpatrabd.com", name: "Khabarpatra" },
    { domain: "dailyvorerpata.com", name: "Vorer Pata" },
    { domain: "shomoyeralo.com", name: "Shomoyer Alo" },
    { domain: "sharebiz.net", name: "Share Biz" },
    { domain: "dailybartoman.com", name: "Bartoman" },
    { domain: "ajkalerkhobor.com", name: "Ajkaler Khobor" },
    { domain: "sangbadkonika.com", name: "Sangbad Konika" },
    { domain: "kholakagojbd.com", name: "Khola Kagoj" },
    { domain: "gonokantho.com", name: "Gonokantho" },
    { domain: "thedailystar.net", name: "The Daily Star" },
    { domain: "observerbd.com", name: "Daily Observer" },
    { domain: "thefinancialexpress.com.bd", name: "Financial Express" },
    { domain: "deshrupantor.com", name: "Desh Rupantor" },
    { domain: "bangladesherkhabor.net", name: "Bangladesher Khabor" },
    { domain: "tbsnews.net", name: "TBS News" },
    { domain: "dhakatribune.com", name: "Dhaka Tribune" },
    { domain: "businesspostbd.com", name: "Business Post" },
    { domain: "ajkerpatrika.com", name: "Ajker Patrika" },
    { domain: "dainikbangla.com.bd", name: "Dainik Bangla" }
];

const TARGET_DIR = path.join(__dirname, '../public/newspapers');
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
}

async function crawl() {
    console.log("Starting Crawler...");
    const results = [];

    for (const paper of newspapers) {
        const url = `https://www.${paper.domain}`;
        let logoUrl = null;
        let finalPath = "";

        // Check if we already have it locally
        const slug = paper.domain.replace(/\./g, '_');
        const localFilename = `${slug}.png`;
        const localPath = path.join(TARGET_DIR, localFilename);

        if (fs.existsSync(localPath)) {
            console.log(`[SKIP] ${paper.name} - Already exists`);
            finalPath = `/newspapers/${localFilename}`;
            results.push({ name: paper.name, url: url, logo: finalPath });
            continue;
        }

        try {
            console.log(`[FETCH] ${paper.name} (${url})...`);
            const { data } = await axios.get(url, {
                timeout: 5000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            });
            const $ = cheerio.load(data);

            // Strategy: 1. og:image, 2. twitter:image, 3. icon, 4. img with logo in class/id
            logoUrl = $('meta[property="og:image"]').attr('content') ||
                $('meta[name="twitter:image"]').attr('content') ||
                $('link[rel="apple-touch-icon"]').attr('href') ||
                $('link[rel="icon"]').attr('href') ||
                $('link[rel="shortcut icon"]').attr('href');

            // Try to find an img with 'logo' in class or id if no meta
            if (!logoUrl) {
                const img = $('img').filter((i, el) => {
                    const src = $(el).attr('src') || '';
                    const cls = $(el).attr('class') || '';
                    const id = $(el).attr('id') || '';
                    return (cls.includes('logo') || id.includes('logo') || src.includes('logo')) && src.length > 0;
                }).first();
                logoUrl = img.attr('src');
            }

            if (logoUrl) {
                // Normalize URL
                if (logoUrl.startsWith('//')) logoUrl = 'https:' + logoUrl;
                if (logoUrl.startsWith('/')) logoUrl = url + logoUrl;

                console.log(`   -> Found logo: ${logoUrl}`);
                try {
                    await downloadImage(logoUrl, localPath);
                    finalPath = `/newspapers/${localFilename}`;
                    console.log(`   -> Downloaded to ${finalPath}`);
                } catch (err) {
                    console.error(`   -> Failed to download: ${err.message}`);
                    finalPath = ""; // Fallback to empty if download fails
                }

            } else {
                console.log(`   -> No logo found.`);
                finalPath = "";
            }

        } catch (error) {
            console.error(`[ERROR] ${paper.name}: ${error.message}`);
            finalPath = "";
        }

        results.push({
            name: paper.name,
            bn: "", // We'll keep blank to merge later manually if needed or leave as is
            url: url,
            logo: finalPath
        });
    }

    console.log("\nFinished! COPY THIS JSON:");
    console.log(JSON.stringify(results, null, 2));
}

crawl();
