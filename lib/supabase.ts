const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const TABLE = process.env.NEXT_PUBLIC_SUPABASE_TABLE || "hook_ai_stats";

export const supabaseConfigured = Boolean(URL && KEY);

export async function recordRun(payload: {
  topic: string;
  hooks: number;
  bestScore: number;
  aiPowered: boolean;
}): Promise<void> {
  if (!supabaseConfigured) return;
  try {
    await fetch(`${URL}/rest/v1/${TABLE}`, {
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
}
