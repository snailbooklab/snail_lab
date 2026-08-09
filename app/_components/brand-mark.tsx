"use client";

import { useId, useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * Signature brand device: a slow-rotating seal ring around the portrait,
 * plus a subtle pointer-tracked tilt on the portrait itself. Reused on
 * both the home hero and the about hero as the brand's one recurring
 * "meet the instructor" moment. Isolated as a client leaf per the
 * RSC/interactivity-isolation rule — pages stay Server Components.
 */
export function BrandMark({
  children,
  ringLabel,
  accent,
  size = 460,
}: {
  children: ReactNode;
  ringLabel: string;
  accent: string;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const pathId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 140, damping: 16 });
  const springY = useSpring(rotateY, { stiffness: 140, damping: 16 });

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 12);
    rotateX.set(py * -12);
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div className="relative mx-auto" style={{ width: size, height: size, maxWidth: "100%" }}>
      {/* rotating seal ring */}
      <motion.svg
        viewBox="0 0 300 300"
        className="pointer-events-none absolute inset-0 h-full w-full"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={reduce ? undefined : { duration: 42, repeat: Infinity, ease: "linear" }}
        aria-hidden
      >
        <defs>
          <path id={pathId} d="M 150,150 m -128,0 a 128,128 0 1,1 256,0 a 128,128 0 1,1 -256,0" />
        </defs>
        <text fontSize="11" fontWeight={600} letterSpacing="0.16em" fill={accent}>
          <textPath href={`#${pathId}`} startOffset="0%">
            {ringLabel}
          </textPath>
        </text>
      </motion.svg>

      {/* pointer-tilt portrait */}
      <div
        ref={wrapRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="absolute inset-0 grid place-items-center"
        style={{ perspective: 900 }}
      >
        <motion.div style={{ rotateX: springX, rotateY: springY }}>{children}</motion.div>
      </div>
    </div>
  );
}
