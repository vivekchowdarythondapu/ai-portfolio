"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import FadeIn from "@/components/FadeIn";
import GlyphField from "@/components/GlyphField";
import Navbar from "@/components/Navbar";
import { fetchProfile, mediaUrl, slugify, type Achievement, type Profile } from "@/lib/api";
import { themeFor, type Theme } from "@/lib/themes";

export default function AchievementDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </main>
      }
    >
      <AchievementDetail />
    </Suspense>
  );
}

function AchievementDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchProfile().then(setProfile).catch(() => setFailed(true));
  }, []);

  const achievement: Achievement | undefined = useMemo(
    () => profile?.achievements.find((a) => slugify(a.title) === slug),
    [profile, slug],
  );
  const theme = useMemo(() => themeFor(achievement?.title ?? ""), [achievement]);

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

  if (!achievement) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl">🏅</p>
        <h1 className="text-2xl font-bold">Achievement not found</h1>
        <Link href="/#achievements" className="text-indigo-400 hover:text-indigo-300">
          ← Back to all achievements
        </Link>
      </main>
    );
  }

  return <AchievementView achievement={achievement} theme={theme} ownerName={profile.name} />;
}

function AchievementView({
  achievement,
  theme,
  ownerName,
}: {
  achievement: Achievement;
  theme: Theme;
  ownerName: string;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -70]);

  const images = useMemo(() => {
    if (achievement.images?.length) return achievement.images;
    return achievement.image ? [achievement.image] : [];
  }, [achievement]);

  const paragraphs = useMemo(
    () =>
      (achievement.details ?? achievement.description ?? "")
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean),
    [achievement],
  );

  // close lightbox with Escape
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <>
      <Navbar />

      {/* ------------------------------------------------ hero */}
      <section ref={heroRef} className="relative overflow-hidden pb-10 pt-32">
        <GlyphField glyphs={theme.glyphs} c1={theme.c1} c2={theme.c2} />

        <div className="relative mx-auto max-w-4xl px-6">
          <Link href="/#achievements" className="text-sm text-indigo-400 transition hover:text-indigo-300">
            ← All achievements
          </Link>

          <motion.h1
            style={{ y: titleY, backgroundImage: `linear-gradient(90deg, ${theme.c1}, ${theme.c2})` }}
            className="mt-4 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl"
          >
            {achievement.title}
          </motion.h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {achievement.date && (
              <span
                className="rounded-full px-3 py-1 text-xs font-medium text-gray-200"
                style={{ background: `${theme.c1}1f`, boxShadow: `inset 0 0 0 1px ${theme.c1}55` }}
              >
                📅 {achievement.date}
              </span>
            )}
            {images.length > 1 && (
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400 ring-1 ring-white/10">
                📷 {images.length} photos — click to enlarge
              </span>
            )}
          </div>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-300">{achievement.description}</p>
        </div>
      </section>

      {/* ------------------------------------------------ gallery */}
      {images.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 pt-6">
          <FadeIn>
            <button
              type="button"
              onClick={() => setLightbox(images[0])}
              className="group block w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/25"
              style={{ boxShadow: `0 20px 60px -30px ${theme.c1}66` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(images[0])}
                alt={achievement.title}
                className="max-h-[70vh] w-full rounded-xl bg-black/40 object-contain transition duration-500 group-hover:scale-[1.01]"
              />
            </button>
          </FadeIn>

          {images.length > 1 && (
            <FadeIn className="mt-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {images.slice(1).map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setLightbox(src)}
                    className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-2 transition hover:border-white/25"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl(src)}
                      alt={achievement.title}
                      className="h-40 w-full rounded-lg object-cover transition duration-500 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            </FadeIn>
          )}
        </section>
      )}

      {/* ------------------------------------------------ story */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        {paragraphs.map((p, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <p className="mt-5 leading-relaxed text-gray-400">{p}</p>
          </FadeIn>
        ))}

        <FadeIn className="mt-14">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-gray-400">See the full collection of my milestones.</p>
            <Link
              href="/#achievements"
              className="mt-3 inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              style={{ background: `linear-gradient(90deg, ${theme.c1}, ${theme.c2})` }}
            >
              ← All achievements
            </Link>
          </div>
        </FadeIn>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {ownerName}
      </footer>

      {/* ------------------------------------------------ lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          >
            <motion.img
              src={mediaUrl(lightbox)}
              alt={achievement.title}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close image"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
