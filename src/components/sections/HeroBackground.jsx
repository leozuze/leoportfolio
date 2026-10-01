import { useEffect } from "react";
import {
  motion, useMotionTemplate, useMotionValue, useReducedMotion,
  useScroll, useSpring, useTransform,
} from "framer-motion";

// Fixed coordinates (viewBox 1200x700) so the network never jumps between renders
const NODES = [
  [760, 90], [900, 170], [1040, 110], [1120, 260], [980, 330], [820, 280],
  [700, 400], [860, 480], [1010, 520], [1130, 450], [640, 220], [1080, 600],
];
const EDGES = [
  [0, 1], [1, 2], [2, 3], [1, 5], [5, 4], [4, 3], [5, 6], [6, 7],
  [7, 8], [8, 9], [4, 8], [0, 10], [10, 5], [9, 11], [8, 11],
];

export default function HeroBackground() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(60);
  const my = useMotionValue(40);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${sx}% ${sy}%, rgba(242,98,27,0.13), transparent 62%)`;

  const { scrollY } = useScroll();
  const ghostY = useTransform(scrollY, [0, 600], [0, -90]);

  useEffect(() => {
    if (reduce) return;
    const move = (e) => {
      mx.set((e.clientX / window.innerWidth) * 100);
      my.set((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduce, mx, my]);

  const mask = "radial-gradient(ellipse 75% 65% at 62% 45%, #000 25%, transparent 78%)";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* engineered grid, fades out toward the edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(250,250,248,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(250,250,248,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />

      {/* cursor spotlight + slow ambient glow */}
      <motion.div className="absolute inset-0" style={{ background: spotlight }} />
      <motion.div
        className="absolute -top-32 right-0 h-[520px] w-[520px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,197,66,0.10), transparent 65%)" }}
        animate={reduce ? {} : { x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* data network, drawn in once, nodes pulse. Reads as ML / fintech */}
      <svg
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMaxYMid slice"
        className="absolute inset-0 hidden h-full w-full md:block"
      >
        {EDGES.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]}
            stroke="#F2621B" strokeOpacity="0.22" strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, delay: 0.5 + i * 0.07, ease: "easeOut" }}
          />
        ))}
        {NODES.map(([x, y], i) => (
          <motion.circle
            key={i} cx={x} cy={y} r="3.5" fill="#F2621B"
            initial={{ opacity: 0 }}
            animate={reduce ? { opacity: 0.6 } : { opacity: [0.25, 0.9, 0.25] }}
            transition={{ duration: 3.2, delay: 0.8 + i * 0.25, repeat: Infinity }}
          />
        ))}
      </svg>

      {/* oversized outlined name, parallaxes away on scroll */}
      <motion.span
        className="absolute bottom-6 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-logo italic leading-none text-[26vw] md:text-[15rem]"
        style={{
          y: reduce ? 0 : ghostY,
          color: "transparent",
          WebkitTextStroke: "1px rgba(242,98,27,0.16)",
        }}
      >
        Leo Zuze
      </motion.span>
    </div>
  );
}