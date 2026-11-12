import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "../motion/useScrollReveal";

const EASE = [0.22, 1, 0.36, 1];

// Draws a stroke in, and takes it back out when the element is below the viewport again.
function drawProps(reduce, play, delay, i, duration) {
  if (reduce) return { initial: false };
  return {
    initial: { pathLength: 0, opacity: 0 },
    animate: play
      ? {
          pathLength: 1,
          opacity: 1,
          transition: { duration, delay: delay + i * 0.1, ease: EASE },
        }
      : { pathLength: 0, opacity: 0, transition: { duration: 0.2 } },
  };
}

const FLICKS = [
  "M6 44 C 8 28, 20 14, 38 8",
  "M18 52 C 22 38, 34 28, 54 26",
  "M2 28 C 3 20, 8 14, 15 10",
];

/* Three splayed curved strokes. Color comes from the text color class. */
export function Flicks({ className = "", delay = 0, inView = false }) {
  const reduce = useReducedMotion();
  const [ref, shown] = useScrollReveal({ enabled: inView });
  const play = inView ? shown : true;

  return (
    <svg
      ref={ref}
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden
      className={className}
      style={{ overflow: "visible" }}
    >
      {FLICKS.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          {...drawProps(reduce, play, delay, i, 0.7)}
        />
      ))}
    </svg>
  );
}

/* Parallel flowing lines that stretch to fill their container.
   accentLine is the index of one line drawn in accentColor. */
export function FlowLines({
  className = "",
  count = 7,
  gap = 24,
  delay = 0,
  inView = false,
  accentLine = -1,
  accentColor = "var(--color-accent)",
}) {
  const reduce = useReducedMotion();
  const [ref, shown] = useScrollReveal({ enabled: inView });
  const play = inView ? shown : true;

  const lines = Array.from({ length: count }, (_, i) => {
    const y = 150 + i * gap;
    return `M -20 ${y + 60} C 140 ${y - 90}, 300 ${y + 170}, 470 ${y + 10} S 620 ${y - 50}, 680 ${y - 20}`;
  });

  return (
    <svg
      ref={ref}
      viewBox="0 0 640 520"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
      className={`absolute inset-0 h-full w-full ${className}`}
    >
      {lines.map((d, i) => {
        const accent = i === accentLine;
        return (
          <motion.path
            key={d}
            d={d}
            stroke={accent ? accentColor : "currentColor"}
            strokeWidth={accent ? 1.75 : 1.25}
            vectorEffect="non-scaling-stroke"
            {...drawProps(reduce, play, delay, i, 1.8)}
          />
        );
      })}
    </svg>
  );
}