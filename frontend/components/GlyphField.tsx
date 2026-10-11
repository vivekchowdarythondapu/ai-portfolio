"use client";

import { motion } from "framer-motion";

/**
 * Animated hero backdrop for detail pages: themed glyphs floating gently
 * over two blurred gradient orbs, positioned deterministically.
 */
export default function GlyphField({ glyphs, c1 = "#6366f1", c2 = "#22d3ee" }: {
  glyphs: string[];
  c1?: string;
  c2?: string;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-24 top-0 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle at center, ${c1}30, transparent 70%)` }}
        animate={{ y: [0, -26, 0], x: [0, 14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-20 top-24 h-80 w-80 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle at center, ${c2}28, transparent 70%)` }}
        animate={{ y: [0, 22, 0], x: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {glyphs.map((g, i) => {
        const left = ((i * 97) % 92) + 2;
        const top = ((i * 61) % 74) + 4;
        const size = 1.3 + ((i * 17) % 12) / 7; // 1.3rem .. ~3rem
        return (
          <motion.span
            key={i}
            className="absolute select-none text-white/10"
            style={{ left: `${left}%`, top: `${top}%`, fontSize: `${size}rem` }}
            animate={{ y: [0, -20, 0], rotate: [-6, 6, -6], opacity: [0.05, 0.16, 0.05] }}
            transition={{ duration: 6 + (i % 5) * 1.4, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
          >
            {g}
          </motion.span>
        );
      })}
    </div>
  );
}
