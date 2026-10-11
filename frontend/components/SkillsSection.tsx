"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import FadeIn from "@/components/FadeIn";
import SectionDecor from "@/components/SectionDecor";
import TiltCard from "@/components/TiltCard";
import type { AddedSkill, Profile } from "@/lib/api";

const CATEGORY_META: Record<string, { label: string; icon: string; c1: string; c2: string }> = {
  languages: { label: "Languages", icon: "⌨️", c1: "#818cf8", c2: "#22d3ee" },
  frontend: { label: "Frontend", icon: "🎨", c1: "#f472b6", c2: "#a855f7" },
  backend: { label: "Backend", icon: "⚙️", c1: "#f59e0b", c2: "#f97316" },
  databases: { label: "Databases", icon: "🗄️", c1: "#34d399", c2: "#14b8a6" },
  ai: { label: "AI / ML", icon: "🤖", c1: "#c084fc", c2: "#ec4899" },
  core: { label: "Core CS", icon: "🧠", c1: "#38bdf8", c2: "#6366f1" },
  tools: { label: "Tools & Deployment", icon: "🛠️", c1: "#94a3b8", c2: "#22d3ee" },
};

const FALLBACK = { label: "", icon: "✨", c1: "#818cf8", c2: "#22d3ee" };

export default function SkillsSection({ profile }: { profile: Profile }) {
  const groups = Object.entries(profile.skills).filter(
    (entry): entry is [string, string[]] =>
      entry[0] !== "added" && Array.isArray(entry[1]),
  );
  const added: AddedSkill[] = Array.isArray(profile.skills.added)
    ? profile.skills.added
    : [];

  return (
    <section id="skills" className="relative mx-auto max-w-6xl px-6 py-20">
      <SectionDecor c1="#818cf8" c2="#22d3ee" glyphs={["🛠️", "🧩", "⚡", "⚙️", "💻", "🔍"]} />
      <FadeIn>
        <h2 className="text-3xl font-bold md:text-4xl">
          Skills<span className="text-gradient">.</span>
        </h2>
        <p className="mt-2 text-gray-400">The tools I work with every day.</p>
      </FadeIn>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(([group, items], i) => {
          const meta = CATEGORY_META[group] ?? { ...FALLBACK, label: group };
          return (
            <FadeIn key={group} delay={i * 0.08} className="h-full">
              <TiltCard maxTilt={5} className="h-full">
                <div
                  className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-indigo-400/40 hover:bg-white/[0.06]"
                  style={{ "--c1": meta.c1 } as CSSProperties}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3
                      className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"
                      style={{ color: meta.c1 }}
                    >
                      <span aria-hidden>{meta.icon}</span>
                      {meta.label}
                    </h3>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-gray-400 ring-1 ring-white/10">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill, j) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8, y: 6 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 22,
                          delay: j * 0.03,
                        }}
                        whileHover={{ y: -2, scale: 1.06 }}
                        className="cursor-default rounded-full bg-white/5 px-3 py-1.5 text-sm text-gray-200 ring-1 ring-white/10 transition-colors hover:text-white hover:shadow-[0_0_16px_var(--c1)]"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </FadeIn>
          );
        })}
      </div>

      {added.length > 0 && (
        <FadeIn className="mt-6">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.04] p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">
              Added via the dashboard
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {added.map((s, i) => (
                <div key={s.id ?? `${s.name}-${i}`} className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-100">{s.name}</span>
                    <span className="text-xs text-gray-500">{s.category}</span>
                  </div>
                  {typeof s.level === "number" && (
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}
    </section>
  );
}
