"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#achievements", label: "Achievements" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[#07070d]/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="text-lg font-bold tracking-tight">
          <span className="text-gradient">{"<Dev />"}</span>
        </a>

        <div className="hidden items-center gap-7 text-sm text-gray-300 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/add"
            className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-4 py-1.5 text-indigo-300 transition hover:bg-indigo-500/20"
          >
            + Add content
          </Link>
        </div>

        <Link href="/add" className="text-sm text-indigo-300 md:hidden">
          + Add
        </Link>
      </div>
    </nav>
  );
}
