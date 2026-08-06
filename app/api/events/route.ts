import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";
import { rateLimited } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimited(req);
  if (limited) return limited;
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    name?: unknown;
    props?: unknown;
    attribution?: Record<string, unknown>;
  };
  const name = typeof body.name === "string" ? body.name.slice(0, 80) : "";
  if (!name) {
    return NextResponse.json({ error: "Event name is required." }, { status: 400 });
  }

  const props =
    body.props && typeof body.props === "object" ? (body.props as Record<string, unknown>) : {};
  const attr =
    body.attribution && typeof body.attribution === "object"
      ? (body.attribution as Record<string, unknown>)
      : {};

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("events").insert({
    name,
    props: { ...attr, ...props },
    user_id: user?.id || null,
  });
  if (error) {
    return NextResponse.json({ error: "Could not record event." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}