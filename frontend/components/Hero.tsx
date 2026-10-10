"use client";

import { motion } from "framer-motion";
import type { Profile } from "@/lib/api";

export default function Hero({ profile }: { profile: Profile }) {
  return (
    <section id="top" className="relative overflow-hidden pb-24 pt-36">
      {/* floating gradient orbs */}
      <div className="orb left-[10%] top-24 h-72 w-72 bg-indigo-600" />
      <div className="orb right-[8%] top-40 h-64 w-64 bg-cyan-500" style={{ animationDelay: "-4s" }} />

      <div className="relative mx-auto max-w-6xl px-6">
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
            href={`mailto:${profile.email}`}
            className="rounded-full border border-white/15 px-7 py-3 font-medium text-gray-200 transition hover:-translate-y-0.5 hover:border-white/40"
          >
            Get in touch
          </a>
        </motion.div>
      </div>
    </section>
  );
}
