"use client";

import FadeIn from "@/components/FadeIn";
import Image from "next/image";
import type { Profile } from "@/lib/api";

export default function ContactSection({ profile }: { profile: Profile }) {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/15 via-transparent to-cyan-500/10 p-10 text-center md:p-16">
          <div className="mx-auto mb-6 inline-block rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-purple-500 p-1 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
            <Image
              src="/profile.jpg"
              alt="Vivek Chowdary"
              width={96}
              height={96}
              className="h-20 w-20 rounded-full bg-white object-cover md:h-24 md:w-24"
            />
          </div>
          <h2 className="text-3xl font-bold md:text-4xl">
            Let&apos;s work together<span className="text-gradient">.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            Open to full-time roles, freelance projects and interesting collaborations.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="rounded-full bg-indigo-600 px-7 py-3 font-medium text-white shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              {profile.email}
            </a>
            {profile.contact.phone && (
              <a
                href={`tel:${profile.contact.phone.replace(/\s/g, "")}`}
                className="rounded-full border border-white/15 px-6 py-3 text-gray-200 transition hover:-translate-y-0.5 hover:border-white/40"
              >
                📞 {profile.contact.phone}
              </a>
            )}
            <a
              href={profile.contact.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 px-6 py-3 text-gray-200 transition hover:-translate-y-0.5 hover:border-white/40"
            >
              GitHub
            </a>
            <a
              href={profile.contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 px-6 py-3 text-gray-200 transition hover:-translate-y-0.5 hover:border-white/40"
            >
              LinkedIn
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              ⬇ Download resume
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            💡 Tip: use the AI chat (bottom-right) to auto-generate a quick intro email about me.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
