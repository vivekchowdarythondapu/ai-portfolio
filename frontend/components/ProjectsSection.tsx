"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import SectionDecor from "@/components/SectionDecor";
import { slugify, mediaUrl, type Profile } from "@/lib/api";

const DECOR_GLYPHS = ["</>", "🚀", "💻", "⚡", "⚛️", "🤖", "🧩", "📊"];

export default function ProjectsSection({ profile }: { profile: Profile }) {
  return (
    <section id="projects" className="relative mx-auto max-w-6xl px-6 py-20">
      <SectionDecor glyphs={DECOR_GLYPHS} />

      <FadeIn>
        <h2 className="text-3xl font-bold md:text-4xl">
          Projects<span className="text-gradient">.</span>
        </h2>
        <p className="mt-2 text-gray-400">Things I&apos;ve built — click any project for the full story.</p>
      </FadeIn>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {profile.projects.map((project, i) => (
          <FadeIn key={project.id ?? project.name} delay={i * 0.1} className="h-full">
            <motion.article
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-indigo-400/40"
            >
              <Link href={`/projects/${slugify(project.name)}`} className="flex flex-1 flex-col">
                {project.image && (
                  <img
                    src={mediaUrl(project.image)}
                    alt={project.name}
                    className="h-44 w-full object-cover opacity-90 transition group-hover:opacity-100"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-gray-100">{project.name}</h3>
                    <span
                      aria-hidden
                      className="text-indigo-400 opacity-0 transition group-hover:opacity-100"
                    >
                      →
                    </span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-400">
                    {project.description.length > 170
                      ? `${project.description.slice(0, 170)}…`
                      : project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300 ring-1 ring-indigo-400/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>

              {(project.demo || project.link) && (
                <div className="flex flex-wrap gap-3 border-t border-white/10 px-6 py-4">
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
                    >
                      🌐 Live demo ↗
                    </a>
                  )}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-gray-300 transition hover:border-white/40"
                    >
                      GitHub ↗
                    </a>
                  )}
                </div>
              )}
            </motion.article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
