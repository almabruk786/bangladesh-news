// এই ফাইলটি চালাতে টার্মিনালে লিখবে: node scripts/get_news.js

const Parser = require('rss-parser');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs } = require('firebase/firestore');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' }); // গোপন চাবি পড়ার জন্য

// ১. কনফিগারেশন
const parser = new Parser();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ফায়ারবেস সেটআপ ( ম্যানুয়ালি আবার কনফিগ দিচ্ছি যাতে স্ক্রিপ্ট সহজে চলে)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ২. বাংলাদেশের খবরের সোর্স (RSS Feeds)
const RSS_FEEDS = [
  "https://bdnews24.com/?widgetName=rssfeed&widgetId=1150", // বিডিনিউজ ২৪ ইংরেজি (আমরা বাংলা করব)
  // তুমি চাইলে আরও লিঙ্ক যোগ করতে পারো
];

async function fetchAndRewriteNews() {
  console.log("🚀 রোবট খবর খোঁজা শুরু করছে...");

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      
      // লুপ চালিয়ে প্রথম ২টা খবর নিব (বেশি নিলে টাকা কাটবে OpenAI তে)
      for (const item of feed.items.slice(0, 2)) {
        
        // চেক করি এই খবরটা আগে নিয়েছি কিনা
        const q = query(collection(db, "articles"), where("originalLink", "==", item.link));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          console.log(`⚠️ খবরটি আগেই আছে: ${item.title}`);
          continue;
        }

        console.log(`📝 নতুন খবর পেয়েছি, rewriting: ${item.title}`);

        // ৩. OpenAI কে দিয়ে বাংলায় লেখানো
        const completion = await openai.chat.completions.create({
          messages: [{ 
            role: "system", 
            content: "You are a professional Bangladeshi Senior Journalist. I will give you a news summary. You will rewrite it in standard, engaging Bengali (Bangla). Give a catchy Headline in Bangla and a 3-paragraph article." 
          },
          {
            role: "user",
            content: `Original Title: ${item.title}. Summary: ${item.contentSnippet || item.content}`
          }],
          model: "gpt-3.5-turbo",
        });

        const aiContent = completion.choices[0].message.content;

        // ৪. ডাটাবেসে সেভ করা
        await addDoc(collection(db, "articles"), {
          title: item.title, // এটা ইংরেজির টাইটেল থাকুক রেফারেন্সের জন্য
          banglaContent: aiContent, // এটাই আসল কন্টেন্ট
          originalLink: item.link,
          source: feed.title,
          publishedAt: new Date(),
          category: "Bangladesh"
        });

        console.log("✅ খবরটি ডাটাবেসে জমা হয়েছে!");
      }
    } catch (error) {
      console.error("ভুল হয়েছে:", error);
    }
  }
}

fetchAndRewriteNews();