"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import FadeIn from "@/components/FadeIn";
import GlyphField from "@/components/GlyphField";
import Navbar from "@/components/Navbar";
import { fetchProfile, mediaUrl, slugify, type Profile, type Project } from "@/lib/api";
import { themeFor, type Theme } from "@/lib/themes";

export default function ProjectDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </main>
      }
    >
      <ProjectDetail />
    </Suspense>
  );
}

function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchProfile().then(setProfile).catch(() => setFailed(true));
  }, []);

  const project: Project | undefined = useMemo(
    () => profile?.projects.find((p) => slugify(p.name) === slug),
    [profile, slug],
  );
  const theme = useMemo(() => themeFor(project?.name ?? ""), [project]);

  if (failed) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center text-sm text-red-200">
          Could not reach the backend. Start it with: uvicorn main:app --port 8000
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

  if (!project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl">🛰️</p>
        <h1 className="text-2xl font-bold">Project not found</h1>
        <Link href="/#projects" className="text-indigo-400 hover:text-indigo-300">
          ← Back to all projects
        </Link>
      </main>
    );
  }

  return <ProjectView project={project} theme={theme} ownerName={profile.name} />;
}

function ProjectView({ project, theme, ownerName }: { project: Project; theme: Theme; ownerName: string }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -70]);

  const paragraphs = useMemo(
    () =>
      (project.details ?? project.description ?? "")
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean),
    [project],
  );

  return (
    <>
      <Navbar />

      {/* ------------------------------------------------ hero */}
      <section ref={heroRef} className="relative overflow-hidden pb-14 pt-32">
        <GlyphField glyphs={theme.glyphs} c1={theme.c1} c2={theme.c2} />

        <div className="relative mx-auto max-w-4xl px-6">
          <Link href="/#projects" className="text-sm text-indigo-400 transition hover:text-indigo-300">
            ← All projects
          </Link>

          <motion.h1
            style={{ y: titleY, backgroundImage: `linear-gradient(90deg, ${theme.c1}, ${theme.c2})` }}
            className="mt-4 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-6xl"
          >
            {project.name}
          </motion.h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-300">{project.description}</p>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300"
                style={{ boxShadow: `inset 0 0 0 1px ${theme.c1}55` }}
              >
                {t}
              </span>
            ))}
          </div>

          {project.link && (
            <div className="mt-8">
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                style={{ background: `linear-gradient(90deg, ${theme.c1}, ${theme.c2})`, boxShadow: `0 10px 30px -10px ${theme.c1}80` }}
              >
                View code ↗
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------ overview */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <FadeIn>
          <h2 className="text-2xl font-bold">
            Overview<span className="text-gradient">.</span>
          </h2>
        </FadeIn>
        {paragraphs.map((p, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <p className="mt-5 leading-relaxed text-gray-400">{p}</p>
          </FadeIn>
        ))}
      </section>

      {/* ------------------------------------------------ built with */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <FadeIn>
          <h2 className="text-2xl font-bold">
            Built with<span className="text-gradient">.</span>
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {project.tech.map((t) => (
              <div
                key={t}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center text-sm font-medium text-gray-200 transition hover:-translate-y-1"
              >
                {t}
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn className="mt-14">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-gray-400">Want to see the rest of my work?</p>
            <Link
              href="/#projects"
              className="mt-3 inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              style={{ background: `linear-gradient(90deg, ${theme.c1}, ${theme.c2})` }}
            >
              ← All projects
            </Link>
          </div>
        </FadeIn>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {ownerName}
      </footer>
    </>
  );
}
