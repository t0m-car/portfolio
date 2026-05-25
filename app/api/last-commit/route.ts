import { NextResponse } from "next/server";
import { getLatestPublicCommit } from "@/lib/github";

export async function GET() {
  const data = await getLatestPublicCommit();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
