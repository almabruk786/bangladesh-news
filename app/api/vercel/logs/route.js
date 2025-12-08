import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
    const { VERCEL_TOKEN, VERCEL_PROJECT_ID } = process.env;

    // Fallback Mock Data if keys are missing
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
        return NextResponse.json({
            logs: [
                { id: 'mock1', type: 'info', msg: 'Env Vars Missing: Add VERCEL_TOKEN', time: 'Now' },
                { id: 'mock2', type: 'warning', msg: 'Showing Mock Data', time: 'Now' }
            ],
            source: "mock"
        });
    }

    try {
        // Fetch deployments from Vercel API (v6)
        const response = await axios.get(
            `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=6`,
            {
                headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
            }
        );

        const logs = response.data.deployments.map(d => {
            // Determine state color/icon type
            let type = 'info';
            if (d.state === 'READY') type = 'success';
            if (d.state === 'ERROR' || d.state === 'CANCELED') type = 'error';
            if (d.state === 'BUILDING') type = 'warning';

            // Calculate relative time (e.g., "5m ago")
            const diff = (new Date() - new Date(d.created)) / 1000 / 60; // minutes
            const timeStr = diff < 60
                ? `${Math.floor(diff)}m ago`
                : `${Math.floor(diff / 60)}h ago`;

            return {
                id: d.uid,
                type,
                state: d.state,
                msg: d.meta?.githubCommitMessage || `Deployment ${d.state}`,
                branch: d.meta?.githubCommitRef || 'unknown',
                committer: d.meta?.githubCommitAuthorName || 'Vercel',
                url: d.url ? `https://${d.url}` : null,
                time: timeStr
            };
        });

        return NextResponse.json({ logs, source: "real" });

    } catch (error) {
        console.error("Vercel API Error:", error.response?.data || error.message);
        return NextResponse.json({
            logs: [{ id: 'err', type: 'error', msg: 'API Connection Failed', time: 'Now' }],
            error: error.message,
            source: "error"
        });
    }
}
