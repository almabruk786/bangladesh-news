import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tag = searchParams.get("tag") || "news";

        // Revalidate Next.js cache
        revalidateTag(tag);

        return NextResponse.json({ success: true, message: `Cache revalidated for tag: ${tag}` });
    } catch (error) {
        console.error("Error clearing cache:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
