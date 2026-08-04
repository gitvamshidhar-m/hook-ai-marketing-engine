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
};

export type AnalyzeInput = {
  topic: string;
  audience?: string;
  goal?: string;
  competitorHooks?: string[];
  channel?: Channel | "all";
  count?: number;
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
