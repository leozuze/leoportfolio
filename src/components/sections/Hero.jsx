import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import HeroPortrait from "./HeroPortrait";

const Line = ({ i, children, className = "" }) => (
  <span className="block overflow-hidden pb-[0.14em]">
    <motion.span
      className={`block ${className}`}
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  </span>
);

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const textOpacity = useTransform(p, [0, 0.4], [1, 0]);
  const textY = useTransform(p, [0, 0.4], [0, -70]);
  const zoom = useTransform(p, [0, 1], [1, 1.4]);
  const cue = useTransform(p, [0, 0.12], [1, 0]);

  return (
    <section ref={ref} className={reduce ? "" : "h-[220svh]"}>
      <div
        className={`relative flex flex-col overflow-hidden ${
          reduce ? "min-h-[calc(100svh-5rem)]" : "sticky top-20 h-[calc(100svh-5rem)]"
        }`}
      >
        {/* hairline columns: the only background decoration */}
        <div aria-hidden className="pointer-events-none absolute inset-0 mx-auto grid max-w-6xl grid-cols-4 px-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`border-l border-border/50 ${i === 3 ? "border-r" : ""}`} />
          ))}
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 md:grid-cols-12">
          <motion.div
            style={reduce ? undefined : { opacity: textOpacity, y: textY }}
            className="md:col-span-7"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-mono text-xs uppercase tracking-widest text-muted"
            >
              Leo Zuze · Web &amp; AI Developer
            </motion.p>

            <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.02] tracking-tight text-text sm:text-6xl lg:text-7xl">
              <Line i={0}>Websites and software</Line>
              <Line i={1}>that bring in</Line>
              <Line i={2} className="font-logo font-normal italic text-accent">customers.</Line>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-7 max-w-md text-base leading-relaxed text-muted"
            >
              I design and build fast, modern websites, web apps and dashboards
              for businesses that want to grow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <NavLink to="/contact" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-accent-2">
                Start a project <ArrowUpRight size={16} />
              </NavLink>
              <NavLink to="/projects" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent">
                See live work
              </NavLink>
            </motion.div>
          </motion.div>

          <motion.div
            style={reduce ? undefined : { scale: zoom }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="md:col-span-5"
          >
            <HeroPortrait />
          </motion.div>
        </div>

        <motion.div
          style={reduce ? undefined : { opacity: cue }}
          className="relative mx-auto flex w-full max-w-6xl items-center justify-between border-t border-border/60 px-6 py-4 font-mono text-[11px] uppercase tracking-widest text-muted"
        >
          <span>Pune, India</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Available for freelance
          </span>
          <span className="hidden sm:inline">Scroll</span>
        </motion.div>
      </div>
    </section>
  );
}