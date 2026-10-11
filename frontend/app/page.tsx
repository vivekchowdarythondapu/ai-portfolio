"use client";

import { useEffect, useState } from "react";
import AchievementsSection from "@/components/AchievementsSection";
import ChatWidget from "@/components/ChatWidget";
import ContactSection from "@/components/ContactSection";
import EducationSection from "@/components/EducationSection";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";
import TimelineSection from "@/components/TimelineSection";
import { fetchProfile, type Profile } from "@/lib/api";
import ParticleField from "@/components/ParticleField";

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
      <ParticleField />
      <Navbar />
      <main>
        <Hero profile={profile} />

        <SkillsSection profile={profile} />
        <ProjectsSection profile={profile} />
        <AchievementsSection profile={profile} />

        <TimelineSection
          id="experience"
          title="Experience"
          c1="#22d3ee"
          c2="#818cf8"
          glyphs={["🔬", "🧠", "📡", "📝", "💡", "🎓"]}
          entries={profile.experience.map((job) => ({
            icon: "🔬",
            title: job.role,
            subtitle: job.company,
            period: job.period,
            bullets: job.highlights,
          }))}
        />

        <EducationSection education={profile.education ?? []} />

        <ContactSection profile={profile} />

        <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {profile.name} · Built with Next.js + FastAPI + Google Gemini
        </footer>
      </main>

      <ChatWidget />
    </>
  );
}
