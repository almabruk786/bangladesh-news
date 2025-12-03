// আপডেট: ../../lib মানে ২ ঘর পেছনে (app ফোল্ডারে)
import { db } from '../../lib/firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("🔥 টেস্টিং শুরু...");
    
    // ডাটাবেসে একটি টেস্ট খবর পাঠানো হচ্ছে
    const docRef = await addDoc(collection(db, "articles"), {
      title: "Test News - হ্যালো বাংলাদেশ",
      content: "এটি একটি টেস্ট নিউজ। যদি এটি দেখতে পান তার মানে ডাটাবেস ১০০% ঠিক আছে।",
      category: "Test",
      originalLink: "http://test.com",
      source: "System Test",
      publishedAt: new Date().toISOString(),
      status: "published"
    });

    console.log("✅ সফল! আইডি:", docRef.id);

    return NextResponse.json({ 
      success: true, 
      message: "ডাটাবেস কানেকশন সফল! একটি টেস্ট খবর যোগ করা হয়েছে।",
      id: docRef.id 
    });

  } catch (error) {
    console.error("❌ সমস্যা:", error);
    return NextResponse.json({ 
      success: false, 
      error: "ডাটাবেসে সমস্যা হচ্ছে।",
      details: error.message 
    }, { status: 500 });
  }
}