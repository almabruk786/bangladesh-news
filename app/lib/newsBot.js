import Parser from 'rss-parser';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0' }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_NEWS_LIMIT = 1;

// মডেল তালিকা
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
    } catch (error) { await sleep(1000); }
  }
  return null;
}

const RSS_FEEDS = [
  "https://feeds.bbci.co.uk/bengali/rss.xml",
  "https://www.prothomalo.com/feed/",
  "https://www.dhakapost.com/rss/rss.xml",
  "https://www.jagonews24.com/rss/rss.xml",
  "https://www.jugantor.com/feed/rss.xml",
  "https://www.thedailystar.net/frontpage/rss.xml"
];

// Logger callback is optional
export async function fetchAndProcessNews(logger = () => { }) {
  logger("🤖 News Robot Starting...", "info");
  logger(`Refining Configuration: Limit ${MAX_NEWS_LIMIT} article(s)...`, "info");

  let results = [];
  let publishedCount = 0;

  for (const feedUrl of RSS_FEEDS) {
    if (publishedCount >= MAX_NEWS_LIMIT) break;

    try {
      logger(`Fetching RSS Feed: ${feedUrl}...`, "info");
      const feed = await parser.parseURL(feedUrl);
      logger(`Feed Parsed: Found ${feed.items.length} items. Scanning for fresh content...`, "success");

      for (const item of feed.items.slice(0, 5)) {
        if (publishedCount >= MAX_NEWS_LIMIT) break;

        const q = query(collection(db, "articles"), where("originalLink", "==", item.link));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // logger(`Skipping duplicate: ${item.title.substring(0, 20)}...`, "warning");
          continue;
        }

        logger(`New Article Found: "${item.title}". Initiating AI Analysis...`, "info");

        // ছবি খোঁজার লজিক
        let imageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000";
        if (item.enclosure?.url) imageUrl = item.enclosure.url;
        else if (item.mediaContent?.$?.url) imageUrl = item.mediaContent.$.url;
        else if (item.content?.match(/src="([^"]+)"/)) imageUrl = item.content.match(/src="([^"]+)"/)[1];

        logger(`Asset Retrieved: Image URL found. Generating Prompt...`, "info");

        const prompt = `
          ACT AS A SENIOR INVESTIGATIVE JOURNALIST (Bangla).
          Your Task: Write a PREMIUM QUALITY, IN-DEPTH news report based on the source.
          
          SOURCE TITLE: "${item.title}"
          SOURCE CONTENT: "${item.contentSnippet || item.content}"

          REQUIREMENTS:
          1. **Length**: MUST be approx 600 words. Detailed, comprehensive, and engaging.
          2. **Headline**: Write a "Beautiful Headline" (আকর্ষণীয় ও শক্তিশালী শিরোনাম).
          3. **Structure**: 
             - **Intro**: Hook the reader immediately.
             - **Body**: 3-4 deep paragraphs with context, analysis, and background.
             - **Conclusion**: A strong summary or forward-looking statement.
          4. **SEO & Meta**: Generate optimized Meta Title, Meta Description (160 chars), and Keywords.
          5. **Tone**: Neutral, Authoritative, Professional.

          OUTPUT FORMAT: JSON ONLY (No markdown, no plain text).
          {
            "headline": "...",
            "body": "...",
            "category": "...",
            "metaTitle": "...",
            "metaDescription": "...",
            "keywords": ["tag1", "tag2"]
          }
        `;

        await sleep(2000); // Artificial delay for "Thinking" visualization if needed, but keeping it small
        logger(`Sending to AI Engine (Gemini 2.0)... Waiting for generation (600+ words)...`, "info");

        let aiText = await generateWithGemini(prompt);
        let finalData = {};

        if (aiText) {
          try {
            logger(`AI Response Received. Parsing JSON structure...`, "info");
            // Clean up markdown code blocks
            let cleanText = aiText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            const firstOpen = cleanText.indexOf('{');
            const lastClose = cleanText.lastIndexOf('}');
            if (firstOpen !== -1 && lastClose !== -1) {
              cleanText = cleanText.substring(firstOpen, lastClose + 1);
            }
            finalData = JSON.parse(cleanText);
            logger(`Content Validated: Headline "${finalData.headline}"`, "success");
          } catch (e) {
            logger(`JSON Parsing Failed. Applying fallback...`, "error");
            console.error("JSON Parse Error:", e);
            finalData = {
              headline: item.title,
              body: item.contentSnippet || item.content || "বিস্তারিত লিংকে...",
              category: "General",
              metaTitle: item.title,
              metaDescription: "Latest news update.",
              keywords: ["news"]
            };
          }
        } else {
          logger(`AI Generation Failed. Skipping this article to avoid low-quality content.`, "error");
          continue;
        }

        // Quality Control: Ensure article is long enough (approx 500 chars minimum)
        if (!finalData.body || finalData.body.length < 500 || finalData.body.includes("বিস্তারিত লিংকে")) {
          logger(`Quality Control Failed: Article too short (${finalData.body?.length || 0} chars). Skipping to maintain quality.`, "warning");
          continue;
        }

        logger(`Saving to Database...`, "info");
        const docRef = await addDoc(collection(db, "articles"), {
          title: finalData.headline || item.title,
          content: finalData.body || "বিস্তারিত জানা যায়নি।",
          category: finalData.category || "General",
          imageUrl: imageUrl,
          imageUrls: [imageUrl],
          originalLink: item.link,
          source: feed.title || "Unknown Source",
          publishedAt: new Date().toISOString(),
          status: "published",
          authorName: "News Desk",
          authorRole: "ai",
          isPinned: false,
          // SEO Fields
          metaTitle: finalData.metaTitle || finalData.headline,
          metaDescription: finalData.metaDescription || finalData.body.substring(0, 150),
          keywords: finalData.keywords || []
        });

        logger(`✅ PUBLISHED: ${finalData.headline}`, "success");
        results.push({ id: docRef.id, title: finalData.headline });
        publishedCount++;
      }
    } catch (error) {
      logger(`Feed Error: ${error.message}`, "error");
    }
  }

  if (publishedCount === 0) {
    logger("No new articles found in any feed.", "warning");
  } else {
    logger(`Job Finished: ${publishedCount} new article(s) published.`, "success");
  }

  return results;
}