// Themed accents + floating glyphs for detail pages and section decor.
// Theme is picked from the item's title/tech keywords.

export type Theme = {
  glyphs: string[];
  c1: string; // primary accent
  c2: string; // secondary accent
};

const RULES: { match: RegExp; theme: Theme }[] = [
  { match: /java\b/i, theme: { glyphs: ["☕", "{ }", "⚙️", "☕", "{ }", "J"], c1: "#f59e0b", c2: "#f97316" } },
  { match: /mongo/i, theme: { glyphs: ["🍃", "🗄️", "🍃", "📊", "🦣"], c1: "#22c55e", c2: "#10b981" } },
  { match: /ieee|paper|x-stroke|icoc?ecit/i, theme: { glyphs: ["📄", "🧠", "⚡", "✦", "📄", "🔭"], c1: "#38bdf8", c2: "#6366f1" } },
  { match: /hack|code4her/i, theme: { glyphs: ["🏆", "💻", "⚡", "🎉", "🏆", "🚀"], c1: "#a855f7", c2: "#f59e0b" } },
  { match: /quantum|vanet/i, theme: { glyphs: ["⚛️", "🔮", "🚀", "⚛️", "📶"], c1: "#22d3ee", c2: "#818cf8" } },
  { match: /lost|found/i, theme: { glyphs: ["🔎", "🎒", "📱", "🧭", "🏫"], c1: "#2dd4bf", c2: "#38bdf8" } },
  { match: /code review|reviewer/i, theme: { glyphs: ["🤖", "</>", "💻", "🧪", "🔍"], c1: "#818cf8", c2: "#c084fc" } },
  { match: /clientsync|invoice/i, theme: { glyphs: ["💼", "🧾", "📊", "🗂️", "💳"], c1: "#38bdf8", c2: "#34d399" } },
  { match: /portfolio|assistant/i, theme: { glyphs: ["✨", "🤖", "💬", "🚀", "🎨"], c1: "#6366f1", c2: "#22d3ee" } },
];

const FALLBACK: Theme = { glyphs: ["</>", "⚡", "✦", "💻", "🚀"], c1: "#6366f1", c2: "#22d3ee" };

export function themeFor(text: string): Theme {
  for (const rule of RULES) {
    if (rule.match.test(text)) return rule.theme;
  }
  return FALLBACK;
}
