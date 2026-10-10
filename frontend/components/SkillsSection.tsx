"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import type { AddedSkill, Profile } from "@/lib/api";

const CATEGORY_LABELS: Record<string, string> = {
  languages: "Languages",
  frontend: "Frontend",
  backend: "Backend",
  ai: "AI",
  tools: "Tools",
};

export default function SkillsSection({ profile }: { profile: Profile }) {
  const groups = Object.entries(profile.skills).filter(
    (entry): entry is [string, string[]] =>
      entry[0] !== "added" && Array.isArray(entry[1]),
  );
  const added: AddedSkill[] = Array.isArray(profile.skills.added)
    ? profile.skills.added
    : [];

  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-20">
      <FadeIn>
        <h2 className="text-3xl font-bold md:text-4xl">
          Skills<span className="text-gradient">.</span>
        </h2>
        <p className="mt-2 text-gray-400">The tools I work with every day.</p>
      </FadeIn>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(([group, items], i) => (
          <FadeIn key={group} delay={i * 0.08}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-indigo-400/40 hover:bg-white/[0.06]">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-300">
                {CATEGORY_LABELS[group] ?? group}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-gray-200 ring-1 ring-white/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        ))}
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
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
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
