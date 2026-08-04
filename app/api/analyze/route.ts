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
  const rawCompetitors = Array.isArray(body.competitorHooks)
    ? body.competitorHooks
    : typeof body.competitorHooks === "string"
      ? body.competitorHooks.split("\n")
      : [];
  const competitors = rawCompetitors.map((c: string) => c.trim()).filter(Boolean).slice(0, 6);

  const input: AnalyzeInput = {
    topic,
    audience: body.audience?.trim(),
    goal: body.goal?.trim(),
    competitorHooks: competitors,
    channel: body.channel,
    count: Math.min(body.count || 3, 5),
    variation: Math.max(0, Number(body.variation) || 0),
    avoidPsych: Array.isArray(body.avoidPsych) ? body.avoidPsych.slice(0, 6) : undefined,
    voiceSamples: Array.isArray(body.voiceSamples)
      ? body.voiceSamples.map((s: string) => s.trim()).filter(Boolean).slice(0, 4)
      : typeof body.voiceSamples === "string"
        ? body.voiceSamples.split("\n").map((s: string) => s.trim()).filter(Boolean).slice(0, 4)
        : undefined,
    language: typeof body.language === "string" && body.language ? body.language : undefined,
    debug: Boolean(body.debug),
  };

  if (!hasAi()) {
    return NextResponse.json(generateResult(input));
  }
  try {
    const result = await generateAiResult(input);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[analyze] generateAiResult failed:", e);
    return NextResponse.json(generateResult(input));
  }
}
