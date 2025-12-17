const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrape() {
    try {
        console.log("Fetching site...");
        const { data } = await axios.get('https://www.allbanglanewspaper.xyz/');
        const $ = cheerio.load(data);

        const logos = [];

        // Find all images that might be logos. 
        // Usually inside links to newspapers.
        $('a').each((i, el) => {
            const link = $(el).attr('href');
            const img = $(el).find('img');

            if (img.length > 0) {
                const src = img.attr('src');
                const alt = img.attr('alt') || $(el).attr('title') || "";

                if (src && src.startsWith('http')) {
                    logos.push({
                        name: alt.trim(), // Use alt text as name
                        logo: src,
                        url: link
                    });
                }
            }
        });

        // Filter out obvious noise (facebook icons, etc)
        const cleanLogos = logos.filter(l => !l.logo.includes('facebook') && !l.logo.includes('twitter'));

        console.log(`Found ${cleanLogos.length} logos.`);
        fs.writeFileSync('public/scraped_logos.json', JSON.stringify(cleanLogos, null, 2));

    } catch (e) {
        console.error(e);
    }
}

scrape();
