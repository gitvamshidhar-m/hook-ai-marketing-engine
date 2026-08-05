import { NextRequest, NextResponse } from "next/server";
import { generateAiAdCopy, hasAi } from "@/lib/ai";
import { rateLimited } from "@/lib/ratelimit";
import type { AnalyzeResult, Channel } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimited(req);
  if (limited) return limited;

  if (!hasAi()) {
    return NextResponse.json({ error: "No AI provider configured." }, { status: 503 });
  }
  let body: { result?: AnalyzeResult; channel?: Channel };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.result || !body.result.topic) {
    return NextResponse.json({ error: "Missing analysis result." }, { status: 400 });
  }
  const channel: Channel = body.channel === "ad" || body.channel === "email" || body.channel === "youtube" || body.channel === "blog"
    ? body.channel
    : "ad";
  try {
    const { copies, model } = await generateAiAdCopy(body.result, channel);
    return NextResponse.json({ copies, model });
  } catch (e) {
    console.error("Ad copy generation failed", e);
    return NextResponse.json({ error: "Ad copy generation failed. Try again." }, { status: 502 });
  }
}
