import Parser from 'rss-parser';
import { db } from './firebase'; 
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// AdSense এর জন্য লিমিট: প্রতিবার মাত্র ৩টি খবর পাবলিশ হবে
const MAX_NEWS_LIMIT = 3;

const MODELS = [
  "gemini-1.5-flash",        
  "gemini-1.5-flash-latest", 
  "gemini-pro"               
];

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

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

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
  console.log(`🤖 নিউজ রোবট কাজ শুরু করেছে (লিমিট: ${MAX_NEWS_LIMIT} টি)...`);
  let results = [];
  let publishedCount = 0; // কয়টি খবর পাবলিশ হলো তার হিসাব

  // সব ফিড চেক করা শুরু
  for (const feedUrl of RSS_FEEDS) {
    
    // যদি লিমিট পূর্ণ হয়ে যায়, তবে লুপ ভেঙে বেরিয়ে যাবে
    if (publishedCount >= MAX_NEWS_LIMIT) {
      console.log("🛑 লিমিট শেষ! রোবট এখন বিশ্রাম নিচ্ছে।");
      break; 
    }

    try {
      console.log(`📡 ফিড চেক করা হচ্ছে: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      
      for (const item of feed.items.slice(0, 5)) {
        
        // আবার চেক: লুপের ভেতরেও যদি লিমিট পার হয়ে যায়
        if (publishedCount >= MAX_NEWS_LIMIT) break;

        const q = query(collection(db, "articles"), where("originalLink", "==", item.link));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // স্কিপ করলে লগ দেখানোর দরকার নেই, কনসোল ক্লিন রাখছি
          continue;
        }

        console.log(`📝 প্রসেসিং (${publishedCount + 1}/${MAX_NEWS_LIMIT}): ${item.title}`);

        const prompt = `
          Act as a professional Senior Journalist for a Bangladeshi news portal.
          Task: Rewrite the provided news summary into high-quality, engaging Bangla.
          
          Input Title: "${item.title}"
          Input Content: "${item.contentSnippet || item.content || item.title}"
          
          Guidelines for AdSense Approval:
          1. **Unique Content:** Do not just translate. Add value, context, and a professional tone.
          2. **Structure:** Use a catchy headline and a well-structured 3-paragraph body.
          3. **Neutrality:** Maintain journalistic integrity.
          
          Output JSON Format (No Markdown):
          {"headline": "...", "body": "...", "category": "..."}
        `;

        await sleep(3000); // ৩ সেকেন্ড বিরতি (ন্যাচারাল আচরণের জন্য)

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
            console.log("🔸 AI স্কিপ, অরিজিনাল খবর ব্যাকআপ হিসেবে ব্যবহার হচ্ছে");
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
        
        // কাউন্টার বাড়ানো হলো
        publishedCount++;
      }
    } catch (error) {
      console.error(`❌ ফিড সমস্যা (${feedUrl})`);
    }
  }
  
  return results;
}