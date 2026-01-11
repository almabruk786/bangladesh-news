import { NextResponse } from 'next/server';

const MODELS = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-flash-002", "gemini-pro"];

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
// Local Fallback: Extract meaningful keywords
function generateLocalTags(title, content) {
    const combined = (title + " " + title + " " + content.substring(0, 500)).toLowerCase();

    // Common Bangla Stopwords
    const stopWords = new Set([
        "এবং", "ও", "কিন্তু", "অথবা", "করতে", "করা", "করে", "বলেন", "শুরু", "হয়", "হল", "হলো", "জন্য",
        "একটি", "এই", "সেই", "তার", "তিনি", "তারা", "থেকে", "সাথে", "নিয়ে", "দিকে", "মত", "আছে",
        "ছিল", "হবে", "সব", "কি", "কেন", "যে", "সে", "তা", "এটি", "বলে", "বলেছেন", "করেন", "জানান",
        "পরে", "আগেই", "মধ্যে", "কাছে", "দ্বারা", "নিজে", "বিনা", "ছাড়া", "উপর", "নিচে", "পর্যন্ত"
    ]);

    // Extract words (Bangla & English alphanumeric)
    const words = combined.replace(/[।.,?!(){}\[\]"']/g, ' ').split(/\s+/);

    // Count Frequency
    const freq = {};
    words.forEach(w => {
        if (w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w)) {
            freq[w] = (freq[w] || 0) + 1;
        }
    });

    // Sort by frequency
    const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);

    // Return top 5 unique tags
    return sorted.slice(0, 6);
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
