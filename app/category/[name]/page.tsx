import CategoryClient from "./CategoryClient";

import { adminDb } from "../../lib/firebaseAdmin";
import { getCategories } from "../../lib/firebaseServer";

// Helper to fetch news on the server
async function getCategoryNews(categoryName: string) {
  // Fetch dynamic categories to resolve English/Bangla names
  const allCategories = await getCategories();

  const decodedName = decodeURIComponent(categoryName).trim();

  // Find matching category to get both English and Bangla tags
  const catMatch = allCategories.find((c: any) =>
    c.name.toLowerCase() === decodedName.toLowerCase() ||
    c.bn === decodedName
  );

  let searchTags = [decodedName];
  if (catMatch) {
    // @ts-ignore
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

  if (!adminDb) return [];

  try {
    const articlesRef = adminDb.collection("articles");

    // 1. Primary Query
    // Firebase Admin 'in' query supports up to 10 items. searchTags should be small.
    const q1 = articlesRef
      .where("category", "in", searchTags.slice(0, 10))
      .orderBy("publishedAt", "desc")
      .limit(50)
      .get();

    // 2. Secondary Query (Multi-Category Array)
    const q2 = articlesRef
      .where("categories", "array-contains-any", searchTags.slice(0, 10))
      .limit(50)
      .get();

    const [snap1, snap2] = await Promise.all([q1, q2]);

    // Merge and deduplicate
    const allDocs = new Map();

    const processDoc = (doc: any) => {
      const data = doc.data();
      allDocs.set(doc.id, {
        id: doc.id,
        ...data,
        publishedAt: (data.publishedAt && data.publishedAt.toDate) ? data.publishedAt.toDate().toISOString() : data.publishedAt,
        updatedAt: (data.updatedAt && data.updatedAt.toDate) ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      });
    };

    snap1.docs.forEach(processDoc);
    snap2.docs.forEach(processDoc);

    // Convert to array and Sort by Date Descending
    return Array.from(allDocs.values())
      .filter((article: any) => !article.hidden && article.status === 'published')
      .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

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
  },
  "Bangladesh": {
    title: "Bangladesh News Today | Breaking BD News, জাতীয় সংবাদ",
    description: "Latest Bangladesh news today. Breaking headlines, জাতীয় সংবাদ, government updates, and national affairs. Your trusted source for BD news 24/7.",
    keywords: ["Bangladesh News", "BD News", "জাতীয় সংবাদ", "Bangladesh News Today", "Breaking News BD", "National News Bangladesh", "Dhaka News"]
  },
  "National": {
    title: "National News Bangladesh | জাতীয় সংবাদ | Government & Public Affairs",
    description: "Comprehensive national news coverage from Bangladesh. জাতীয় সংবাদ, government policies, parliament updates, and public sector news.",
    keywords: ["National News BD", "জাতীয়", "Government News", "Parliament Bangladesh", "সরকারি", "Public Affairs BD"]
  },
  "Opinion": {
    title: "Opinion & Editorial Bangladesh | মতামত | Analysis & Commentary",
    description: "Read expert opinions and editorials on Bangladesh affairs. In-depth analysis, মতামত, commentary from leading columnists and thought leaders.",
    keywords: ["Opinion Bangladesh", "Editorial BD", "মতামত", "Analysis", "Commentary", "Column", "Expert Opinion BD"]
  },
  "Health": {
    title: "Health News Bangladesh | Medical Updates, স্বাস্থ্য টিপস & COVID-19",
    description: "Latest health news from Bangladesh. স্বাস্থ্য tips, medical updates, coronavirus news, hospital information, and wellness advice.",
    keywords: ["Health News BD", "স্বাস্থ্য", "Medical Bangladesh", "Coronavirus BD", "COVID-19 Bangladesh", "Hospital News", "Health Tips Bangla"]
  },
  "Education": {
    title: "Education News Bangladesh | শিক্ষা | HSC SSC Results, Admission & Jobs",
    description: "Breaking education news from Bangladesh. শিক্ষা updates, HSC SSC results, university admission, exam schedules, and job circulars.",
    keywords: ["Education News BD", "শিক্ষা", "HSC Result", "SSC Result", "University Admission", "Job Circular", "Exam Bangladesh", "শিক্ষা সংবাদ"]
  }
};

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  // Normalize category name for lookup (First letter uppercase)
  let normalizedName = decodedName.charAt(0).toUpperCase() + decodedName.slice(1).toLowerCase();

  // Try to find English name if input is Bangla
  try {
    const allCats = await getCategories();
    const match = allCats.find((c: any) => c.bn === decodedName || c.name.toLowerCase() === decodedName.toLowerCase());
    if (match && match.name) {
      normalizedName = match.name; // Use English name for SEO lookup
    }
  } catch (e) { }

  const seoInfo = SEO_DATA[normalizedName] || {
    title: `${decodedName} News Bangladesh | Latest Updates & Headlines`,
    description: `Read the latest ${decodedName} news from Bangladesh. Breaking headlines, in-depth analysis, and updates on ${decodedName} topics. Trusted source.`,
    keywords: [`${decodedName} News`, "Bangladesh News", "Latest Updates", "Bakalia News"]
  };

  return {
    title: `${seoInfo.title} | Bakalia News`,
    description: seoInfo.description,
    keywords: seoInfo.keywords,
    alternates: {
      canonical: `https://bakalia.xyz/category/${normalizedName}`,
    },
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
