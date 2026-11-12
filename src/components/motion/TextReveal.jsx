import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "./useScrollReveal";

const EASE = [0.22, 1, 0.36, 1];

/* Slides words or letters up from behind a mask. Place it inside an element with overflow-hidden.
   inView: scroll-aware (shows going down, resets going up). Without it, it plays once on load. */
export function SplitText({
  text,
  by = "words",
  delay = 0,
  stagger = 0.07,
  duration = 0.85,
  inView = false,
  className = "",
}) {
  const reduce = useReducedMotion();
  const [ref, shown] = useScrollReveal({ enabled: inView });
  if (reduce) return <span className={className}>{text}</span>;

  const play = inView ? shown : true;
  const parts = by === "chars" ? Array.from(text) : text.split(" ");

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      {parts.map((part, i) => (
        <Fragment key={i}>
          <motion.span
            aria-hidden
            className="inline-block"
            initial={{ y: "115%", rotate: 6 }}
            animate={
              play
                ? { y: 0, rotate: 0, transition: { duration, delay: delay + i * stagger, ease: EASE } }
                : { y: "115%", rotate: 6, transition: { duration: 0.25, ease: EASE } }
            }
            style={{ transformOrigin: "0% 100%" }}
          >
            {part === " " ? "\u00A0" : part}
          </motion.span>
          {by === "words" && i < parts.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

/* Words fade up one after another. */
export function WordFade({
  text,
  delay = 0,
  stagger = 0.025,
  inView = false,
  className = "",
}) {
  const reduce = useReducedMotion();
  const [ref, shown] = useScrollReveal({ enabled: inView });
  if (reduce) return <p className={className}>{text}</p>;

  const play = inView ? shown : true;
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: 12 }}
            animate={
              play
                ? { opacity: 1, y: 0, transition: { duration: 0.6, delay: delay + i * stagger, ease: EASE } }
                : { opacity: 0, y: 12, transition: { duration: 0.2, ease: EASE } }
            }
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}