import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";

// Isometric stack of three tiles that gently breathe apart in Z
function LayersIcon() {
  const reduce = useReducedMotion();
  return (
    <div className="h-10 w-10 shrink-0" style={{ perspective: 200 }}>
      <div
        className="relative h-full w-full"
        style={{ transform: "rotateX(58deg) rotateZ(45deg)", transformStyle: "preserve-3d" }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-[20%] rounded-[3px] border border-accent bg-accent/20"
            style={{ z: i * 8 }}
            animate={reduce ? undefined : { z: [i * 8, i * 8 + 6, i * 8] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AvailabilityCard() {
  return (
    <NavLink to="/contact" aria-label="Open for projects, start a conversation" className="block">
      <motion.div
        initial="rest"
        animate="rest"
        whileHover="hover"
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* two cards behind the front one, they fan out on hover */}
        {[2, 1].map((n) => (
          <motion.span
            key={n}
            aria-hidden
            variants={{
              rest: { x: n * 5, y: n * 5 },
              hover: { x: n * 11, y: n * 11 },
            }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="absolute inset-0 rounded-2xl border border-border bg-surface"
            style={{ z: -n * 14 }}
          />
        ))}

        <div className="relative flex items-center gap-3 rounded-2xl border border-border bg-bg py-2.5 pl-3 pr-4 shadow-xl shadow-black/40">
          <LayersIcon />
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold text-text">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Open for projects
            </p>
            <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted">
              Start a conversation <ArrowUpRight size={11} className="text-accent" />
            </p>
          </div>
        </div>
      </motion.div>
    </NavLink>
  );
}