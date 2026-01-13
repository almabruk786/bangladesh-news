import { NextResponse } from "next/server";
import { clearCache } from "../../../lib/firebaseServer";

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") || "categories";

        clearCache(type);

        return NextResponse.json({ success: true, message: `Cache cleared for ${type}` });
    } catch (error) {
        console.error("Error clearing cache:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
