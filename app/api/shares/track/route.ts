import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as { slug?: unknown; type?: unknown };
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const isView = body.type === "view";
  if (!slug || slug.length > 64) {
    return NextResponse.json({ error: "Missing or invalid slug." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("increment_share_stat", {
    slug_text: slug,
    is_view: isView,
  });
  if (error) {
    return NextResponse.json({ error: "Could not track." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}