import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ShareStat = {
  id: string;
  slug: string;
  title: string;
  views: number;
  clicks: number;
  created_at: string;
  leads: number;
  url: string;
};

export async function GET(req: NextRequest) {
  if (!supabaseConfigured) {
    return NextResponse.json({ shares: [] }, { status: 200 });
  }
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: rows } = user
    ? await supabase
        .from("shares")
        .select("id,slug,title,views,clicks,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] as { id: string; slug: string; title: string; views: number; clicks: number; created_at: string }[] };

  if (!rows) return NextResponse.json({ shares: [] }, { status: 200 });

  const ids = rows.map((r) => r.id);
  const { data: leads } =
    ids.length > 0
      ? await supabase.from("leads").select("share_id").in("share_id", ids)
      : { data: [] as { share_id: string }[] };
  const leadCount: Record<string, number> = {};
  (leads || []).forEach((l) => {
    leadCount[l.share_id] = (leadCount[l.share_id] || 0) + 1;
  });

  const origin = req.nextUrl.origin;
  const shares: ShareStat[] = rows.map((r) => ({
    ...r,
    views: typeof r.views === "number" ? r.views : 0,
    clicks: typeof r.clicks === "number" ? r.clicks : 0,
    leads: leadCount[r.id] || 0,
    url: `${origin}/s/${r.slug}`,
  }));

  return NextResponse.json({ shares }, { status: 200 });
}