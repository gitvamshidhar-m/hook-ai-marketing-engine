import type { AnalyzeResult } from "./types";
import type { Campaign } from "./account";
import { computeHealthScore } from "./health";

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

// Branded, print-to-PDF campaign report.
export function printCampaignReport(result: AnalyzeResult) {
  const health = computeHealthScore(result);
  const win = window.open("", "_blank");
  if (!win) return;
  const best = [...result.hooks].sort((a, b) => b.score - a.score)[0];
  win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${result.topic} — Campaign Report · Hook AI</title><style>
    *{box-sizing:border-box}
    body{font-family:system-ui,sans-serif;max-width:820px;margin:0 auto;padding:2.5rem;color:#18181b;line-height:1.6}
    .brand{display:flex;align-items:center;gap:.5rem;font-size:.8rem;font-weight:700;letter-spacing:.02em;color:#6366f1}
    .mark{background:linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef);color:#fff;border-radius:.5rem;width:1.6rem;height:1.6rem;display:inline-flex;align-items:center;justify-content:center;font-size:.9rem}
    h1{font-size:1.6rem;margin:.6rem 0 0}
    .meta{color:#71717a;font-size:.85rem;margin-top:.25rem}
    .hero{display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef);color:#fff;border-radius:1rem;padding:1.5rem;margin-top:1.5rem}
    .hero .score{font-size:2.4rem;font-weight:800;line-height:1}
    .hero .grade{font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;opacity:.9}
    h2{font-size:1.05rem;margin-top:2rem;border-bottom:2px solid #e4e4e7;padding-bottom:.3rem}
    table{border-collapse:collapse;width:100%;font-size:.85rem}
    th,td{text-align:left;padding:.5rem;border-bottom:1px solid #e4e4e7}
    th{font-size:.7rem;text-transform:uppercase;color:#71717a}
    .tag{display:inline-block;background:#eef2ff;color:#4f46e5;border-radius:999px;padding:.15rem .6rem;font-size:.72rem;margin:.15rem}
    .factor{display:flex;align-items:center;justify-content:space-between;padding:.4rem 0;font-size:.85rem}
    .bar{height:.5rem;background:#f4f4f5;border-radius:999px;overflow:hidden;flex:1;margin-left:1rem}
    .bar>div{height:100%;border-radius:999px}
    .footer{margin-top:2.5rem;font-size:.7rem;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;padding-top:1rem}
  </style></head><body>`);
  win.document.write(`<div class="brand"><span class="mark">⚡</span> HOOK AI · CAMPAIGN REPORT</div>`);
  win.document.write(`<h1>${result.topic}</h1>`);
  win.document.write(`<p class="meta">Audience: ${result.audience || "general"} · Goal: ${result.goal || "clicks"} · Generated ${new Date().toLocaleDateString()} · ${result.aiPowered ? "AI-powered (" + result.model + ")" : "prediction engine"}</p>`);
  win.document.write(`<div class="hero"><div><div class="grade">Campaign Health Score</div><div style="font-size:.85rem;opacity:.9;margin-top:.2rem">Angle diversity · Hook strength · Readability</div></div><div style="text-align:right"><div class="score">${health.score}<span style="font-size:1.1rem">/100</span></div><div class="grade">Grade ${health.grade}</div></div></div>`);
  if (best) win.document.write(`<h2>Best Hook</h2><p><strong>${best.text}</strong> <span class="tag">${best.score}/100</span> <span class="tag">${best.psychology}</span></p>`);
  win.document.write("<h2>Health Factors</h2>");
  for (const f of health.factors) {
    const color = f.ok ? "#22c55e" : f.score >= 40 ? "#f59e0b" : "#f43f5e";
    win.document.write(`<div class="factor"><span>${f.label}</span><div class="bar"><div style="width:${Math.round(f.score)}%;background:${color}"></div></div><span style="font-weight:700">${Math.round(f.score)}</span></div>`);
  }
  win.document.write("<h2>Hooks</h2><table><tr><th>Channel</th><th>Hook</th><th>Score</th><th>Psychology</th></tr>");
  for (const h of result.hooks) win.document.write(`<tr><td>${h.channel}</td><td>${h.text}</td><td style="font-weight:700">${h.score}</td><td>${h.psychology}</td></tr>`);
  win.document.write("</table>");
  if (result.gaps.length) {
    win.document.write("<h2>Competitor Gaps</h2>");
    for (const g of result.gaps) win.document.write(`<p><strong>${g.angleName}</strong> (${g.angleCategory}) — ${g.suggestedHook}</p>`);
  }
  if (result.usp?.differentiators?.length) {
    win.document.write("<h2>Differentiators</h2>");
    for (const d of result.usp.differentiators) win.document.write(`<p>· ${d}</p>`);
  }
  win.document.write(`<div class="footer">Generated by Hook AI · hook-ai-marketing-engine.vercel.app</div>`);
  win.document.write("</body></html>");
  win.document.close();
  win.focus();
  win.print();
}

export function exportSheets(result: AnalyzeResult) {
  const headers = ["hook", "channel", "score", "psychology", "variation", "forecast_emotion"];
  const rows = [
    headers,
    ...result.hooks.map((h) => [
      h.text,
      h.channel,
      String(h.score),
      h.psychology,
      h.variation || "",
      h.forecast?.emotion || "",
    ]),
  ];
  const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  navigator.clipboard.writeText(csv).then(() => {
    alert("Sheets-ready CSV copied to clipboard — paste it into Google Sheets.");
  }).catch(() => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hookai-sheets-${result.topic.replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Export the full campaign plan (budget, strategy, calendar, testing, KPIs) to a single CSV workbook.
export function exportPlanCSV(result: AnalyzeResult) {
  const plan = result.plan;
  if (!plan) return;
  const slug = result.topic.replace(/\s+/g, "-").toLowerCase();
  const rows: string[][] = [];
  rows.push(["SECTION", "FIELD", "VALUE", "DETAIL"]);

  rows.push(["Overview", "Topic", result.topic, ""]);
  rows.push(["Overview", "Goal", result.goal || "clicks", ""]);
  rows.push(["Overview", "Health score", String(plan.healthScore), `Grade ${plan.healthGrade}`]);
  rows.push(["Overview", "Budget", plan.budget.total.toLocaleString("en-IN"), "daily INR"]);

  plan.budget.allocations.forEach((a) => rows.push(["Budget", a.channel, a.label, `${a.percent}% · ₹${a.amount}`]));

  plan.strategies.forEach((s) => rows.push(["Channel", s.channel, s.label, `${s.role} — ${s.bestHook || ""} ${s.recommendation}`]));

  plan.funnel.forEach((f) => rows.push(["Funnel", f.stage, f.label, `${f.share}%`]));

  plan.calendar.forEach((c) => rows.push(["Calendar", `Day ${c.day}`, c.label, c.idea]));

  plan.testing.forEach((t) => rows.push(["Testing", t.strategy, t.hook, `${t.minClicks} clicks · ${t.durationDays} days`]));

  plan.targeting.meta.forEach((t) => rows.push(["Targeting", "Meta", t, ""]));
  plan.targeting.tiktok.forEach((t) => rows.push(["Targeting", "TikTok", t, ""]));
  plan.targeting.google.forEach((t) => rows.push(["Targeting", "Google", t, ""]));

  plan.kpis.forEach((k) => rows.push(["KPI", k.metric, k.target, k.note]));

  downloadCSV(`hookai-plan-${slug}.csv`, rows);
}

// Branded, print-to-PDF campaign-plan report (budget, strategies, calendar, testing, KPIs).
export function printCampaignPlanReport(result: AnalyzeResult) {
  const plan = result.plan;
  if (!plan) return;
  const win = window.open("", "_blank");
  if (!win) return;

  const rows = (title: string, data: [string, string][]) =>
    data.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");

  win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${result.topic} — Campaign Plan · Hook AI</title><style>
    *{box-sizing:border-box}
    body{font-family:system-ui,sans-serif;max-width:820px;margin:0 auto;padding:2.5rem;color:#18181b;line-height:1.55}
    .brand{display:flex;align-items:center;gap:.5rem;font-size:.8rem;font-weight:700;letter-spacing:.02em;color:#6366f1}
    .mark{background:linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef);color:#fff;border-radius:.5rem;width:1.6rem;height:1.6rem;display:inline-flex;align-items:center;justify-content:center;font-size:.9rem}
    h1{font-size:1.6rem;margin:.6rem 0 0}
    .meta{color:#71717a;font-size:.85rem;margin-top:.25rem}
    .hero{display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef);color:#fff;border-radius:1rem;padding:1.5rem;margin-top:1.5rem}
    .hero .score{font-size:2.4rem;font-weight:800;line-height:1}
    .hero .grade{font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;opacity:.9}
    h2{font-size:1.05rem;margin-top:1.8rem;border-bottom:2px solid #e4e4e7;padding-bottom:.3rem}
    table{border-collapse:collapse;width:100%;font-size:.85rem}
    th,td{text-align:left;padding:.45rem;border-bottom:1px solid #e4e4e7;vertical-align:top}
    th{font-size:.7rem;text-transform:uppercase;color:#71717a;width:34%}
    .bar{height:.55rem;background:#f4f4f5;border-radius:999px;overflow:hidden}
    .bar>div{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6,#d946ef);border-radius:999px}
    .footer{margin-top:2.5rem;font-size:.7rem;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;padding-top:1rem}
  </style></head><body>`);
  win.document.write(`<div class="brand"><span class="mark">⚡</span> HOOK AI · CAMPAIGN PLAN</div>`);
  win.document.write(`<h1>${result.topic}</h1>`);
  win.document.write(`<p class="meta">Audience: ${result.audience || "general"} · Goal: ${result.goal || "clicks"} · Generated ${new Date().toLocaleDateString()}</p>`);
  win.document.write(`<div class="hero"><div><div class="grade">Campaign Health Score</div><div style="font-size:.85rem;opacity:.9;margin-top:.2rem">Ad-platform-readiness of the full plan</div></div><div style="text-align:right"><div class="score">${plan.healthScore}<span style="font-size:1.1rem">/100</span></div><div class="grade">Grade ${plan.healthGrade}</div></div></div>`);

  win.document.write(`<h2>Budget split · ₹${plan.budget.total.toLocaleString("en-IN")}/day</h2>`);
  win.document.write(`<table>${rows("Budget", plan.budget.allocations.map((a) => [`${a.label}`, `${a.percent}% · ₹${a.amount.toLocaleString("en-IN")}/day`]))}</table>`);
  win.document.write(`<div class="bar" style="margin-top:.5rem"><div style="width:${Math.min(100, plan.healthScore)}%"></div></div>`);

  win.document.write("<h2>Channel strategy</h2>");
  for (const s of plan.strategies) {
    win.document.write(`<p><strong>${s.label}:</strong> ${s.role}${s.bestHook ? ` — “${s.bestHook}”` : ""} ${s.recommendation}</p>`);
  }

  win.document.write("<h2>Funnel fit</h2>");
  win.document.write(`<table>${rows("Stage", plan.funnel.map((f) => [f.stage, `${f.share}% — ${f.label}`]))}</table>`);

  win.document.write("<h2>7-day content calendar</h2>");
  win.document.write(`<table>${rows("Day", plan.calendar.map((c) => [`Day ${c.day} · ${c.label}`, c.idea]))}</table>`);

  win.document.write("<h2>Creative testing plan</h2>");
  win.document.write(`<table>${rows("Step", plan.testing.map((t) => [`“${t.hook}”`, `${t.strategy} · ${t.minClicks} clicks · ${t.durationDays} days`]))}</table>`);

  win.document.write(`<h2>Targeting</h2><p>${plan.targeting.note}</p>`);
  win.document.write("<table><tr><th>Network</th><th>Audiences</th></tr>");
  (["Meta", "TikTok", "Google"] as const).forEach((net, i) => {
    const key = ["meta", "tiktok", "google"][i] as "meta" | "tiktok" | "google";
    win.document.write(`<tr><td>${net}</td><td>${plan.targeting[key].join(", ")}</td></tr>`);
  });
  win.document.write("</table>");

  win.document.write("<h2>KPIs to hit</h2>");
  win.document.write(`<table>${rows("KPI", plan.kpis.map((k) => [k.metric, `${k.target} — ${k.note}`]))}</table>`);

  win.document.write(`<div class="footer">Generated by Hook AI · hook-ai-marketing-engine.vercel.app</div>`);
  win.document.write("</body></html>");
  win.document.close();
  win.focus();
  win.print();
}