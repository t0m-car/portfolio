import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getNowPlaying();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=20, stale-while-revalidate=30",
    },
  });
}
