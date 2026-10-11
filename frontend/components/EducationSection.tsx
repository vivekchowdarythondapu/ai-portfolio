"use client";

import TimelineSection from "@/components/TimelineSection";
import type { Education } from "@/lib/api";

export default function EducationSection({ education }: { education: Education[] }) {
  if (!education || education.length === 0) return null;

  return (
    <TimelineSection
      id="education"
      title="Education"
      c1="#2dd4bf"
      c2="#38bdf8"
      glyphs={["🎓", "📚", "🏫", "✏️", "🔭", "📖"]}
      entries={education.map((ed) => ({
        icon: "🎓",
        title: ed.degree,
        subtitle: ed.school,
        period: ed.period,
        text: ed.detail,
      }))}
    />
  );
}
