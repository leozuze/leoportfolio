import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useScrollReveal } from "./useScrollReveal";

const ease = [0.22, 1, 0.36, 1];

// Fades and rises in as you scroll down; resets when you scroll back up past it.
export function Reveal({ children, delay = 0, y = 28, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const [ref, shown] = useScrollReveal();
  const M = motion[as];
  const show = reduce || shown;

  return (
    <M
      ref={ref}
      initial={reduce ? false : { opacity: 0, y }}
      animate={
        show
          ? { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease } }
          : { opacity: 0, y, transition: { duration: 0.3, ease } }
      }
      className={className}
    >
      {children}
    </M>
  );
}

// Each word slides up out of its own mask
export function WordReveal({ text, delay = 0, className = "" }) {
  const reduce = useReducedMotion();
  const [ref, shown] = useScrollReveal();
  const show = reduce || shown;

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span
          key={i}
          aria-hidden
          className="mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={{ y: reduce ? 0 : "110%" }}
            animate={
              show
                ? { y: 0, transition: { duration: 0.8, delay: delay + i * 0.05, ease } }
                : { y: "110%", transition: { duration: 0.25, ease } }
            }
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent"
    />
  );
}