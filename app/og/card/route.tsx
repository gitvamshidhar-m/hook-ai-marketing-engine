import { ImageResponse } from "next/og";

export const runtime = "edge";

const GRADE = (s: number) => (s >= 80 ? "#34d399" : s >= 60 ? "#fbbf24" : "#fb7185");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "A hook that stops the scroll").slice(0, 160);
  const s = Number(searchParams.get("s")) || 0;
  const p = (searchParams.get("p") || "Curiosity").slice(0, 60);
  const t = (searchParams.get("t") || "").slice(0, 80);
  const score = Math.max(0, Math.min(100, s));

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
          background: "linear-gradient(135deg,#1e1b4b 0%,#4f46e5 45%,#8b5cf6 75%,#d946ef 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
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
            HOOK AI · SCORECARD
          </div>
          {t && <div style={{ fontSize: 22, opacity: 0.85 }}>{t}</div>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 18,
              alignSelf: "flex-start",
              background: "rgba(255,255,255,0.15)",
              borderRadius: 999,
              padding: "10px 24px",
            }}
          >
            <span style={{ fontSize: 64, fontWeight: 800, lineHeight: 1 }}>{score}</span>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 18, opacity: 0.9 }}>
              <span>/100</span>
              <span style={{ color: GRADE(score), fontWeight: 700 }}>
                {score >= 80 ? "Elite" : score >= 60 ? "Strong" : "Needs work"}
              </span>
            </div>
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.12, maxWidth: 1000 }}>“{q}”</div>
          <div style={{ fontSize: 26, opacity: 0.9 }}>Psychology angle: {p}</div>
        </div>

        <div style={{ fontSize: 22, opacity: 0.75 }}>Generated free at hook-ai-marketing-engine.vercel.app</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}