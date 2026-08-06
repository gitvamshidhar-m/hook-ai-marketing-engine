import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as { id?: unknown };
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "Missing project id." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data: source } = await supabase
    .from("projects")
    .select("title,topic,result")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!source) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const { data: created, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: `${source.title} (copy)`.slice(0, 120),
      topic: source.topic,
      result: source.result,
    })
    .select("id,title,topic,result,created_at,updated_at")
    .single();
  if (error || !created) {
    return NextResponse.json({ error: "Could not duplicate." }, { status: 500 });
  }

  return NextResponse.json({ project: created }, { status: 200 });
}