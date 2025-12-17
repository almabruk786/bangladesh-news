import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    try {
        // Add timeout and user-agent to resemble a browser
        const { data } = await axios.get(url, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        // Priority: OG Image -> specific logo class? -> Apple Touch Icon -> Favicon
        let logo = $('meta[property="og:image"]').attr('content');

        if (!logo) logo = $('link[rel="apple-touch-icon"]').attr('href');
        if (!logo) logo = $('link[rel="icon"]').attr('href');
        if (!logo) logo = $('link[rel="shortcut icon"]').attr('href');

        // Handle relative URLs
        if (logo && !logo.startsWith('http')) {
            const origin = new URL(url).origin;
            // Handle root-relative vs relative
            if (logo.startsWith('/')) {
                logo = origin + logo;
            } else {
                logo = new URL(logo, url).href;
            }
        }

        return NextResponse.json({ logo });
    } catch (error) {
        console.error("Metadata fetch error:", error.message);
        // Fallback: Try /favicon.ico blindly
        try {
            const origin = new URL(url).origin;
            return NextResponse.json({ logo: `${origin}/favicon.ico` });
        } catch (e) {
            return NextResponse.json({ error: 'Failed to fetch', logo: null });
        }
    }
}
