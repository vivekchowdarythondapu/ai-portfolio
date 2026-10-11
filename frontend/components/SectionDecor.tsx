"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type Props = {
  c1?: string;
  c2?: string;
  glyphs?: string[];
};

/**
 * Parallax decoration layered behind a section (section needs `relative`).
 * Two blurred gradient orbs drift in opposite directions as you scroll,
 * plus a faint fading grid and optional floating themed glyphs.
 */
export default function SectionDecor({ c1 = "#6366f1", c2 = "#22d3ee", glyphs = [] }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yA = useTransform(scrollYProgress, [0, 1], [110, -110]);
  const yB = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        style={{ y: yA, background: `radial-gradient(circle at center, ${c1}2e, transparent 70%)` }}
        className="absolute -left-28 top-0 h-96 w-96 rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: yB, background: `radial-gradient(circle at center, ${c2}24, transparent 70%)` }}
        className="absolute -right-24 bottom-0 h-80 w-80 rounded-full blur-3xl"
      />

      {/* faint grid that fades out at the edges */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(${c1} 1px, transparent 1px), linear-gradient(90deg, ${c1} 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
        }}
      />

      {glyphs.map((g, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl text-white/10"
          style={{ left: `${(i * 83) % 90 + 3}%`, top: `${(i * 47) % 82 + 6}%` }}
          animate={{ y: [0, -16, 0], rotate: [-5, 5, -5], opacity: [0.05, 0.14, 0.05] }}
          transition={{ duration: 7 + (i % 4) * 1.5, repeat: Infinity, delay: i * 0.7, ease: "easeInOut" }}
        >
          {g}
        </motion.span>
      ))}
    </div>
  );
}
