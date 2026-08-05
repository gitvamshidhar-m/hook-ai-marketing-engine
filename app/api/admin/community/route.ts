import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("admin_community_list");
  if (error) return NextResponse.json({ error: "Failed to load community." }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = (await req.json().catch(() => ({}))) as { id?: unknown };
  const id = Number(body.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid hook id." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("admin_community_delete", { hook_id: id });
  if (error) return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  return NextResponse.json({ ok: true });
}