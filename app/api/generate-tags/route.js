import { NextResponse } from 'next/server';

const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"];

async function generateWithGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    for (const modelName of MODELS) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (!response.ok) throw new Error(`Status ${response.status}`);
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (error) { continue; }
    }
    return null;
}

export async function POST(request) {
    try {
        const { title, content } = await request.json();
        if (!title && !content) return NextResponse.json({ tags: [] });

        // Bangla Prompt for Tags
        const prompt = `
      Analyze this news content and generate 5-8 relevant SEO tags/keywords in Bangla.
      Title: "${title}"
      Content: "${content?.substring(0, 1000)}..."
      
      IMPORTANT: Return ONLY a valid JSON Array of strings. Do not include any other text.
      Example: ["বাংলাদেশ", "রাজনীতি", "নির্বাচন"]
    `;

        const aiText = await generateWithGemini(prompt);
        let tags = [];

        if (aiText) {
            try {
                const cleanText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
                const firstOpen = cleanText.indexOf('[');
                const lastClose = cleanText.lastIndexOf(']');
                if (firstOpen !== -1 && lastClose !== -1) {
                    tags = JSON.parse(cleanText.substring(firstOpen, lastClose + 1));
                }
            } catch (e) {
                console.error("Tag parsing error", e);
            }
        }

        return NextResponse.json({ tags });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
