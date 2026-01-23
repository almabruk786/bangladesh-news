import Parser from 'rss-parser';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_NEWS_LIMIT = 1;

// Cached working models list
let availableModels = [];

async function getAvailableModels(apiKey, logger) {
  if (availableModels.length > 0) return availableModels;

  try {
    if (logger) logger("Validating API Key and discovering available models...", "info");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (!response.ok) {
      const text = await response.text();
      if (logger) logger(`Failed to list models: ${response.status} - ${text}`, "error");
      return [];
    }

    const data = await response.json();
    const models = data.models || [];

    // Filter for generation capable models
    const generationModels = models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"));
    const generationNames = generationModels.map(m => m.name.replace('models/', ''));

    // Preference list
    const preferred = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-flash-002", "gemini-1.5-pro", "gemini-pro"];

    // Sort models: Preferred ones first, then others
    const sortedModels = [];

    // Add preferred matches first
    for (const p of preferred) {
      const match = generationNames.find(name => name === p || name.startsWith(p));
      if (match && !sortedModels.includes(match)) {
        sortedModels.push(match);
      }
    }

    // Add remaining generation models
    for (const name of generationNames) {
      if (!sortedModels.includes(name)) {
        sortedModels.push(name);
      }
    }

    if (sortedModels.length > 0) {
      availableModels = sortedModels;
      if (logger) logger(`Discovered Models (Priority Order): ${availableModels.join(", ")}`, "success");
      return availableModels;
    }

    if (logger) logger("No models found with 'generateContent' capability.", "error");
    return [];

  } catch (e) {
    if (logger) logger(`Model discovery failed: ${e.message}`, "error");
    return [];
  }
}

