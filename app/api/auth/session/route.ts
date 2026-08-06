import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!supabaseConfigured) {
    return NextResponse.json({ user: null, profile: null });
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ user: null, profile: null });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,name,credits,role,ref_code,captured_email")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({ user: { id: user.id, email: user.email }, profile });
}
