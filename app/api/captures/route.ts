import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";
import { rateLimited } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimited(req);
  if (limited) return limited;
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    email?: unknown;
    topic?: unknown;
  };
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 200) : "";

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Dedupe: a capture is only meaningful once per email.
  const { data: existing } = await supabase
    .from("captures")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (!existing) {
    const { error } = await supabase.from("captures").insert({
      email,
      topic: topic || null,
      user_id: user?.id || null,
    });
    if (error) {
      return NextResponse.json({ error: "Could not save email." }, { status: 500 });
    }
  }

  // If the visitor is signed in, mark the profile as email-captured for lifecycle use.
  if (user) {
    await supabase
      .from("profiles")
      .update({ captured_email: true })
      .eq("id", user.id);
  }

  return NextResponse.json({ ok: true, captured: !existing });
}