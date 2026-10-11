"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import FadeIn from "@/components/FadeIn";
import SectionDecor from "@/components/SectionDecor";
import TiltCard from "@/components/TiltCard";

export type TimelineEntry = {
  icon: string;
  title: string;
  subtitle: string;
  period?: string;
  bullets?: string[];
  text?: string;
};

/**
 * Animated timeline used for Experience and Education.
 * The center rail "draws itself" as you scroll; glowing nodes pulse at
 * each entry and the cards alternate sides with the 3D tilt effect.
 */
export default function TimelineSection({
  id,
  title,
  c1,
  c2,
  glyphs,
  entries,
}: {
  id: string;
  title: string;
  c1: string;
  c2: string;
  glyphs: string[];
  entries: TimelineEntry[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const draw = useSpring(scrollYProgress, { stiffness: 70, damping: 20, restDelta: 0.001 });

  if (entries.length === 0) return null;

  return (
    <section id={id} className="relative mx-auto max-w-6xl px-6 py-20">
      <SectionDecor c1={c1} c2={c2} glyphs={glyphs} />

      <FadeIn>
        <h2 className="text-3xl font-bold md:text-4xl">
          {title}
          <span className="text-gradient">.</span>
        </h2>
      </FadeIn>

      <div ref={ref} className="relative mt-12">
        {/* rail: dim base line + glowing progress line that draws on scroll */}
        <div aria-hidden className="absolute left-[11px] top-0 h-full w-px bg-white/10 md:left-1/2" />
        <motion.div
          aria-hidden
          style={{
            scaleY: draw,
            originY: 0,
            background: `linear-gradient(to bottom, ${c1}, ${c2})`,
          }}
          className="absolute left-[11px] top-0 h-full w-px shadow-[0_0_12px_rgba(99,102,241,0.6)] md:left-1/2"
        />

        <div className="space-y-10 md:space-y-16">
          {entries.map((e, i) => (
            <FadeIn key={`${e.title}-${i}`}>
              <div className="relative pl-10 md:grid md:grid-cols-2 md:gap-12 md:pl-0">
                {/* glowing node on the rail */}
                <div className="absolute left-[11px] top-2 flex -translate-x-1/2 items-center justify-center md:left-1/2">
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    <span
                      aria-hidden
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40"
                      style={{ background: c1 }}
                    />
                    <span
                      className="relative h-2.5 w-2.5 rounded-full ring-[3px] ring-[#0b0c16]"
                      style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}
                    />
                  </span>
                </div>

                {/* card alternates left / right of the rail */}
                <div className={i % 2 === 0 ? "md:col-start-1 md:pr-12" : "md:col-start-2 md:pl-12"}>
                  <TiltCard maxTilt={4} className="h-full">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-indigo-400/30">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-lg font-semibold text-gray-100">
                          <span className="mr-1">{e.icon}</span>
                          {e.title} · <span style={{ color: c1 }}>{e.subtitle}</span>
                        </h3>
                        {e.period && (
                          <span
                            className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400"
                            style={{ boxShadow: `inset 0 0 0 1px ${c1}44` }}
                          >
                            {e.period}
                          </span>
                        )}
                      </div>
                      {e.bullets && (
                        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-400">
                          {e.bullets.map((b, j) => (
                            <li key={j}>{b}</li>
                          ))}
                        </ul>
                      )}
                      {e.text && <p className="mt-2 text-sm leading-relaxed text-gray-400">{e.text}</p>}
                    </div>
                  </TiltCard>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
