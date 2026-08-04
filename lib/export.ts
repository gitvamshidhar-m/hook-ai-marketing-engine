import type { AnalyzeResult } from "./types";
import type { Campaign } from "./account";

export function downloadCSV(filename: string, rows: string[][]) {
  const bom = "\uFEFF";
  const body = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([bom + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function campaignToCSV(c: Campaign): string[] {
  return [
    c.title,
    c.topic,
    String(c.result.hooks.length),
    String(c.result.hooks.reduce((a, h) => a + h.score, 0)),
    c.result.aiPowered ? "yes" : "no",
    c.result.model || "engine",
    c.result.language || "en",
    c.createdAt,
  ];
}

export function exportCampaignsCSV(campaigns: Campaign[]) {
  const headers = ["title", "topic", "hooks", "totalScore", "aiPowered", "model", "language", "createdAt"];
  const rows = [headers, ...campaigns.map(campaignToCSV)];
  downloadCSV(`hookai-campaigns-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

export function exportResultCSV(result: AnalyzeResult) {
  const headers = ["channel", "text", "score", "psychology", "emotion", "reasoning", "compliant"];
  const rows = [
    headers,
    ...result.hooks.map((h) => [
      h.channel,
      h.text,
      String(h.score),
      h.psychology,
      h.forecast?.emotion || "",
      h.forecast?.reasoning || "",
      h.compliance?.ok ? "yes" : "no",
    ]),
  ];
  downloadCSV(`hookai-result-${result.topic.replace(/\s+/g, "-")}.csv`, rows);
}

export function printResult(result: AnalyzeResult) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${result.topic} — Hook AI</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#18181b;line-height:1.6}h1{font-size:1.5rem}h2{font-size:1.1rem;margin-top:2rem;border-bottom:1px solid #e4e4e7;padding-bottom:.25rem}table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:.5rem;border-bottom:1px solid #e4e4e7}th{font-size:.75rem;text-transform:uppercase;color:#71717a}.score{font-weight:700}.ok{color:#16a34a}.warn{color:#ca8a04}</style></head><body>`);
  win.document.write(`<h1>${result.topic}</h1>`);
  win.document.write(`<p>Audience: ${result.audience || "general"} · Goal: ${result.goal || "clicks"} · ${result.aiPowered ? "AI-powered (" + result.model + ")" : "engine"}</p>`);
  win.document.write("<h2>Hooks</h2>");
  win.document.write("<table><tr><th>Channel</th><th>Hook</th><th>Score</th><th>Psychology</th><th>Compliant</th></tr>");
  for (const h of result.hooks) {
    win.document.write(`<tr><td>${h.channel}</td><td>${h.text}</td><td class="score">${h.score}</td><td>${h.psychology}</td><td class="${h.compliance?.ok ? 'ok' : 'warn'}">${h.compliance?.ok ? '✓' : '⚠'}</td></tr>`);
  }
  win.document.write("</table>");
  if (result.gaps.length) {
    win.document.write("<h2>Competitor Gaps</h2>");
    for (const g of result.gaps) win.document.write(`<p><strong>${g.angleName}</strong> (${g.angleCategory}): ${g.suggestedHook}</p>`);
  }
  if (result.keywords && result.keywords.length) {
    win.document.write("<h2>Keyword Heatmap</h2>");
    win.document.write("<table><tr><th>Keyword</th><th>You</th><th>Competitors</th></tr>");
    for (const k of result.keywords!) win.document.write(`<tr><td>${k.keyword}</td><td>${k.yourMentions}</td><td>${k.competitorMentions}</td></tr>`);
    win.document.write("</table>");
  }
  win.document.write("</body></html>");
  win.document.close();
  win.print();
}