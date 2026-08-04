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
