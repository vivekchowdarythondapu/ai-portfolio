"use client";

import FadeIn from "@/components/FadeIn";
import SectionDecor from "@/components/SectionDecor";
import type { Education } from "@/lib/api";

export default function EducationSection({ education }: { education: Education[] }) {
  if (!education || education.length === 0) return null;

  return (
    <section id="education" className="relative mx-auto max-w-6xl px-6 py-20">
      <SectionDecor c1="#2dd4bf" c2="#38bdf8" glyphs={["🎓", "📚", "🏫", "✏️", "🔭", "📖"]} />
      <FadeIn>
        <h2 className="text-3xl font-bold md:text-4xl">
          Education<span className="text-gradient">.</span>
        </h2>
      </FadeIn>

      <div className="mt-10 space-y-6">
        {education.map((ed, i) => (
          <FadeIn key={`${ed.school}-${i}`} delay={i * 0.1}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-indigo-400/30">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-100">
                  {ed.degree} · <span className="text-indigo-300">{ed.school}</span>
                </h3>
                <span className="text-sm text-gray-500">{ed.period}</span>
              </div>
              {ed.detail && <p className="mt-2 text-sm text-gray-400">{ed.detail}</p>}
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
