const RULES: [string, RegExp][] = [
  ["data", /\b(\d+[k+]?|\$|%)\b/],
  ["specificity", /^\s*\d+| for \$\d+|\d{2,}%/],
  ["contrarian", /\b(why|stop|don'?t|never|wrong|mistake|backwards|ditch|skip)\b/i],
  ["curiosity", /\b(secret|truth|hack|actually|quietly|forgot|missing|everyone (skips|misses))\b/i],
  ["fear", /\b(waste|wasted|save|avoid|lose|lost|cost|costs|starve|too late|penalty)\b/i],
  ["social", /\b(top \d|best \d|\d+(k|\+|,\d*|\s)? (people|users|founders|pros|experts|moms|students|startups)|everyone|agree)\b/i],
  ["authority", /\b(study|studies|data (says|shows)|dermatologist|doctor|expert|evidence|proven|research)\b/i],
  ["story", /\b(i (tested|tried|quit|almost)|my (own|story)|30 days|year later|how i|personal)\b/i],
  ["ego", /\b(people who|serious|professional|master|truly|don'?t cut corners|neither do)\b/i],
  ["identity", /\b(you are|your (brand|identity)|solo founder|busy mom|entrepreneur|founder)\b/i],
];

export function classifyHook(text: string): string {
  for (const [id, re] of RULES) {
    if (re.test(text)) return id;
  }
  return "curiosity";
}

export function humanizePsych(text: string): string {
  const id = classifyHook(text);
  const map: Record<string, string> = {
    data: "Data-backed",
    specificity: "Specificity",
    contrarian: "Contrarian",
    curiosity: "Curiosity gap",
    fear: "Loss aversion",
    social: "Social proof",
    authority: "Authority",
    story: "Story-driven",
    ego: "Identity / ego",
    identity: "Identity",
  };
  return map[id];
}

import type { VoiceProfile } from "./types";

export type VoiceResult = VoiceProfile;

export function detectVoice(samples: string[]): VoiceProfile {
  const joined = samples.join(" ").toLowerCase();
  const detected: string[] = [];
  if (/\b(you|we|hey|yo|let'?s|ok|nice|easy|fun|awesome|love|tbh|honestly)\b/gi.test(joined)) detected.push("Playful");
  if (/\b(must|will|guaranteed|proven|results|percent|data|expert|authority|\bdirect)\b/gi.test(joined)) detected.push("Authoritative");
  if (/\b(i (understand|know|feel)|for you|your journey|together|care|nurture|support)\b/gi.test(joined)) detected.push("Empathetic");
  if (/\b(the (truth|secret|real)|nothing|stop|don'?t|failure|mistake|harsh|brutal)\b/gi.test(joined)) detected.push("Contrarian");
  if (/\b(now|today|limited|urgent|fast|instant|act|last chance|exclusive)\b/gi.test(joined)) detected.push("Urgent");
  if (/\b(hip|fresh|slang|vibe|stan|cringe|based|goat|fire|lit)\b/gi.test(joined)) detected.push("Youthful");
  if (/\b(premium|elegant|luxury|bespoke|cultured|refined|sophisticated)\b/gi.test(joined)) detected.push("Premium");
  if (detected.length === 0) detected.push("Conversational");
  const summary = `Detected "${detected[0]}" with elements of ${detected.length > 1 ? detected.slice(1).join(", ") : "a plain register"}. Hooks that follow this voice can convert higher for an existing audience.`;
  return { detected, summary, source: "heuristic" };
}

export const ANGLE_BY_PSYCH: Record<string, string> = {
  "Curiosity gap": "Curiosity gap",
  "Data-backed": "Data-backed",
  Contrarian: "Contrarian",
  "Loss aversion": "Loss aversion",
  "Social proof": "Social proof",
  Specificity: "Specificity",
  Authority: "Authority",
  "Story-driven": "Story-driven",
  "Identity / ego": "Identity / ego",
  Identity: "Identity / ego",
  Misdirection: "Misdirection",
};
