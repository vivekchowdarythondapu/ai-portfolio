"use client";

import { useEffect, useState } from "react";
import AchievementsSection from "@/components/AchievementsSection";
import ChatWidget from "@/components/ChatWidget";
import ContactSection from "@/components/ContactSection";
import FadeIn from "@/components/FadeIn";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";
import { fetchProfile, type Profile } from "@/lib/api";

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch(() =>
        setError("Could not reach the backend. Start it with: uvicorn main:app --reload (port 8000)"),
      );
  }, []);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center">
          <p className="text-2xl">🔌</p>
          <p className="mt-3 text-sm text-red-200">{error}</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero profile={profile} />

        <SkillsSection profile={profile} />
        <ProjectsSection profile={profile} />
        <AchievementsSection profile={profile} />

        {/* Experience */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <FadeIn>
            <h2 className="text-3xl font-bold md:text-4xl">
              Experience<span className="text-gradient">.</span>
            </h2>
          </FadeIn>
          <div className="mt-10 space-y-6">
            {profile.experience.map((job, i) => (
              <FadeIn key={`${job.company}-${i}`} delay={i * 0.1}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-indigo-400/30">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-100">
                      {job.role} · <span className="text-indigo-300">{job.company}</span>
                    </h3>
                    <span className="text-sm text-gray-500">{job.period}</span>
                  </div>
                  <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-400">
                    {job.highlights.map((h, j) => (
                      <li key={j}>{h}</li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <ContactSection profile={profile} />

        <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {profile.name} · Built with Next.js + FastAPI + OpenAI
        </footer>
      </main>

      <ChatWidget />
    </>
  );
}
