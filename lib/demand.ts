export type DemandSignal = {
  demand: number; // 0-100
  trend: "rising" | "peaking" | "falling" | "evergreen";
  peakMonths: string[];
  note: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const VERTICALS: {
  keywords: string[];
  peak: number[];
  trend: "rising" | "peaking" | "falling" | "evergreen";
  note: string;
}[] = [
  { keywords: ["tax", "filing", "returns"], peak: [2, 3, 4], trend: "rising", note: "Tax season demand spikes Feb–Apr and dies by May." },
  { keywords: ["fitness", "gym", "workout", "weight", "summer body", "new year"], peak: [0, 1, 5, 6], trend: "rising", note: "Fitness peaks in January (resolutions) and again pre-summer (May–Jun)." },
  { keywords: ["gift", "black friday", "christmas", "holiday", "sale"], peak: [10, 11], trend: "peaking", note: "Gift/holiday demand peaks Oct–Nov. Q4 is prime for retail hooks." },
  { keywords: ["course", "learn", "study", "school", "back to school", "education"], peak: [7, 8, 0], trend: "rising", note: "Education demand surges Aug–Sep and January." },
  { keywords: ["wedding", "weddings", "engagement"], peak: [3, 4, 5, 6], trend: "peaking", note: "Wedding demand peaks spring through early summer." },
  { keywords: ["travel", "vacation", "flight", "hotel", "trip"], peak: [4, 5, 6, 7], trend: "rising", note: "Travel demand builds from late spring into summer." },
  { keywords: ["skincare", "beauty", "makeup", "skin"], peak: [5, 6, 11], trend: "evergreen", note: "Beauty/skincare is evergreen, with bumps pre-summer and during Q4 gifting." },
  { keywords: ["save", "budget", "meal prep", "student", "college"], peak: [7, 8, 0], trend: "rising", note: "Budget/saving content peaks in August (back to school) and January (fresh budgets)." },
  { keywords: ["saas", "software", "app", "startup", "b2b", "sales", "marketing"], peak: [], trend: "evergreen", note: "B2B/SaaS demand is mostly evergreen; Q1 budgets and Q3 planning are the light peaks." },
  { keywords: ["real estate", "mortgage", "home", "property", "rent"], peak: [2, 3, 4, 5], trend: "rising", note: "Real estate search peaks in spring (Mar–May)." },
  { keywords: ["halloween", "costume"], peak: [9], trend: "falling", note: "Halloween peaks sharply in October." },
];

export function demandSignal(topic: string): DemandSignal {
  const lower = topic.toLowerCase();
  const now = new Date().getMonth(); // 0-11
  let demand = 42;
  let matched: (typeof VERTICALS)[number] | null = null;
  for (const v of VERTICALS) {
    if (v.keywords.some((k) => lower.includes(k))) {
      matched = v;
      break;
    }
  }
  const thisMonthLabel = MONTHS[now];
  if (matched) {
    const inPeak = matched.peak.includes(now);
    const nextPeak = matched.peak.find((m) => m >= now);
    if (matched.peak.length > 0) {
      const distance = inPeak ? 0 : Math.min(nextPeak === undefined ? 12 - now + matched.peak[0] : nextPeak - now, 6);
      demand = inPeak ? 88 : Math.max(48, 88 - distance * 8);
    } else {
      demand = 64;
    }
    return {
      demand,
      trend: inPeak ? "peaking" : matched.trend,
      peakMonths: matched.peak.map((m) => MONTHS[m]),
      note: matched.note,
    };
  }
  // generic heuristic when no vertical matches
  const specific = /(\d+|for|to|how|guide|best|vs|without|with)/.test(lower);
  demand = specific ? 58 : 47;
  return {
    demand,
    trend: "evergreen",
    peakMonths: [],
    note: `No strong seasonality detected. Treated as evergreen; current month is ${thisMonthLabel}. Add niche keywords (tax, fitness, back-to-school…) for a sharper seasonal read.`,
  };
}
