import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextResponse } from 'next/server';

export async function GET() {
    let credentials;
    try {
        // 1. Check if Credentials Exist
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !process.env.GA_PROPERTY_ID) {
            console.warn("GA Credentials Missing. Returning mock data.");
            // Return Mock Data if keys are missing (prevents crash)
            import { BetaAnalyticsDataClient } from '@google-analytics/data';
            import { NextResponse } from 'next/server';

            export async function GET() {
                let credentials;
                try {
                    // 1. Check if Credentials Exist
                    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !process.env.GA_PROPERTY_ID) {
                        console.warn("GA Credentials Missing. Returning mock data.");
                        // Return Mock Data if keys are missing (prevents crash)
                        return NextResponse.json({ activeUsers: Math.floor(Math.random() * 20) + 5, source: 'mock' });
                    }

                    // 2. Initialize Client
                    credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
                    if (credentials.private_key) {
                        // "Nuclear" Normalization: Rebuild the PEM string completely
                        // 1. Strip everything to get just the Base64 body
                        const privateKeyBody = credentials.private_key
                            .replace(/-----BEGIN PRIVATE KEY-----/g, '')
                            .replace(/-----END PRIVATE KEY-----/g, '')
                            .replace(/\s+/g, ''); // Remove all whitespace/newlines

                        // 2. Reconstruct standardized PEM
                        credentials.private_key = `-----BEGIN PRIVATE KEY-----\n${privateKeyBody}\n-----END PRIVATE KEY-----\n`;
                    }

                    const analyticsDataClient = new BetaAnalyticsDataClient({
                        credentials,
                    });

                    // 3. Fetch Real-Time Data (Last 30 mins active users)
                    const [response] = await analyticsDataClient.runRealtimeReport({
                        property: `properties/${process.env.GA_PROPERTY_ID}`,
                        dimensions: [], // overall count
                        metrics: [
                            {
                                name: 'activeUsers',
                            },
                        ],
                    });

                    // 4. Parse Response
                    const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || 0;

                    return NextResponse.json({ activeUsers: parseInt(activeUsers), source: 'real' }, { status: 200 });

                } catch (error) {
                    console.error("GA API Error:", error);
                    // Fallback to mock on error
                    return NextResponse.json({ activeUsers: 42, error: error.message, source: 'error_fallback' });
                }
            }
