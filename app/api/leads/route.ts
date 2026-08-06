import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";
import { rateLimited } from "@/lib/ratelimit";
import { trackEventForCurrentUser } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimited(req);
  if (limited) return limited;
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    shareSlug?: unknown;
    name?: unknown;
    email?: unknown;
    company?: unknown;
    message?: unknown;
  };
  const shareSlug = typeof body.shareSlug === "string" ? body.shareSlug.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 120) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";

  if (!shareSlug || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: share } = await supabase
    .from("shares")
    .select("id,user_id")
    .eq("slug", shareSlug)
    .maybeSingle();

  if (!share) {
    return NextResponse.json({ error: "Share not found." }, { status: 404 });
  }

  const { error } = await supabase.from("leads").insert({
    share_id: share.id,
    user_id: share.user_id ?? null,
    name: name || null,
    email,
    company: company || null,
    message: message || null,
  });
  if (error) {
    return NextResponse.json({ error: "Could not save lead." }, { status: 500 });
  }

  // Count each lead as engagement on the share.
  const { error: trackError } = await supabase.rpc("increment_share_stat", {
    slug_text: shareSlug,
    is_view: false,
  });
  if (trackError) {
    console.error("Share engagement count failed (non-fatal)", trackError);
  }

  await trackEventForCurrentUser("lead_captured", { shareSlug, company: company || undefined });

  return NextResponse.json({ ok: true });
}