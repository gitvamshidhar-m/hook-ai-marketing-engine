import type { AdCopy, AnalyzeResult } from "./types";

export function buildTemplateAd(result: AnalyzeResult): AdCopy[] {
  const adHook = [...result.hooks].filter((h) => h.channel === "ad").sort((a, b) => b.score - a.score)[0];
  const extra = adHook ? `${adHook.text}` : result.usp.elevatorPitch;
  const headline = result.taglines?.[0]?.text || extra.slice(0, 40);
  const primes = (result.keywords || []).slice(0, 3).map((k) => k.keyword).join(", ");
  const body = `${result.usp.positioningStatement} ${primes ? `Built for people searching ${primes}.` : ""}`;
  const cta = (result.goal || "get started").replace(/^to\s+/i, "").replace(/\b(drive|gain|generate)\b/gi, "");
  return [
    {
      variant: "A",
      angle: "Direct + specific",
      headline,
      subheadline: result.usp.elevatorPitch.length > 80 ? result.usp.elevatorPitch.slice(0, 77) + "…" : result.usp.elevatorPitch,
      body,
      cta: cta ? `Start now — ${cta.trim()}` : "Start now",
    },
    {
      variant: "B",
      angle: "Curiosity + proof",
      headline: adHook ? adHook.text : `${result.topic}, minus the guesswork`,
      subheadline: `The ${result.topic} system, built with ${primes || "proven angles"}.`,
      body: `Skip the trial-and-error. ${result.usp.differentiators[0] || ""} — the smarter way forward.`,
      cta: "Claim your spot",
    },
  ];
}