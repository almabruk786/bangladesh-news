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

  const q = query(
    collection(db, "articles"),
    where("category", "in", searchTags),
    orderBy("publishedAt", "desc")
  );

  try {
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      // Convert timestamps to serializable format (milliseconds)
      return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt?.seconds ? data.publishedAt.seconds * 1000 : Date.now(),
        hidden: data.hidden,
      } as any;
    }).filter((article: any) => !article.hidden);
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
