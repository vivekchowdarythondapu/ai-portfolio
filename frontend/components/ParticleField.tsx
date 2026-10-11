"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; r: number; vx: number; vy: number; hue: number; a: number };

const HUES = [225, 195, 260, 285]; // indigo / cyan / purple / violet

/**
 * Full-page animated background: soft glowing particles drifting slowly upward.
 * Sits behind all content (-z-10) and respects reduced-motion preferences.
 */
export default function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: P[] = [];
    let raf = 0;

    function spawn(w: number, h: number): P {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.14,
        vy: -0.05 - Math.random() * 0.22,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
        a: 0.12 + Math.random() * 0.35,
      };
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: Math.round(w / 24) }, () => spawn(w, h));
    }

    function draw() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);
      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue}, 90%, 72%, ${p.a})`;
        ctx!.fill();
      }
    }

    function tick() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -12) Object.assign(p, spawn(w, h), { y: h + 12 });
        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;
      }
      draw();
      raf = requestAnimationFrame(tick);
    }

    resize();
    if (reduced) draw();
    else tick();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
