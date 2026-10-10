"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { mediaUrl, type Profile } from "@/lib/api";

export default function ProjectsSection({ profile }: { profile: Profile }) {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-20">
      <FadeIn>
        <h2 className="text-3xl font-bold md:text-4xl">
          Projects<span className="text-gradient">.</span>
        </h2>
        <p className="mt-2 text-gray-400">Things I&apos;ve built.</p>
      </FadeIn>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {profile.projects.map((project, i) => (
          <FadeIn key={project.id ?? project.name} delay={i * 0.1}>
            <motion.article
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-indigo-400/40"
            >
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
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 transition hover:text-indigo-300"
                      aria-label={`Open ${project.name}`}
                    >
                      ↗
                    </a>
                  )}
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-400">
                  {project.description}
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
            </motion.article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
