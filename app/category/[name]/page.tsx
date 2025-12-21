import CategoryClient from "./CategoryClient";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

// Helper to fetch news on the server
// Helper to fetch news on the server
async function getCategoryNews(categoryName: string) {
  const categories = [
    { name: "Bangladesh", bn: "বাংলাদেশ" },
    { name: "Politics", bn: "রাজনীতি" },
    { name: "International", bn: "আন্তর্জাতিক" },
    { name: "Sports", bn: "খেলা" },
    { name: "Opinion", bn: "মতামত" },
    { name: "Business", bn: "বাণিজ্য" },
    { name: "Entertainment", bn: "বিনোদন" },
    { name: "Lifestyle", bn: "জীবনযাপন" },
    { name: "Technology", bn: "প্রযুক্তি" },
    { name: "Health", bn: "স্বাস্থ্য" },
    { name: "Education", bn: "শিক্ষা" },
    { name: "National", bn: "জাতীয়" },
  ];

  const decodedName = decodeURIComponent(categoryName).trim();

  // Find matching category to get both English and Bangla tags
  const catMatch = categories.find(c =>
    c.name.toLowerCase() === decodedName.toLowerCase() ||
    c.bn === decodedName
  );

  let searchTags = [decodedName];
  if (catMatch) {
    searchTags = [catMatch.name, catMatch.bn, catMatch.name.toUpperCase(), catMatch.name.toLowerCase()];
  } else {
    // If no match, try to add case variants of the decoded name itself
    searchTags.push(decodedName.toLowerCase());
    searchTags.push(decodedName.toUpperCase());
    searchTags.push(decodedName.charAt(0).toUpperCase() + decodedName.slice(1).toLowerCase());
  }

  // Deduplicate
  searchTags = [...new Set(searchTags)];
  if (!searchTags.includes(decodedName)) searchTags.push(decodedName);

  // 1. Primary Query (Legacy + Primary Category) - Uses existing Index
  const q1 = query(
    collection(db, "articles"),
    where("category", "in", searchTags),
    orderBy("publishedAt", "desc")
  );

  // 2. Secondary Query (Multi-Category Array) - No OrderBy to avoid missing index issues
  // We will merge and sort in memory.
  const q2 = query(
    collection(db, "articles"),
    where("categories", "array-contains-any", searchTags)
  );

  try {
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    // Merge and deduplicate
    const allDocs = new Map();

    [...snap1.docs, ...snap2.docs].forEach(doc => {
      allDocs.set(doc.id, {
        id: doc.id,
        ...doc.data(),
        publishedAt: (() => {
          const p = doc.data().publishedAt;
          if (p?.seconds) return p.seconds * 1000; // Firestore Timestamp
          if (typeof p === 'number') return p;      // Milliseconds
          if (typeof p === 'string') return new Date(p).getTime(); // ISO String
          return Date.now(); // Fallback
        })(),
      });
    });

    // Convert to array and Sort by Date Descending
    return Array.from(allDocs.values())
      .filter((article: any) => !article.hidden && article.status === 'published')
      .sort((a: any, b: any) => b.publishedAt - a.publishedAt);

  } catch (e) {
    console.error("Category Fetch Error:", e);
    return [];
  }
}

const SEO_DATA: Record<string, { title: string; description: string; keywords: string[] }> = {
  "Politics": {
    title: "Bangladesh Politics News | Election 2026, BNP, Awami League Updates",
    description: "Latest Bangladesh politics news: Analysis on Election 2026, Interim Government, BNP, and Awami League. Read in-depth political reports and breaking updates.",
    keywords: ["Bangladesh Politics", "Election 2026", "BNP", "Awami League", "Sheikh Hasina", "Interim Government", "Political News BD"]
  },
  "Sports": {
    title: "Bangladesh Sports News | Cricket, Football & BPL Live Scores",
    description: "Get the latest Bangladesh sports news. Live cricket scores, BPL updates, Tigers cricket team news, and Football headlines. Exclusive match reports.",
    keywords: ["Bangladesh Cricket", "BPL 2025", "Tigers Cricket", "Shakib Al Hasan", "Bangladesh Football", "Sports News BD", "Live Cricket Score"]
  },
  "International": {
    title: "World News Today | Global Politics, Middle East & International Affairs",
    description: "Stay updated with World News. Comprehensive coverage of global politics, Middle East crisis, US elections, and international relations impacting Bangladesh.",
    keywords: ["World News", "International News", "Global Politics", "Middle East Crisis", "US Politics", "Foreign Affairs", "World Updates"]
  },
  "Entertainment": {
    title: "Dhallywood Entertainment News | Shakib Khan, Cinema & Drama Updates",
    description: "Latest Dhallywood and Bangla entertainment news. Updates on Shakib Khan, Pori Moni, new Bangla cinema releases, and trending TV dramas.",
    keywords: ["Dhallywood News", "Bangla Cinema", "Shakib Khan", "Pori Moni", "Bangla Natok", "Entertainment News BD", "Celebrity Gossip"]
  },
  "Business": {
    title: "Bangladesh Business News | Economy, Remittance & Share Market",
    description: "Breaking Bangladesh business and economy news. Updates on Stock Market, Remittance, RMG sector, Inflation, and Banking sector analysis.",
    keywords: ["Bangladesh Economy", "Business News BD", "Remittance", "RMG Sector", "Dhaka Stock Exchange", "Inflation BD", "Banking News"]
  },
  "Technology": {
    title: "Tech News Bangladesh | Digital BD, Startups & Freelancing",
    description: "Latest Technology news from Bangladesh. Updates on Digital Bangladesh, Freelancing tips, Startups, and Gadget reviews.",
    keywords: ["Tech News BD", "Digital Bangladesh", "Freelancing BD", "Startup News", "Bangla Tech", "Gadget Review"]
  },
  "Lifestyle": {
    title: "Lifestyle News Bangladesh | Health, Fashion & Travel Tips",
    description: "Discover the best Lifestyle tips. Health advice, Fashion trends in Bangladesh, Travel guides, and Food recipes.",
    keywords: ["Lifestyle BD", "Health Tips Bangla", "Fashion BD", "Travel Bangladesh", "Food Recipes", "Wellness"]
  }
};

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  // Normalize category name for lookup (First letter uppercase)
  const normalizedName = decodedName.charAt(0).toUpperCase() + decodedName.slice(1).toLowerCase();

  const seoInfo = SEO_DATA[normalizedName] || {
    title: `${decodedName} News Bangladesh | Latest Updates & Headlines`,
    description: `Read the latest ${decodedName} news from Bangladesh. Breaking headlines, in-depth analysis, and updates on ${decodedName} topics. Trusted source.`,
    keywords: [`${decodedName} News`, "Bangladesh News", "Latest Updates", "Bakalia News"]
  };

  return {
    title: `${seoInfo.title} | Bakalia News`,
    description: seoInfo.description,
    keywords: seoInfo.keywords,
    openGraph: {
      title: `${seoInfo.title} | Bakalia News`,
      description: seoInfo.description,
      type: 'website',
      siteName: 'Bakalia News'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seoInfo.title} | Bakalia News`,
      description: seoInfo.description,
    }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const news = await getCategoryNews(name);

  return <CategoryClient name={name} initialNews={news} />;
}
