import { NextRequest, NextResponse } from "next/server";
import { saveShare } from "@/lib/shares";
import type { AnalyzeResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { title?: unknown; payload?: unknown };
  const payload = body.payload as AnalyzeResult | undefined;
  if (!payload || !Array.isArray(payload.hooks)) {
    return NextResponse.json({ error: "Missing campaign payload." }, { status: 400 });
  }
  const slug = await saveShare(payload, {
    title: typeof body.title === "string" ? body.title : undefined,
  });
  if (!slug) {
    return NextResponse.json({ error: "Could not publish — is Supabase configured?" }, { status: 503 });
  }
  const url = `${req.nextUrl.origin}/s/${slug}`;
  return NextResponse.json({ url, slug });
}
