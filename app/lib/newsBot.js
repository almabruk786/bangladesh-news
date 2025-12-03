import Parser from 'rss-parser';
import { db } from './firebase'; 
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// ১. কাস্টম ফিল্ড যোগ করছি যাতে লুকানো ছবিগুলোও খুঁজে পায়
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'], // অনেক সাইট এখানে ছবি রাখে
    ],
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_NEWS_LIMIT = 3; // প্রতি ক্লিকে ৩টি খবর

// ডিফল্ট ছবি (যদি কোনোভাবেই ছবি না পাওয়া যায়)
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop";

const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];

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
    } catch (error) {
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
  console.log(`🤖 নিউজ রোবট (with Original Images) কাজ শুরু করেছে...`);
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

        console.log(`📝 প্রসেসিং: ${item.title}`);

        // 🔥 ছবি খোঁজার লজিক (৪টি স্তরে চেক করা হবে) 🔥
        let imageUrl = DEFAULT_IMAGE;
        
        // ধাপ ১: এনক্লোজার (সবচেয়ে কমন)
        if (item.enclosure && item.enclosure.url) {
            imageUrl = item.enclosure.url;
        } 
        // ধাপ ২: মিডিয়া কন্টেন্ট (BBC তে থাকে)
        else if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
            imageUrl = item.mediaContent.$.url;
        }
        // ধাপ ৩: থাম্বনেইল
        else if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
            imageUrl = item.mediaThumbnail.$.url;
        }
        // ধাপ ৪: কন্টেন্টের ভেতর থেকে ইমেজ খুঁজে বের করা (Regex দিয়ে)
        // এটি প্রথম আলো বা জাগো নিউজের জন্য খুবই কার্যকর
        else {
            const htmlContent = item['content:encoded'] || item.content || item.description || "";
            const imgMatch = htmlContent.match(/src="([^"]+)"/);
            if (imgMatch && imgMatch[1]) {
                imageUrl = imgMatch[1];
            }
        }

        // AI এর জন্য প্রম্পট
        const prompt = `
          Act as a professional Senior Journalist.
          Rewrite this news into standard Bangla.
          Original Title: "${item.title}"
          Original Content: "${item.contentSnippet || item.content || item.title}"
          
          Output Valid JSON Only:
          {"headline": "...", "body": "...", "category": "..."}
        `;

        await sleep(3000); 

        let aiText = await generateWithGemini(prompt);
        let finalData = {};

        if (aiText) {
            try {
               aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
               finalData = JSON.parse(aiText);
            } catch (e) {
               finalData = { headline: item.title, body: aiText, category: "General" };
            }
        } else {
            console.log("🔸 AI স্কিপ, ব্যাকআপ মোড...");
            finalData = {
               headline: item.title,
               body: item.contentSnippet || item.content || "বিস্তারিত লিংকে...",
               category: "Auto-Imported"
            };
        }

        // ডাটাবেসে সেভ (ছবির লিংক সহ)
        const docRef = await addDoc(collection(db, "articles"), {
          title: finalData.headline || item.title,
          content: finalData.body || "বিস্তারিত জানা যায়নি।",
          category: finalData.category || "General",
          imageUrl: imageUrl, // ✅ আসল ছবির লিংক সেভ হলো
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
      console.error(`❌ ফিড সমস্যা (${feedUrl}): ${error.message}`);
    }
  }
  return results;
}