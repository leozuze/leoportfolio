import { motion, useReducedMotion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { Home, ArrowUpRight } from "lucide-react";

export default function NotFound() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" },
    }),
  };

  // Everything below drives the walk cycle. Reduced-motion users get a
  // static doll — no animate props applied — instead of a frozen mid-step
  // pose, which would look broken rather than intentional.
  const bob = shouldReduceMotion
    ? {}
    : { y: [0, -6, 0] };
  const bobTransition = { duration: 1.1, repeat: Infinity, ease: "easeInOut" };

  const legLeft = shouldReduceMotion ? {} : { rotate: [-20, 18, -20] };
  const legRight = shouldReduceMotion ? {} : { rotate: [18, -20, 18] };
  const legTransition = { duration: 1.1, repeat: Infinity, ease: "easeInOut" };

  const armSway = (phase = 0) =>
    shouldReduceMotion
      ? {}
      : { rotate: [phase - 6, phase + 6, phase - 6] };
  const armTransition = { duration: 2.2, repeat: Infinity, ease: "easeInOut" };

  const shadowPulse = shouldReduceMotion ? {} : { rx: [34, 25, 34], opacity: [0.5, 0.3, 0.5] };

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center overflow-x-hidden">
      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-52 md:w-60 mb-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent-2/10 blur-2xl rounded-full" />

        <motion.svg
          viewBox="0 0 200 220"
          className="relative w-full h-auto"
          animate={bob}
          transition={bobTransition}
        >
          {/* ground shadow, pulses as the doll "steps" */}
          <motion.ellipse
            cx="100"
            cy="204"
            rx="34"
            ry="7"
            className="fill-border"
            animate={shadowPulse}
            transition={legTransition}
          />

          {/* back arm, slow droop sway */}
          <motion.g
            style={{ transformOrigin: "76px 116px" }}
            animate={armSway(6)}
            transition={armTransition}
          >
            <rect x="70" y="116" width="10" height="46" rx="5" className="fill-muted/50" />
          </motion.g>

          {/* legs — alternating walk cycle */}
          <motion.g
            style={{ transformOrigin: "88px 166px" }}
            animate={legLeft}
            transition={legTransition}
          >
            <rect x="82" y="166" width="12" height="40" rx="6" className="fill-muted" />
          </motion.g>
          <motion.g
            style={{ transformOrigin: "112px 166px" }}
            animate={legRight}
            transition={legTransition}
          >
            <rect x="106" y="166" width="12" height="40" rx="6" className="fill-muted" />
          </motion.g>

          {/* body */}
          <rect
            x="66"
            y="94"
            width="68"
            height="78"
            rx="24"
            className="fill-surface stroke-border"
            strokeWidth="2"
          />

          {/* front arm, droops a little lower — sadder posture */}
          <motion.g
            style={{ transformOrigin: "124px 116px" }}
            animate={armSway(-4)}
            transition={{ ...armTransition, delay: 0.3 }}
          >
            <rect x="118" y="116" width="10" height="48" rx="5" className="fill-muted" />
          </motion.g>

          {/* head, tilted down — sad posture */}
          <g transform="rotate(6 100 58)">
            <circle
              cx="100"
              cy="58"
              r="38"
              className="fill-surface stroke-border"
              strokeWidth="2"
            />

            {/* eyes */}
            <circle cx="86" cy="56" r="4" className="fill-text" />
            <circle cx="114" cy="56" r="4" className="fill-text" />

            {/* downturned brows */}
            <path
              d="M76 44 Q86 39 95 45"
              className="stroke-muted"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M105 45 Q114 39 124 44"
              className="stroke-muted"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* frown */}
            <path
              d="M84 78 Q100 66 116 78"
              className="stroke-accent"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* single falling tear */}
            <motion.circle
              cx="90"
              cy="64"
              r="2.5"
              className="fill-accent-2"
              animate={
                shouldReduceMotion
                  ? {}
                  : { cy: [64, 82], opacity: [1, 1, 0] }
              }
              transition={
                shouldReduceMotion
                  ? {}
                  : { duration: 1.6, repeat: Infinity, ease: "easeIn", delay: 0.6 }
              }
            />
          </g>
        </motion.svg>
      </motion.div>

      {/* Copy */}
      <motion.p
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="font-mono text-xs uppercase tracking-widest text-accent mb-3"
      >
        Error 404
      </motion.p>

      <motion.h1
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="font-heading text-3xl md:text-4xl font-bold text-text mb-4"
      >
        This page doesn't exist.
      </motion.h1>

      <motion.p
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="text-muted text-sm md:text-base leading-relaxed max-w-md mb-10"
      >
        Even the doll went looking and came back empty-handed. The link you
        followed may be broken, or the page has moved everything else on
        the site is exactly where it should be.
      </motion.p>

      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <NavLink
          to="/"
          className="inline-flex items-center gap-2 bg-accent text-bg px-6 py-3 rounded-full font-semibold text-sm hover:bg-accent-2 hover:scale-105 transition-all duration-200"
        >
          <Home size={16} /> Back to Home
        </NavLink>
        <NavLink
          to="/projects"
          className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-medium text-sm text-text hover:border-accent hover:text-accent transition-colors"
        >
          See Projects Instead <ArrowUpRight size={16} />
        </NavLink>
      </motion.div>
    </div>
  );
}
