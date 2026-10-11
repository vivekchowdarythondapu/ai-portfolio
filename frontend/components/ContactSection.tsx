"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import FadeIn from "@/components/FadeIn";
import type { Profile } from "@/lib/api";

export default function ContactSection({ profile }: { profile: Profile }) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(profile.email);
      ok = true;
    } catch {
      // fallback for older or clipboard-restricted browsers
      try {
        const ta = document.createElement("textarea");
        ta.value = profile.email;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  }

  type Btn = { key: string; href?: string; onClick?: () => void; label: ReactNode; primary?: boolean };
  const buttons: Btn[] = [
    {
      key: "email",
      onClick: copyEmail,
      label: copied ? "✓ Email copied!" : `📧 ${profile.email}`,
      primary: true,
    },
    ...(profile.contact.phone
      ? [
          {
            key: "phone",
            href: `tel:${profile.contact.phone.replace(/\s/g, "")}`,
            label: `📞 ${profile.contact.phone}`,
          } as Btn,
        ]
      : []),
    { key: "github", href: profile.contact.github, label: "GitHub" },
    { key: "linkedin", href: profile.contact.linkedin, label: "LinkedIn" },
    {
      key: "resume",
      href: "/resume.pdf",
      label: "⬇ Resume",
    },
  ];

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl p-px">
          {/* rotating beam — a light sweeps around the card's rim forever */}
          <motion.div
            aria-hidden
            className="absolute inset-[-250%]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0 32%, rgba(129,140,248,0.9) 42%, rgba(34,211,238,0.9) 50%, transparent 58% 100%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 7 }}
          />

          <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#0b0c16]/95 px-8 py-14 text-center backdrop-blur-md md:px-16">
            {/* drifting glow orbs inside the card */}
            <motion.div
              aria-hidden
              className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-indigo-600/25 blur-3xl"
              animate={{ x: [0, 26, 0], y: [0, 18, 0] }}
              transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"
              animate={{ x: [0, -22, 0], y: [0, -16, 0] }}
              transition={{ repeat: Infinity, duration: 11, ease: "easeInOut", delay: 0.6 }}
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-sm font-medium uppercase tracking-[0.3em] text-indigo-300"
            >
              Get in touch
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-3 text-3xl font-bold md:text-5xl"
            >
              Let&apos;s work together<span className="text-gradient">.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mx-auto mt-4 max-w-xl text-gray-400"
            >
              Open to full-time roles, freelance projects and interesting collaborations.
            </motion.p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              {buttons.map((b, i) => {
                const cls = `rounded-full px-6 py-3 text-sm font-medium transition ${
                  b.primary
                    ? copied && b.key === "email"
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
                    : "border border-white/15 text-gray-200 hover:border-white/40"
                }`;
                const anim = {
                  initial: { opacity: 0, y: 16 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true as const },
                  transition: { duration: 0.45, delay: 0.25 + i * 0.08 },
                  whileHover: { y: -4 },
                };
                return b.onClick ? (
                  <motion.button key={b.key} onClick={b.onClick} className={cls} {...anim}>
                    {b.label}
                  </motion.button>
                ) : (
                  <motion.a
                    key={b.key}
                    href={b.href}
                    target={b.href?.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className={cls}
                    {...anim}
                  >
                    {b.label}
                  </motion.a>
                );
              })}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-7 text-sm text-gray-500"
            >
              …or{" "}
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email}&su=${encodeURIComponent("Hello Vivek — from your portfolio")}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 underline underline-offset-4 transition hover:text-indigo-300"
              >
                compose an email
              </a>{" "}
              · 💡 tip: use the AI chat (bottom-right) to auto-generate a quick intro email about me.
            </motion.p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
