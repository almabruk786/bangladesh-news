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
    { name: "Education", bn: "শিক্ষা" }
  ];

  const decodedName = decodeURIComponent(categoryName);

  // Find matching category to get both English and Bangla tags
  const catMatch = categories.find(c =>
    c.name.toLowerCase() === decodedName.toLowerCase() ||
    c.bn === decodedName
  );

  const searchTags = catMatch ? [catMatch.name, catMatch.bn] : [decodedName];
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
        publishedAt: doc.data().publishedAt?.seconds ? doc.data().publishedAt.seconds * 1000 : Date.now(),
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

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  return {
    title: `${decodedName} খবর - সর্বশেষ আপডেট | বাকলিয়া নিউজ`,
    description: `${decodedName} সংক্রান্ত সর্বশেষ খবর, ছবি ও ভিডিও পড়ুন বাকলিয়া নিউজে। সত্য ও বস্তুনিষ্ঠ সংবাদের বিশ্বস্ত অনলাইন ঠিকানা।`,
    openGraph: {
      title: `${decodedName} খবর - বাকলিয়া নিউজ`,
      description: `${decodedName} সংক্রান্ত সর্বশেষ আপডেট।`,
    }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const news = await getCategoryNews(name);

  return <CategoryClient name={name} initialNews={news} />;
}
