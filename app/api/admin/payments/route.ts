import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("admin_payments_list");
  if (error) return NextResponse.json({ error: "Failed to load payments." }, { status: 500 });
  return NextResponse.json(data || []);
}