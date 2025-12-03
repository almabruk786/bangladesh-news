// এখন lib ফোল্ডার app এর ভেতরে, তাই ২ ঘর পেছনে গেলেই হবে
import { fetchAndProcessNews } from '../../lib/newsBot';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const authHeader = request.headers.get('authorization');
    const SECRET = process.env.CRON_SECRET;

    if (key !== SECRET && authHeader !== `Bearer ${SECRET}`) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized: ভুল চাবি!' 
      }, { status: 401 });
    }

    const processed = await fetchAndProcessNews();
    
    return NextResponse.json({ 
      success: true, 
      message: `কাজ শেষ! ${processed.length} টি খবর যোগ হয়েছে।`,
      processed 
    });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}