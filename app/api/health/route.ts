import { NextResponse } from "next/server";
import { supabaseConfigured } from "@/lib/supabase";
import { hasAi } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    ai: hasAi(),
    supabase: supabaseConfigured,
    version: "1.0.0",
  };
  const ok = checks.ai && checks.supabase;
  return NextResponse.json(
    { status: ok ? "ok" : "degraded", checks, time: new Date().toISOString() },
    { status: ok ? 200 : 503 }
  );
}
