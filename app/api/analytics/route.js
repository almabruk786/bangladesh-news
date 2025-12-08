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
            // 1. Remove optional surrounding quotes (sometimes copied by mistake)
            if (credentials.private_key.startsWith('"') && credentials.private_key.endsWith('"')) {
                credentials.private_key = credentials.private_key.slice(1, -1);
            }

            // 2. Normalize Newlines
            credentials.private_key = credentials.private_key
                .replace(/\\n/g, '\n') // Replace literal \n with real newline
                .replace(/\r/g, '');   // Remove Windows CR
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

        // Safe Debugging to find the root cause
        const keySample = credentials?.private_key
            ? credentials.private_key.substring(0, 50) + "..."
            : "UNDEFINED";

        return NextResponse.json({
            activeUsers: 42,
            error: error.message,
            debug: {
                startOfKey: keySample,
                totalLength: credentials?.private_key?.length,
                includesRealNewline: credentials?.private_key?.includes('\n'),
                includesEscapedNewline: credentials?.private_key?.includes('\\n'),
            },
            source: 'error_fallback'
        });
    }
}
