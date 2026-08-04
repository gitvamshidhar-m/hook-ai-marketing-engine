import {
  ANGLE_CATEGORIES,
  CHANNEL_LABELS,
  type AnalyzeInput,
  type AnalyzeResult,
  type Angle,
  type Channel,
  type Gap,
  type Hook,
  type Usp,
} from "./types";

function cap(s: string, n: number) {
  return s.trim().split(/\s+/).slice(0, n).join(" ");
}

/* ---------------- angle templates ---------------- */

function buildAngles(topic: string): Angle[] {
  const t = cap(topic, 5) || "this topic";
  const map: Record<string, [string, string]> = {
    curiosity: [
      `Most people miss the one angle on "${t}" that actually gets opened.`,
      "Curiosity gaps are unfinished ideas the brain feels compelled to close — an incomplete promise reads as an itch.",
    ],
    contrarian: [
      `Everything you were told about "${t}" is backwards — and here's the proof.`,
      "Contradicting the status quo triggers a vigilance response; readers lean in to check who's right.",
    ],
    authority: [
      `The only play on "${t}" backed by published studies, not a hunch.`,
      "Citations and named sources transfer credibility, lowering skepticism before attention is committed.",
    ],
    fear: [
      `Every month "${t}" gets ignored, competitors quietly take another 10%.`,
      "Loss aversion: people act harder to avoid a loss than to capture the same-size gain.",
    ],
    social: [
      `${900 + ((topic.length * 7) % 3000)}+ professionals already changed how they approach "${t}".`,
      "Social proof outsources the decision to the crowd, which feels safer than deciding alone.",
    ],
    data: [
      `Fresh numbers on "${t}": people waste ${9 + (topic.length % 8)} hours a week doing it wrong.`,
      "A precise figure signals the claim was measured, not invented, so it lands as a fact.",
    ],
    story: [
      `I nearly quit "${t}" for good — then one reframe changed everything.`,
      "Story mimics lived experience and keeps attention from drifting the way abstract claims do.",
    ],
    specificity: [
      `Do "${t}" in ${3 + (topic.length % 4)} steps, under ${20 + (topic.length % 15)} minutes, no fluff.`,
      "Concrete numbers make a promise feel bounded and testable, so it reads as truthful.",
    ],
    ego: [
      `People who truly master "${t}" don't cut corners. Neither do you.`,
      "Identity appeals activate the reader's self-image; they act to protect the person they claim to be.",
    ],
    misdirection: [
      `Stop chasing the "${t}" click — it's the wrong metric entirely.`,
      "Pointing at the obvious wrong answer surprises the reader and buys trust for free.",
    ],
  };
  return ANGLE_CATEGORIES.map((c) => {
    const [description, whyItWorks] = map[c.id];
    return {
      name: c.name,
      category: c.id,
      description,
      whyItWorks,
    };
  });
}

/* ---------------- hook templates ---------------- */

type PatternFn = (toc: string, aud: string) => string;

const AD_PATTERNS: PatternFn[] = [
  (t) => `Stop doing ${t} the hard way`,
  (t, a) => `${t}: the shortcut most ${a} won't admit to`,
  (t) => `Why ${t} secretly isn't working`,
  (t) => `Your ${t} problem is one toggle away`,
  (t) => `Doing ${t} wrong? Start here.`,
  (t) => `The ${t} metric everybody forgets`,
  (t) => `Don't buy into ${t} until you've seen this`,
  (t, a) => `${a} who fixed ${t} in one week — how?`,
];
const EMAIL_PATTERNS: PatternFn[] = [
  (t) => `RE: your ${t} status`,
  (t, a) => `${a}, the ${t} thing (read before 1 pm)`,
  (t) => `2 minutes on ${t} that could save your week`,
  (t, a) => `${a}, a quick ${t} question for you`,
  (t) => `We found something about your ${t}`,
  (t) => `The ${t} follow-up you're actually allowed to open`,
  (t) => `Your ${t} plan? It's almost time.`,
  (t) => `One ${t} thought, straight from the team`,
];
const YT_PATTERNS: PatternFn[] = [
  (t) => `Why everyone stops doing ${t} (and how to last)`,
  (t) => `I tested ${t} for 30 days — the honest result`,
  (t) => `${t} for beginners: the only guide you need`,
  (t) => `The ${t} trick that quietly doubled results`,
  (t) => `${t}, one year in: what actually worked`,
  (t) => `Stop doing ${t} wrong — the #1 mistake`,
  (t, a) => `What ${a} wish they knew about ${t}`,
  (t) => `${t} in 2026: don't start until you watch`,
];
const BLOG_PATTERNS: PatternFn[] = [
  (t) => `${t}: the practical guide that skips the fluff`,
  (t, a) => `10 ${t} mistakes silently costing ${a}`,
  (t) => `How we cut ${t} effort in half (with numbers)`,
  (t) => `${t} vs. expectation: what nobody tells you`,
  (t) => `The ${t} framework even pros still misuse`,
  (t) => `7 ${t} tactics still working in 2026`,
  (t) => `${t}: an honest look at the real trade-offs`,
  (t) => `From scratch to ${t} in 90 real days`,
];

