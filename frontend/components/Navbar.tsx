"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#skills", label: "Skills" },
  { href: "/#projects", label: "Projects" },
  { href: "/#achievements", label: "Achievements" },
  { href: "/#education", label: "Education" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled || menuOpen
          ? "border-b border-white/10 bg-[#07070d]/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      {/* scroll progress bar */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500"
        style={{ scaleX: progress }}
      />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/#top" className="flex items-center gap-2.5" aria-label="Back to top">
          <Image
            src="/profile.jpg"
            alt="Vivek Chowdary"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-400/40 transition hover:ring-indigo-400"
          />
          <span className="text-sm font-bold tracking-tight text-gray-100 md:block">
            Vivek Chowdary
          </span>
        </Link>

        {/* desktop links */}
        <div className="hidden items-center gap-7 text-sm text-gray-300 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 px-4 py-1.5 text-gray-200 transition hover:-translate-y-0.5 hover:border-white/40"
          >
            ⬇ Resume
          </a>
          <Link
            href="/add"
            className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-4 py-1.5 text-indigo-300 transition hover:bg-indigo-500/20"
          >
            + Add content
          </Link>
        </div>

        {/* mobile: hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="text-2xl text-gray-200 md:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* mobile panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 bg-[#07070d]/95 backdrop-blur-md md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 text-sm">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 transition-colors hover:text-white"
              >
                ⬇ Resume
              </a>
              <Link
                href="/add"
                onClick={() => setMenuOpen(false)}
                className="text-indigo-300 transition-colors hover:text-indigo-200"
              >
                + Add content
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
