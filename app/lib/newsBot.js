import Parser from 'rss-parser';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0' }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_NEWS_LIMIT = 3;

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

export async function fetchAndProcessNews() {
  console.log(`🤖 নিউজ রোবট কাজ শুরু করেছে...`);
  let results = [];
  let publishedCount = 0;

  for (const feedUrl of RSS_FEEDS) {
    if (publishedCount >= MAX_NEWS_LIMIT) break;

    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items.slice(0, 5)) {
        if (publishedCount >= MAX_NEWS_LIMIT) break;

        const q = query(collection(db, "articles"), where("originalLink", "==", item.link));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) continue;

        // ছবি খোঁজার লজিক
        let imageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000";
        if (item.enclosure?.url) imageUrl = item.enclosure.url;
        else if (item.mediaContent?.$?.url) imageUrl = item.mediaContent.$.url;
        else if (item.content?.match(/src="([^"]+)"/)) imageUrl = item.content.match(/src="([^"]+)"/)[1];

        const prompt = `
          ACT AS A SENIOR INVESTIGATIVE JOURNALIST.
          Your Task: Rewrite usage of the following news snippet into a unique, high-quality Bangla news report.
          
          SOURCE TITLE: "${item.title}"
          SOURCE CONTENT: "${item.contentSnippet || item.content}"

          RULES:
          1. DO NOT translate word-for-word. You MUST rewrite in your own words.
          2. EXPAND the content. If the source is short, add context, background info, or explain why this is important (using your knowledge).
          3. Structure: 
             - Strong Headline (Bangla)
             - engaging Intro
             - Detailed Body Paragraphs
             - Conclusion/Summary
          4. Tone: Professional, Neutral, Journalistic.
          5. OUTPUT FORMAT: JSON ONLY. No markdown, no conversation.
          
          JSON TEMPLATE:
          {"headline": "...", "body": "...", "category": "..."}
        `;

        await sleep(3000);

        let aiText = await generateWithGemini(prompt);
        let finalData = {};

        if (aiText) {
          try {
            // Clean up markdown code blocks
            let cleanText = aiText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();

            // Extract JSON object if there's extra text
            const firstOpen = cleanText.indexOf('{');
            const lastClose = cleanText.lastIndexOf('}');

            if (firstOpen !== -1 && lastClose !== -1) {
              cleanText = cleanText.substring(firstOpen, lastClose + 1);
            }

            finalData = JSON.parse(cleanText);
          } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback but try to avoid saving raw AI debug text
            finalData = {
              headline: item.title,
              body: item.contentSnippet || item.content || "বিস্তারিত লিংকে...",
              category: "General"
            };
          }
        } else {
          finalData = {
            headline: item.title,
            body: item.contentSnippet || "বিস্তারিত লিংকে...",
            category: "Auto-Imported"
          };
        }

        // Quality Check: Don't save if content is too short or is just the fallback
        if (!finalData.body || finalData.body.length < 100 || finalData.body.includes("বিস্তারিত লিংকে")) {
          console.warn(`⚠️ Skipping low-quality article: ${item.title}`);
          continue;
        }

        // ডাটাবেসে সেভ (আপডেট: লেখকের নাম News Desk)
        const docRef = await addDoc(collection(db, "articles"), {
          title: finalData.headline || item.title,
          content: finalData.body || "বিস্তারিত জানা যায়নি।",
          category: finalData.category || "General",
          imageUrl: imageUrl,
          imageUrls: [imageUrl], // মাল্টিপল ইমেজের জন্য অ্যারে
          originalLink: item.link,
          source: feed.title || "Unknown Source",
          publishedAt: new Date().toISOString(),
          status: "published",
          authorName: "News Desk", // 🔥 AI = News Desk
          authorRole: "ai",
          isPinned: false
        });

        console.log(`✅ প্রকাশিত: ${finalData.headline}`);
        results.push({ id: docRef.id, title: finalData.headline });
        publishedCount++;
      }
    } catch (error) {
      console.error(`❌ ফিড সমস্যা`);
    }
  }
  return results;
}