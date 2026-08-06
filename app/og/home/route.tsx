import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg,#1e1b4b 0%,#4f46e5 45%,#8b5cf6 75%,#d946ef 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 700, letterSpacing: 1 }}>
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ⚡
          </span>
          HOOK AI
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, maxWidth: 1080 }}>
            Stop writing headlines.
            <br />
            Start winning angles.
          </div>
          <div style={{ fontSize: 30, opacity: 0.92, maxWidth: 1000 }}>
            The AI angle-discovery engine: CTR-predicted ad hooks, email subjects, YouTube titles &amp; campaign plans — free to try.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, opacity: 0.85 }}>
          <span
            style={{
              background: "rgba(255,255,255,0.18)",
              borderRadius: 999,
              padding: "10px 22px",
            }}
          >
            Psychology scores
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.18)",
              borderRadius: 999,
              padding: "10px 22px",
            }}
          >
            Competitor gap scan
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.18)",
              borderRadius: 999,
              padding: "10px 22px",
            }}
          >
            Free · No signup
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}