"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Classes for the outer perspective wrapper (e.g. "h-full") */
  className?: string;
  /** Corner radius of the inner card — mirrored by the spotlight overlay */
  radiusClass?: string;
  /** RGB triplet for the spotlight glow (default: indigo) */
  tint?: string;
  /** Max tilt angle in degrees */
  maxTilt?: number;
};

/**
 * 3D tilt card — the card rotates toward the cursor with a soft spring,
 * and a radial spotlight follows the pointer across the surface.
 * Mouse-only (touch is ignored) and fully disabled for reduced-motion users.
 */
export default function TiltCard({
  children,
  className = "",
  radiusClass = "rounded-2xl",
  tint = "129,140,248",
  maxTilt = 7,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // normalized pointer position: -0.5 … 0.5 from the card centre
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hover = useMotionValue(0);

  const sx = useSpring(px, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 220, damping: 18, mass: 0.4 });
  const hoverS = useSpring(hover, { stiffness: 260, damping: 24 });

  const rotateX = useTransform(sy, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const spotlight = useTransform([sx, sy], ([x, y]: number[]) =>
    `radial-gradient(420px circle at ${x * 100 + 50}% ${y * 100 + 50}%, rgba(${tint},0.16), transparent 62%)`,
  );

  function onMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
    hover.set(1);
  }

  function onLeave() {
    px.set(0);
    py.set(0);
    hover.set(0);
  }

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div className={className} style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full"
      >
        {children}
        <motion.div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${radiusClass}`}
          style={{ background: spotlight, opacity: hoverS }}
        />
      </motion.div>
    </div>
  );
}
