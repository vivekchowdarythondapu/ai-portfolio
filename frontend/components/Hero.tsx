"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import type { Profile } from "@/lib/api";

export default function Hero({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  return (
    <section id="top" ref={ref} className="relative overflow-hidden pb-24 pt-36">
      {/* floating gradient orbs */}
      <motion.div className="orb left-[10%] top-24 h-72 w-72 bg-indigo-600" style={{ y: orbY }} />
      <motion.div className="orb right-[8%] top-40 h-64 w-64 bg-cyan-500" style={{ y: orbY }} />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-block rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-purple-500 p-1 shadow-[0_0_50px_rgba(99,102,241,0.35)]"
        >
          <Image
            src="/profile.jpg"
            alt="Vivek Chowdary"
            width={128}
            height={128}
            priority
            className="h-24 w-24 rounded-full bg-white object-cover md:h-32 md:w-32"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300"
        >
          👋 Welcome — ask my AI assistant anything about me
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ y: titleY }}
          className="text-5xl font-extrabold leading-tight tracking-tight md:text-7xl"
        >
          Hi, I&apos;m <span className="text-gradient">{profile.name}</span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 text-2xl font-medium text-gray-400 md:text-3xl"
        >
          {profile.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ y: textY }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-400"
        >
          {profile.summary}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-9 flex flex-wrap gap-4"
        >
          <a
            href="#projects"
            className="rounded-full bg-indigo-600 px-7 py-3 font-medium text-white shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            View my work
          </a>
          <a
            href="#contact"
            className="rounded-full border border-white/15 px-7 py-3 font-medium text-gray-200 transition hover:-translate-y-0.5 hover:border-white/40"
          >
            Get in touch
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 px-7 py-3 font-medium text-gray-200 transition hover:-translate-y-0.5 hover:border-white/40"
          >
            ⬇ Resume
          </a>
        </motion.div>
      </div>
    </section>
  );
}
