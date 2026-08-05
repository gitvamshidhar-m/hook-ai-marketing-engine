import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }
  const { title, topic, result } = await req.json().catch(() => ({}));
  if (!title || !topic || !result) {
    return NextResponse.json({ error: "title, topic and result are required." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to save projects." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, title: String(title).slice(0, 120), topic: String(topic).slice(0, 120), result })
    .select("id,title,topic,created_at,updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ project: data });
}
