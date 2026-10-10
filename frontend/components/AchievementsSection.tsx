"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { mediaUrl, type Profile } from "@/lib/api";

export default function AchievementsSection({ profile }: { profile: Profile }) {
  const achievements = profile.achievements ?? [];

  return (
    <section id="achievements" className="mx-auto max-w-6xl px-6 py-20">
      <FadeIn>
        <h2 className="text-3xl font-bold md:text-4xl">
          Achievements<span className="text-gradient">.</span>
        </h2>
        <p className="mt-2 text-gray-400">Certifications, awards and milestones.</p>
      </FadeIn>

      {achievements.length === 0 ? (
        <FadeIn className="mt-10">
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-gray-500">
            No achievements yet — add one from the{" "}
            <a href="/add" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              content dashboard
            </a>{" "}
            (images supported 📷)
          </div>
        </FadeIn>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a, i) => (
            <FadeIn key={a.id ?? `${a.title}-${i}`} delay={(i % 3) * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-amber-400/40"
              >
                {a.image ? (
                  <div className="relative h-44 overflow-hidden">
                    <motion.img
                      src={mediaUrl(a.image)}
                      alt={a.title}
                      className="h-full w-full object-cover"
                      whileHover={{ scale: 1.06 }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-3xl">
                    🏆
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-100">{a.title}</h3>
                    {a.date && <span className="text-xs text-gray-500">{a.date}</span>}
                  </div>
                  {a.description && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">{a.description}</p>
                  )}
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  );
}
