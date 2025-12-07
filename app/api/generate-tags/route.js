import { NextResponse } from 'next/server';

const MODELS = ["gemini-1.5-flash", "gemini-2.0-flash"]; // Swapped preference

async function generateWithGemini(prompt, apiKey) {
    for (const modelName of MODELS) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (!response.ok) {
                const errText = await response.text();
                console.error(`Debug: Gemini API Error (${modelName} - ${response.status}):`, errText);
                continue;
            }
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (error) {
            console.error(`Debug: Loop error (${modelName}):`, error.message);
            continue;
        }
    }
    return null;
}

// Local Fallback: Extract keywords from Title/Content if AI fails
function generateLocalTags(title, content) {
    const combined = (title + " " + content.substring(0, 200)).toLowerCase();
    // Simple logic: split by space, remove common symbols, filter size > 3
    // This is basic but better than nothing
    const words = combined.replace(/[।.,?!(){}\[\]]/g, '').split(/\s+/);
    const unique = [...new Set(words)];
    // Filter common Bangla stop words (Mock list) or just length
    const meaningful = unique.filter(w => w.length > 3);
    return meaningful.slice(0, 5);
}

export async function POST(request) {
    let tags = [];
    const { title, content } = await request.json();

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("Debug: API Key present?", !!apiKey);

        if (apiKey) {
            // Bangla Prompt for Tags
            const prompt = `
          Analyze this news content and generate 5-8 relevant SEO tags/keywords in Bangla.
          Title: "${title}"
          Content: "${content?.substring(0, 1000)}..."
          
          IMPORTANT: Return ONLY a valid JSON Array of strings. Do not include any other text.
          Example: ["বাংলাদেশ", "রাজনীতি", "নির্বাচন"]
        `;

            const aiText = await generateWithGemini(prompt, apiKey);

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
        }

        // Fallback if AI returned no tags or error
        if (tags.length === 0) {
            console.log("Debug: Using Local Fallback Mechanism");
            tags = generateLocalTags(title || "", content || "");
        }

        return NextResponse.json({ tags });
    } catch (error) {
        // Even on crash, try to return local tags
        console.error("Critical Error", error);
        const fallback = generateLocalTags(title || "", content || "");
        return NextResponse.json({ tags: fallback });
    }
}
