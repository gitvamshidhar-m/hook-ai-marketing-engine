import { NextRequest, NextResponse } from "next/server";
import { generateAiResult, hasAi } from "@/lib/ai";
import { generateResult } from "@/lib/engine";
import { spendCredit } from "@/lib/credits";
import { rateLimited } from "@/lib/ratelimit";
import { buildCampaignPlan } from "@/lib/campaign";
import type { AnalyzeInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimited(req);
  if (limited) return limited;

  let body: { budget?: number } & AnalyzeInput;
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
  };

  const result = hasAi() ? await generateAiResult(input).catch(() => generateResult(input)) : generateResult(input);
  const plan = buildCampaignPlan(result, { budget: Math.max(50, Number(body.budget) || 500) });

  const spent = await spendCredit();
  return NextResponse.json(spent.ok ? { ...result, plan, creditsRemaining: spent.remaining } : { ...result, plan });
}