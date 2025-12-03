import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // ১. চেক করি চাবি আছে কিনা
  if (!apiKey) {
    return NextResponse.json({ error: "API Key পাওয়া যায়নি! .env.local চেক করুন।" });
  }

  // ২. গুগলকে জিজ্ঞেস করি: "এই চাবি দিয়ে আমি কী কী মডেল ব্যবহার করতে পারব?"
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json({
      status: response.status, // 200 মানে সব ঠিক আছে
      key_preview: `${apiKey.substring(0, 8)}...*****`, // চাবির প্রথম কিছু অংশ
      available_models: data.models ? data.models.map(m => m.name) : "No models found",
      full_response: data
    });

  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}