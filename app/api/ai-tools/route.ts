import { NextRequest, NextResponse } from "next/server";
import {
  allocateBudget,
  brainstormAngles,
  buildPersona,
  exportForPlatform,
  explainHook,
  generateContentCalendar,
  generateEmailSeries,
  generateLandingPage,
  generateSEOMeta,
  improveHook,
  mineVoiceOfCustomer,
  trainBrandVoice,
} from "@/lib/aitools";
import { hasAi } from "@/lib/ai";
import type { Hook, ImproveMode } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODES: ImproveMode[] = ["stronger", "shorter", "curious", "urgent"];

export async function POST(req: NextRequest) {
  if (!hasAi()) {
    return NextResponse.json({ error: "No AI provider configured." }, { status: 503 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const tool = body.tool;

  try {
    switch (tool) {
      case "improve": {
        const hook = body.hook as Hook | undefined;
        const mode = MODES.includes(body.mode as ImproveMode) ? (body.mode as ImproveMode) : "stronger";
        const formula = typeof body.formula === "string" ? (body.formula as "aida" | "pas" | "bab" | "4ps") : undefined;
        if (!hook || typeof hook.text !== "string") {
          return NextResponse.json({ error: "Missing hook." }, { status: 400 });
        }
        const out = await improveHook(hook, mode, formula);
        return NextResponse.json(out);
      }
      case "explain": {
        const hook = body.hook as Hook | undefined;
        const audience = typeof body.audience === "string" ? body.audience : "";
        if (!hook || typeof hook.text !== "string") {
          return NextResponse.json({ error: "Missing hook." }, { status: 400 });
        }
        const out = await explainHook(hook, audience);
        return NextResponse.json(out);
      }
      case "voc": {
        const reviews = typeof body.reviews === "string" ? body.reviews : "";
        if (!reviews.trim()) {
          return NextResponse.json({ error: "Paste some customer reviews first." }, { status: 400 });
        }
        const out = await mineVoiceOfCustomer(reviews);
        return NextResponse.json(out);
      }
      case "email-series": {
        const result = body.result as { topic: string; audience?: string; goal?: string; usp?: { positioningStatement?: string }; hooks?: Hook[] } | undefined;
        const count = Math.min(Math.max(Number(body.count) || 4, 2), 6);
        if (!result || typeof result.topic !== "string") {
          return NextResponse.json({ error: "Missing analysis result." }, { status: 400 });
        }
        const out = await generateEmailSeries(result as never, count);
        return NextResponse.json(out);
      }
      case "calendar": {
        const result = body.result as { topic: string; audience?: string; goal?: string; hooks?: Hook[] } | undefined;
        const days = Math.min(Math.max(Number(body.days) || 14, 7), 30);
        if (!result || typeof result.topic !== "string") {
          return NextResponse.json({ error: "Missing analysis result." }, { status: 400 });
        }
        const out = await generateContentCalendar(result as never, days);
        return NextResponse.json(out);
      }
      case "angles": {
        const topic = typeof body.topic === "string" ? body.topic : "";
        const audience = typeof body.audience === "string" ? body.audience : "";
        const goal = typeof body.goal === "string" ? body.goal : "";
        const formula = typeof body.formula === "string" ? (body.formula as "aida" | "pas" | "bab" | "4ps") : undefined;
        const existing = Array.isArray(body.existing)
          ? (body.existing as unknown[]).filter((x) => typeof x === "string").map(String).slice(0, 12)
          : [];
        if (!topic.trim()) {
          return NextResponse.json({ error: "Missing topic." }, { status: 400 });
        }
        const out = await brainstormAngles(topic, audience, goal, existing, formula);
        return NextResponse.json(out);
      }
      case "landing": {
        const result = body.result as { topic: string; audience?: string; goal?: string; usp?: { positioningStatement?: string; elevatorPitch?: string }; hooks?: Hook[] } | undefined;
        const sections = Math.min(Math.max(Number(body.sections) || 5, 3), 8);
        if (!result || typeof result.topic !== "string") {
          return NextResponse.json({ error: "Missing analysis result." }, { status: 400 });
        }
        const out = await generateLandingPage(result as never, sections);
        return NextResponse.json(out);
      }
      case "persona": {
        const topic = typeof body.topic === "string" ? body.topic : "";
        const audience = typeof body.audience === "string" ? body.audience : "";
        if (!topic.trim()) {
          return NextResponse.json({ error: "Missing topic." }, { status: 400 });
        }
        const out = await buildPersona(topic, audience);
        return NextResponse.json(out);
      }
      case "seo": {
        const topic = typeof body.topic === "string" ? body.topic : "";
        const audience = typeof body.audience === "string" ? body.audience : "";
        const bestHook = typeof body.bestHook === "string" ? body.bestHook : topic;
        if (!topic.trim()) {
          return NextResponse.json({ error: "Missing topic." }, { status: 400 });
        }
        const out = await generateSEOMeta(topic, audience, bestHook);
        return NextResponse.json(out);
      }
      case "budget": {
        const result = body.result as { topic: string; audience?: string; goal?: string; hooks?: Hook[] } | undefined;
        const totalBudget = typeof body.totalBudget === "number" ? body.totalBudget : 1000;
        if (!result || typeof result.topic !== "string") {
          return NextResponse.json({ error: "Missing analysis result." }, { status: 400 });
        }
        const out = await allocateBudget(result as never, totalBudget);
        return NextResponse.json(out);
      }
      case "brand": {
        const samples = typeof body.samples === "string" ? body.samples : "";
        if (!samples.trim()) {
          return NextResponse.json({ error: "Paste brand voice samples first." }, { status: 400 });
        }
        const out = await trainBrandVoice(samples);
        return NextResponse.json(out);
      }
      case "export": {
        const result = body.result as { topic: string; audience?: string; goal?: string; hooks?: Hook[]; usp?: { positioningStatement?: string; elevatorPitch?: string; differentiators?: string[] } } | undefined;
        const platform = typeof body.platform === "string" ? (body.platform as "google-ads" | "meta" | "mailchimp" | "linkedin") : "google-ads";
        if (!result || typeof result.topic !== "string") {
          return NextResponse.json({ error: "Missing analysis result." }, { status: 400 });
        }
        const out = exportForPlatform(result as never, platform);
        return NextResponse.json(out);
      }
      default:
        return NextResponse.json({ error: "Unknown tool." }, { status: 400 });
    }
  } catch (e) {
    console.error(`[ai-tools] ${tool} failed:`, e);
    return NextResponse.json({ error: "AI tool failed. Try again." }, { status: 502 });
  }
}
