export type Channel = "ad" | "email" | "youtube" | "blog";

export type Angle = {
  name: string;
  category: string;
  description: string;
  whyItWorks: string;
};

export type Hook = {
  id: string;
  text: string;
  channel: Channel;
  channelLabel: string;
  score: number;
  psychology: string;
  variation?: string;
  forecast?: Forecast;
  compliance?: ComplianceCheck;
};

export type Forecast = {
  emotion: string;
  reasoning: string;
};

export type ComplianceCheck = {
  ok: boolean;
  flags: string[];
};

export type VoiceProfile = {
  detected: string[];
  summary: string;
  source: "ai" | "heuristic";
};

export type Tagline = {
  text: string;
  confidence: number;
};

export type Gap = {
  angleName: string;
  angleCategory: string;
  evidence: string;
  suggestedHook: string;
};

export type Usp = {
  positioningStatement: string;
  elevatorPitch: string;
  differentiators: string[];
};

export type AnalyzeResult = {
  topic: string;
  audience: string;
  goal: string;
  competitorHooks: string[];
  angles: Angle[];
  hooks: Hook[];
  gaps: Gap[];
  usp: Usp;
  aiPowered: boolean;
  model?: string;
  voice?: VoiceProfile;
  taglines?: Tagline[];
  language?: string;
  keywords?: KeywordRow[];
};

export type KeywordRow = {
  keyword: string;
  competitorMentions: number;
  yourMentions: number;
};

export type AnalyzeInput = {
  topic: string;
  audience?: string;
  goal?: string;
  competitorHooks?: string[];
  channel?: Channel | "all";
  count?: number;
  variation?: number;
  avoidPsych?: string[];
  voiceSamples?: string[];
  language?: string;
};

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "hi", label: "Hindi" },
  { code: "ar", label: "Arabic" },
  { code: "pt", label: "Portuguese" },
  { code: "ja", label: "Japanese" },
];

export type AdCopy = {
  variant: string;
  angle: string;
  headline: string;
  subheadline: string;
  body: string;
  cta: string;
};

export type AbTest = {
  id: string;
  topic: string;
  hooks: [string, string];
  scores: [number, number];
  winner: 0 | 1 | -1;
  createdAt: string;
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  ad: "Ad headline",
  email: "Email subject line",
  youtube: "YouTube title",
  blog: "Blog H1",
};

export const ANGLE_CATEGORIES = [
  { id: "curiosity", name: "Curiosity Gap", pitch: "Sells the unknown", tint: "#6366f1" },
  { id: "contrarian", name: "Contrarian", pitch: "Flipping the obvious", tint: "#f43f5e" },
  { id: "authority", name: "Authority & Proof", pitch: "Facts beat opinions", tint: "#0ea5e9" },
  { id: "fear", name: "Loss Aversion", pitch: "What it costs to wait", tint: "#f59e0b" },
  { id: "social", name: "Social Proof", pitch: "Everyone is doing it", tint: "#10b981" },
  { id: "data", name: "Data-Backed", pitch: "Numbers that shock", tint: "#8b5cf6" },
  { id: "story", name: "Story-Driven", pitch: "Plot you can't skip", tint: "#ec4899" },
  { id: "specificity", name: "Specificity", pitch: "Ultra concrete promises", tint: "#14b8a6" },
  { id: "ego", name: "Identity & Ego", pitch: "Who you are now", tint: "#a855f7" },
  { id: "misdirection", name: "Misdirection", pitch: "The obvious wrong answer", tint: "#eab308" },
];
