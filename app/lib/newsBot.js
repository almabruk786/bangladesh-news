import Parser from 'rss-parser';
import { db } from './firebase'; 
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// AdSense এর জন্য লিমিট (প্রতি ক্লিকে ৩টি খবর)
const MAX_NEWS_LIMIT = 3;

// আপনার অ্যাকাউন্টে সাপোর্টেড মডেলের সঠিক তালিকা (Debug থেকে প্রাপ্ত)
const MODELS = [
  "gemini-2.0-flash",       // এটি আপনার জন্য সেরা এবং ফাস্ট
  "gemini-2.0-flash-lite",  // লাইটওয়েট ব্যাকআপ
  "gemini-1.5-flash"        // ফলব্যাক
];

async function generateWithGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  for (const modelName of MODELS) {
    try {
      // URL এ সঠিক মডেলের নাম বসানো হচ্ছে
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;

    } catch (error) {
      console.warn(`⚠️ [${modelName}] কাজ করেনি, পরেরটি দেখছি...`);
      await sleep(1000); 
    }
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
  console.log(`🤖 নিউজ বট কাজ শুরু করেছে (Correct Models)...`);
  let results = [];
  let publishedCount = 0;

  for (const feedUrl of RSS_FEEDS) {
    if (publishedCount >= MAX_NEWS_LIMIT) break;

    try {
      console.log(`📡 ফিড চেক করা হচ্ছে: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      
      for (const item of feed.items.slice(0, 5)) {
        if (publishedCount >= MAX_NEWS_LIMIT) break;

        const q = query(collection(db, "articles"), where("originalLink", "==", item.link));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          continue;
        }

        console.log(`📝 প্রসেসিং: ${item.title}`);

        const prompt = `
          You are a professional Bangladeshi Senior Journalist. 
          Task: Rewrite the following news summary into standard, engaging Bangla.
          Input Title: "${item.title}"
          Input Content: "${item.contentSnippet || item.content || item.title}"
          
          Output MUST be valid JSON only. No markdown.
          Format: {"headline": "...", "body": "...", "category": "..."}
          
          Requirements:
          1. 'headline': A catchy, click-worthy Bangla headline.
          2. 'body': A detailed 3-paragraph article in Bangla.
          3. 'category': Choose one (Politics, Sports, Technology, Bangladesh, International).
        `;

        await sleep(3000); 

        let aiText = await generateWithGemini(prompt);
        let finalData = {};

        if (aiText) {
            try {
               aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
               finalData = JSON.parse(aiText);
               console.log(`✨ AI সফল: ${finalData.headline}`);
            } catch (e) {
               console.error("JSON Parse Error, using text");
               finalData = { headline: item.title, body: aiText, category: "General" };
            }
        } else {
            console.log("🔸 AI ব্যর্থ, অরিজিনাল খবর সেভ হচ্ছে...");
            finalData = {
               headline: item.title,
               body: item.contentSnippet || item.content || "বিস্তারিত লিংকে...",
               category: "Auto-Imported"
            };
        }

        const docRef = await addDoc(collection(db, "articles"), {
          title: finalData.headline || item.title,
          content: finalData.body || "বিস্তারিত জানা যায়নি।",
          category: finalData.category || "General",
          originalLink: item.link,
          source: feed.title || "Unknown Source",
          publishedAt: new Date().toISOString(),
          status: "published"
        });

        console.log(`✅ প্রকাশিত: ${finalData.headline}`);
        results.push({ id: docRef.id, title: finalData.headline });
        publishedCount++;
      }
    } catch (error) {
      console.error(`❌ ফিড সমস্যা (${feedUrl})`);
    }
  }
  return results;
}