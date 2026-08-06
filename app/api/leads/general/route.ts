import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";
import { rateLimited } from "@/lib/ratelimit";
import { trackEventForCurrentUser } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimited(req);
  if (limited) return limited;
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: unknown;
    email?: unknown;
    company?: unknown;
    message?: unknown;
    source?: unknown;
  };
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 120) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";
  const source = typeof body.source === "string" ? body.source.trim().slice(0, 80) : "";

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("leads").insert({
    share_id: null,
    user_id: null,
    name: name || null,
    email,
    company: company || null,
    message: message || null,
  });
  if (error) {
    return NextResponse.json({ error: "Could not save lead." }, { status: 500 });
  }

  await trackEventForCurrentUser("lead_captured", {
    source: source || "site",
    company: company || undefined,
  });

  return NextResponse.json({ ok: true });
}