const PATTERNS: Record<Channel, PatternFn[]> = {
  ad: AD_PATTERNS,
  email: EMAIL_PATTERNS,
  youtube: YT_PATTERNS,
  blog: BLOG_PATTERNS,
};

/* ---------------- scoring ---------------- */

function scoreHook(text: string, topic: string) {
  let s = 3;
  const lower = text.toLowerCase();
  const kw = topic.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  if (kw.some((k) => lower.includes(k))) s += 2;
  if (/[0-9]/.test(text)) s += 2;
  if (/\b(why|stop|never|secret|wrong|mistake|actually|honestly)\b/.test(lower)) s += 2;
  if (/re:|question/i.test(lower)) s += 2;
  if (/[?!]/.test(text)) s += 1;
  if (text.length >= 14 && text.length <= 90) s += 1;
  return Math.round(Math.min(s, 10) * 9.6);
}

function psychologyOf(text: string) {
  if (/why|wrong|never|secret|actually|honestly/i.test(text)) return "Contrarian / curiosity";
  if (/[0-9]/.test(text)) return "Specificity / data";
  if (/re:|question/i.test(text)) return "Curiosity + urgency";
  return "Identity / ego";
}

/* ---------------- gaps ---------------- */

const STAT_HINT: Record<string, string> = {
  data: "open with a public stat before the claim",
  curiosity: "tease the payoff, withhold the number",
  contrarian: "attack the most-repeated advice head-on",
  story: "open on a cliff in a personal anecdote",
  social: "lead with a named brand or count",
  fear: "frame what it costs to keep waiting",
  authority: "cite the source in the first line",
  specificity: "name the exact time and steps",
  ego: "appeal to their professional identity",
  misdirection: "declare the obvious approach wrong",
};

function buildGaps(topic: string, competitors: string[]): Gap[] {
  const seen = new Set<string>();
  competitors.forEach((c) => {
    const lower = c.toLowerCase();
    if (/[0-9]/.test(lower)) seen.add("data");
    const hints: [string, string][] = [
      ["why", "contrarian"],
      ["stop", "contrarian"],
      ["truth", "curiosity"],
      ["secret", "curiosity"],
      ["story", "story"],
      ["how i", "story"],
      ["don't", "contrarian"],
    ];
    hints.forEach(([word, id]) => {
      if (lower.includes(word)) seen.add(id);
    });
  });
  const missed = ANGLE_CATEGORIES.filter((a) => !seen.has(a.id)).slice(0, 4);
  return missed.map((a) => ({
    angleName: a.name,
    angleCategory: a.id,
    evidence: `Top competitor hooks cluster around ${seen.size >= 2 ? `${seen.size} angles` : "only a couple of angles"}; "${a.name}" is untapped in this batch.`,
    suggestedHook: `Lead with ${a.name.toLowerCase()} for "${cap(topic, 5)}" — ${STAT_HINT[a.id]}.`,
  }));
}

function summarizePromise(topic: string) {
  if (/save|cut|reduce|cheap|free/i.test(topic)) return "cuts wasted effort to almost zero";
  if (/grow|scale|traffic|leads|sales|convert/i.test(topic)) return "compounds results with the same effort";
  if (/learn|skill|course|improve/i.test(topic)) return "gets results faster with far less grind";
  return "turns guesswork into a repeatable, data-aware process";
}

/* ---------------- main entry (no-AI fallback) ---------------- */

export function generateResult(input: AnalyzeInput): AnalyzeResult {
  const channels: Channel[] =
    input.channel && input.channel !== "all" ? [input.channel] : (["ad", "email", "youtube", "blog"] as Channel[]);
  const angles = buildAngles(input.topic);
  const hooks: Hook[] = [];
  const count = input.count && input.count > 0 ? input.count : 3;
  const variation = input.variation && input.variation > 0 ? input.variation : 0;
  channels.forEach((ch) => {
    const pats = PATTERNS[ch];
    const shift = variation * 2;
    for (let i = 0; i < count; i++) {
      const idx = (shift + i) % pats.length;
      const text = pats[idx](cap(input.topic, 5), input.audience || "marketers");
      hooks.push({
        id: `${ch}-${variation}-${i}`,
        text,
        channel: ch,
        channelLabel: CHANNEL_LABELS[ch],
        score: scoreHook(text, input.topic),
        psychology: psychologyOf(text),
        variation: variation > 0 ? `v${variation}` : undefined,
      });
    }
  });
  const usp: Usp = {
    positioningStatement: `For ${input.audience || "time-constrained marketers"}, "${cap(input.topic, 4)}" is a proven system that ${summarizePromise(input.topic)}.`,
    elevatorPitch: `I help ${input.audience || "marketers"} turn "${input.topic}" from guesswork into a repeatable, data-aware process in under 5 minutes with no extra tools.`,
    differentiators: [
      "10 psychological angles instead of one tone",
      "CTR prediction score on every headline",
      "Competitor gap analysis built in",
      "Channel-native formatting (ad, email, YT, blog)",
    ],
  };
  return {
    topic: input.topic,
    audience: input.audience || "marketers",
    goal: input.goal || "",
    competitorHooks: input.competitorHooks || [],
    angles,
    hooks,
    gaps: buildGaps(input.topic, input.competitorHooks || []),
    usp,
    aiPowered: false,
  };
}
