import { NextRequest, NextResponse } from "next/server";
import { generateAiResult, hasAi } from "@/lib/ai";
import { generateResult } from "@/lib/engine";
import type { AnalyzeInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: AnalyzeInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const topic = (body.topic || "").trim();
  if (!topic) {
    return NextResponse.json({ error: "Please enter a topic." }, { status: 400 });
  }
  if (topic.length > 120) {
    return NextResponse.json({ error: "Topic is too long (max 120 chars)." }, { status: 400 });
  }
  const competitors = (body.competitorHooks || []).map((c) => c.trim()).filter(Boolean).slice(0, 6);

  const input: AnalyzeInput = {
    topic,
    audience: body.audience?.trim(),
    goal: body.goal?.trim(),
    competitorHooks: competitors,
    channel: body.channel,
    count: Math.min(body.count || 3, 5),
  };

  const result = hasAi() ? await generateAiResult(input) : generateResult(input);
  return NextResponse.json(result);
}
