import { ImageResponse } from "next/og";

export const runtime = "edge";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let topic = "A shared Hook AI campaign";
  let health = "";
  let grade = "";
  let hooks = 0;
  let model = "";

  try {
    if (URL && KEY) {
      const res = await fetch(`${URL}/rest/v1/shares?slug=eq.${encodeURIComponent(slug)}&select=payload,title`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
        cache: "no-store",
      });
      if (res.ok) {
        const rows = (await res.json()) as { payload: { topic?: string; model?: string; hooks?: unknown[]; plan?: { healthScore?: number; healthGrade?: string } }; title?: string }[];
        const row = rows[0];
        if (row) {
          topic = row.payload?.topic || row.title || topic;
          model = row.payload?.model || "";
          hooks = Array.isArray(row.payload?.hooks) ? row.payload.hooks.length : 0;
          const p = row.payload?.plan;
          if (p && typeof p.healthScore === "number") {
            health = String(p.healthScore);
            grade = p.healthGrade || "";
          }
        }
      }
    }
  } catch {
    /* fall back to defaults */
  }

  const gradeColor =
    grade === "A" ? "#34d399" : grade === "B" ? "#818cf8" : grade === "C" ? "#fbbf24" : "#fb7185";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(135deg,#4f46e5 0%,#8b5cf6 50%,#d946ef 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ⚡
          </span>
          HOOK AI · CAMPAIGN
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {health && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.18)",
                  borderRadius: 20,
                  padding: "14px 20px",
                }}
              >
                <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>{health}</span>
                <span style={{ fontSize: 16, opacity: 0.85 }}>/100</span>
              </div>
            )}
            {grade && (
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  color: gradeColor,
                  background: "rgba(255,255,255,0.18)",
                  borderRadius: 20,
                  padding: "12px 24px",
                }}
              >
                {grade}
              </div>
            )}
          </div>
          <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.15, maxWidth: 1000 }}>{topic}</div>
          <div style={{ display: "flex", gap: 24, fontSize: 24, opacity: 0.9 }}>
            {hooks > 0 && <span>{hooks} hooks</span>}
            {model && <span>· {model}</span>}
          </div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.75 }}>Generated free at hook-ai-marketing-engine.vercel.app</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
