const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseConfigured = Boolean(URL && KEY);

export async function recordRun(payload: {
  topic: string;
  hooks: number;
  bestScore: number;
  aiPowered: boolean;
  topHooks?: { text: string; score: number; channel?: string; psychology?: string }[];
}): Promise<void> {
  if (!supabaseConfigured) return;
  try {
    await fetch(`${URL}/rest/v1/hook_ai_stats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        topic: payload.topic.slice(0, 120),
        hooks: payload.hooks,
        best_score: payload.bestScore,
        ai_powered: payload.aiPowered,
        created_at: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.error("Supabase record failed (non-fatal)", e);
  }

  // Feed the community table with the best hooks so the /community page can show them.
  if (payload.topHooks?.length) {
    try {
      const rows = payload.topHooks.slice(0, 3).map((h) => ({
        hook: h.text.slice(0, 200),
        score: h.score,
        channel: h.channel || null,
        psychology: h.psychology || null,
        topic: payload.topic.slice(0, 120),
        created_at: new Date().toISOString(),
      }));
      await fetch(`${URL}/rest/v1/community_hooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: KEY,
          Authorization: `Bearer ${KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(rows),
      });
    } catch (e) {
      console.error("Supabase community feed failed (non-fatal)", e);
    }
  }
}

export async function fetchCommunityHooks(): Promise<
  { hook: string; score: number; channel?: string; psychology?: string; topic?: string; created_at: string }[]
> {
  if (!supabaseConfigured) return [];
  try {
    const res = await fetch(`${URL}/rest/v1/community_hooks?select=hook,score,channel,psychology,topic,created_at&order=score.desc&limit=40`, {
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error("Supabase community fetch failed (non-fatal)", e);
    return [];
  }
}

export async function recordCampaign(payload: {
  title: string;
  topic: string;
  result: unknown;
}): Promise<void> {
  if (!supabaseConfigured) return;
  try {
    await fetch(`${URL}/rest/v1/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        user_id: "anon",
        title: payload.title.slice(0, 120),
        topic: payload.topic.slice(0, 120),
        result: payload.result,
        created_at: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.error("Supabase campaign sync failed (non-fatal)", e);
  }
}

export async function fetchRemoteCampaigns(): Promise<unknown[]> {
  if (!supabaseConfigured) return [];
  try {
    const res = await fetch(`${URL}/rest/v1/campaigns?select=title,topic,result,created_at&order=created_at.desc&limit=40`, {
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error("Supabase campaign fetch failed (non-fatal)", e);
    return [];
  }
}