async function generateWithGemini(prompt, logger) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    if (logger) logger("CRITICAL: GEMINI_API_KEY is missing in environment variables!", "error");
    return null;
  }

  // Get list of valid models to try
  const modelList = await getAvailableModels(apiKey, logger);

  if (modelList.length === 0) {
    if (logger) logger("ABORT: Could not find any valid Gemini models for this API key.", "error");
    return null;
  }

  // Loop through models until one works
  for (const modelName of modelList) {
    try {
      // if (logger) logger(`Attempting generation with model: ${modelName}...`, "info");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) {
        const errorText = await response.text();

        // If Quota Exceeded (429), strictly try next model
        if (response.status === 429) {
          if (logger) logger(`Model ${modelName} Quota Exceeded (429). Switching to next model...`, "warning");
          continue; // Try next model
        }

        console.error(`Model ${modelName} Failed: ${response.status}`, errorText);
        if (logger) logger(`Model ${modelName} Error (${response.status}). Trying next...`, "warning");
        continue; // Try next model for other errors too
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        return text; // Success! Return immediately
      }

    } catch (error) {
      if (logger) logger(`Error with ${modelName}: ${error.message}. Switching...`, "warning");
      // Continue to next model
    }
  }

  if (logger) logger("ALL MODELS FAILED. Please check your API Quota or Key.", "error");
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

      // Manual Fetch to handle BOM or whitespace issues
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const text = await response.text();
      // Clean BOM and leading whitespace
      const cleanText = text.replace(/^\uFEFF/g, '').trim();

      const feed = await parser.parseString(cleanText);

      logger(`Feed Parsed: Found ${feed.items.length} items. Scanning for fresh content...`, "success");

      // Scan more items to find non-duplicates
      for (const item of feed.items.slice(0, 15)) {
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

        // লাইন ১৯১-২৬৮ পর্যন্ত replace করুন এই কোড দিয়ে:

        const prompt = `
          ACT AS A SENIOR INVESTIGATIVE JOURNALIST (Bangla).
          Your Task: Write a PREMIUM QUALITY, IN-DEPTH news report based on the source.
          
          SOURCE TITLE: "${String(item.title || '')}"
          SOURCE CONTENT: "${String(item.contentSnippet || item.content || '')}"

          CRITICAL REQUIREMENTS:
          
          1. **Headline (SEO Friendly)**: 
             - MUST rewrite completely, DO NOT copy-paste the source title
             - Make it engaging, click-worthy, and incorporate important keywords
             - Length: 50-70 characters
          
          2. **Author Name (Bangla)**:
             - Select appropriate based on category:
             - নিজস্ব প্রতিবেদক, ঢাকা (for National/Politics/Crime)
             - বাণিজ্য ডেস্ক (for Business/Economy)
             - খেলা ডেস্ক (for Sports)
             - বিনোদন ডেস্ক (for Entertainment)
             - প্রযুক্তি ডেস্ক (for Technology)
             - আন্তর্জাতিক ডেস্ক (for International)
          
          3. **Story Content**: 
             - Length: 400-500 WORDS (বাংলায়)
             - Structure in 5 clear sections:
               a) **সূচনা (Intro)**: Catchy opening (80-100 words)
               b) **পটভূমি (Background)**: Context and history (80-100 words)
               c) **বিশ্লেষণ (Analysis)**: Deep dive with facts and perspectives (100-120 words)
               d) **প্রভাব (Impact)**: Consequences and implications (80-100 words)
               e) **উপসংহার (Conclusion)**: Summary and future outlook (60-80 words)
             - Use proper paragraph breaks (\\n\\n)
             - Include relevant examples, statistics (you can simulate realistic numbers)
          
          4. **Meta Description (SEO)**: 
             - 150-160 characters
             - Summarize the article enticingly
             - Include primary keyword
          
          5. **Categories**: 
             - Select 1-3 relevant categories from: জাতীয়, আন্তর্জাতিক, রাজনীতি, খেলা, ব্যবসা-বাণিজ্য, বিনোদন, প্রযুক্তি, স্বাস্থ্য, শিক্ষা, অপরাধ, আবহাওয়া, অর্থনীতি
             - Return as array
          
          6. **Tags (SEO)**: 
             - 5-8 relevant Bangla keywords/phrases
             - Mix of broad and specific terms
          
          7. **Image Caption**: 
             - Write a descriptive Bangla caption for the main image (20-30 words)
             - Should relate to the story context
          
          8. **Image Alt Text (SEO)**: 
             - Bangla description for accessibility (10-15 words)
             - Describe what's visually in the image related to the news
          
          9. **Tone**: Neutral, Authoritative, Professional, Engaging

          OUTPUT FORMAT: STRICT JSON ONLY (No markdown blocks, no extra text).
          {
            "headline": "...",
            "authorName": "...",
            "body": "...",
            "categories": ["...", "..."],
            "metaTitle": "...",
            "metaDescription": "...",
            "tags": ["...", "...", "..."],
            "imageCaption": "...",
            "imageAlt": "..."
          }
        `;

        await sleep(2000);
        logger(`Sending to AI Engine (Gemini 2.0)... Waiting for generation (400-500 words)...`, "info");

        let aiText = await generateWithGemini(prompt, logger);
        let finalData = {};

        if (aiText) {
          try {
            logger(`AI Response Received. Parsing JSON structure...`, "info");
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
              categories: ["জাতীয়"],
              metaTitle: item.title,
              metaDescription: "Latest news update.",
              tags: ["news"],
              authorName: "নিজস্ব প্রতিবেদক",
              imageCaption: item.title,
              imageAlt: "সংবাদ চিত্র"
            };
          }
        } else {
          logger(`AI Generation Failed. Skipping this article to avoid low-quality content.`, "error");
          continue;
        }

        // Quality Control: Ensure article is long enough (1500 chars minimum = approx 300-400 words)
        if (!finalData.body || finalData.body.length < 1500 || finalData.body.includes("বিস্তারিত লিংকে")) {
          logger(`Quality Control Failed: Article too short (${finalData.body?.length || 0} chars). Required: 1500+. Skipping to maintain quality.`, "warning");
          continue;
        }

        logger(`Saving to Database...`, "info");
        const docRef = await addDoc(collection(db, "articles"), {
          title: finalData.headline || item.title,
          content: finalData.body || "বিস্তারিত জানা যায়নি।",
          category: finalData.categories?.[0] || finalData.category || "জাতীয়",
          categories: finalData.categories || [finalData.category || "জাতীয়"],
          imageUrl: imageUrl,
          imageUrls: [imageUrl],
          imageCaption: finalData.imageCaption || finalData.headline,
          imageAlt: finalData.imageAlt || finalData.headline,
          originalLink: item.link,
          source: feed.title || "Unknown Source",
          publishedAt: new Date().toISOString(),
          status: "published",
          authorName: finalData.authorName || "নিজস্ব প্রতিবেদক",
          authorRole: "ai",
          isPinned: false,
          // SEO Fields
          metaTitle: finalData.metaTitle || finalData.headline,
          metaDescription: finalData.metaDescription || finalData.body.substring(0, 150),
          keywords: finalData.keywords || finalData.tags || [],
          tags: finalData.tags || []
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