import { fetchAndProcessNews } from '../../lib/newsBot';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
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

  // Create a transform stream for logging
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Helper to send logs
  const sendLog = async (msg, type = "info") => {
    try {
      // Format: JSON chunk per line
      const data = JSON.stringify({ msg, type }) + "\n";
      await writer.write(encoder.encode(data));
    } catch (e) {
      console.error("Stream Write Error:", e);
    }
  };

  // Start processing in the background (dont await it blocking the return)
  (async () => {
    try {
      await sendLog("Initializing System...", "info");
      const processed = await fetchAndProcessNews(sendLog);
      await sendLog(`Process Complete. ${processed.length} articles added.`, "success");

      // Send final success marker
      await writer.write(encoder.encode(JSON.stringify({ success: true, processed }) + "\n"));
    } catch (error) {
      console.error("Cron Process Error:", error);
      await sendLog(`Critical Error: ${error.message}`, "error");
    } finally {
      await writer.close();
    }
  })();

  // Return the stream immediately
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}