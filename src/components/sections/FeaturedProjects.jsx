import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { projects } from "../../data/projects";
import { SplitText, WordFade } from "../motion/TextReveal";
import { Reveal } from "../motion/primitives";
import { useScrollReveal } from "../motion/useScrollReveal";
import { useIsMobile } from "../../hooks/useIsMobile";

const EASE = [0.22, 1, 0.36, 1];
const pad = (n) => String(n).padStart(2, "0");

// Featured projects first, then the rest. Add .slice(0, 4) to show fewer.
const showcase = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));
const n = showcase.length;

const BTN =
  "group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md px-6 py-3.5 text-sm font-semibold transition-colors duration-300 before:absolute before:inset-0 before:translate-y-full before:transition-transform before:duration-300 before:ease-out hover:before:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:before:transition-none";

const Line = ({ children }) => (
  <span className="block overflow-hidden pb-[0.14em] pr-2">{children}</span>
);

const WIPE_HIDDEN = "inset(100% 0% 0% 0%)";
const WIPE_SHOWN = "inset(0% 0% 0% 0%)";

const col = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const rise = {
  hidden: { opacity: 0, y: 16, transition: { duration: 0.25 } },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/* One project. The image is a clean preview: the link opens on click and is never printed.
   The image wipes in as you scroll down to it and resets when you scroll back up past it.
   fx (optional): imgY and shade, driven by the stack scroll. */
function Sheet({ p, i, priority = false, fx }) {
  const reduce = useReducedMotion();
  const [imgRef, imgShown] = useScrollReveal({ margin: "0px 0px -10% 0px" });
  const [textRef, textShown] = useScrollReveal({ margin: "0px 0px -15% 0px" });

  return (
    <article className="relative grid overflow-hidden rounded-xl border border-border bg-surface shadow-[0_24px_40px_-28px_rgb(22_20_15/0.4)] md:grid-cols-12">
      {/* gets darker a little as the next project slides over it */}
      {fx && (
        <motion.span
          aria-hidden
          style={{ opacity: fx.shade }}
          className="pointer-events-none absolute inset-0 z-20 bg-ink"
        />
      )}

      <motion.a
        ref={imgRef}
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden="true"
        initial={reduce ? false : { clipPath: WIPE_HIDDEN }}
        animate={
          reduce || imgShown
            ? { clipPath: WIPE_SHOWN, transition: { duration: 1, ease: EASE } }
            : { clipPath: WIPE_HIDDEN, transition: { duration: 0.3 } }
        }
        className="group relative block aspect-[16/10] overflow-hidden bg-ink md:col-span-7 md:aspect-auto md:min-h-[26rem]"
      >
        <motion.img
          src={p.image}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={fx ? { y: fx.imgY, scale: 1.12 } : undefined}
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
        />

        <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-md bg-on-ink text-ink transition-transform duration-300 group-hover:rotate-45 motion-reduce:transform-none">
          <ArrowUpRight size={18} aria-hidden />
        </span>

        <span className="absolute inset-0 flex items-end bg-ink/0 p-5 transition-colors duration-300 group-hover:bg-ink/50">
          <span className="inline-flex translate-y-3 items-center gap-2 rounded-md bg-on-ink px-4 py-2.5 text-sm font-semibold text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
            View live project <ArrowUpRight size={15} aria-hidden />
          </span>
        </span>
      </motion.a>

      <motion.div
        ref={textRef}
        variants={col}
        initial={reduce ? false : "hidden"}
        animate={reduce || textShown ? "show" : "hidden"}
        className="relative flex flex-col justify-between gap-8 p-6 md:col-span-5 md:p-9"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute right-5 top-1 select-none font-heading text-[6rem] font-extrabold leading-none text-transparent"
          style={{ WebkitTextStroke: "1px rgba(22,20,15,0.12)" }}
        >
          {pad(i + 1)}
        </span>

        <div className="relative">
          <motion.div variants={rise} className="flex items-center gap-3">
            <span aria-hidden className="block h-px w-8 bg-accent" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {p.category} &middot; {p.subCategory}
            </p>
          </motion.div>

          <h3 className="mt-5 font-heading text-3xl font-extrabold leading-tight tracking-tight text-text md:text-4xl">
            <Line>
              <SplitText text={p.title} inView stagger={0.05} />
            </Line>
          </h3>

          <motion.p variants={rise} className="mt-2 text-sm font-semibold text-accent">
            {p.tagline}
          </motion.p>
          <motion.p variants={rise} className="mt-4 text-sm leading-relaxed text-muted md:text-base">
            {p.description}
          </motion.p>

          <motion.ul
            variants={rise}
            aria-label="What was delivered"
            className="mt-5 flex flex-wrap gap-2"
          >
            {["Design", "Build", "Launch"].map((t) => (
              <li
                key={t}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted"
              >
                {t}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div variants={rise} className="relative">
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${p.title} live project (opens in a new tab)`}
            className={`${BTN} bg-ink text-on-ink before:bg-accent`}
          >
            <span className="relative">View live project</span>
            <ArrowUpRight
              size={16}
              aria-hidden
              className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
            />
          </a>
        </motion.div>
      </motion.div>
    </article>
  );
}

/* Sticks to the top; as the next project slides over, this one shrinks and darkens behind it. */
function StackItem({ p, i, progress }) {
  const target = 1 - (n - 1 - i) * 0.025;
  const scale = useTransform(progress, [i / n, 1], [1, target]);
  const local = useTransform(progress, (v) => v * n - i);
  const imgY = useTransform(local, [-0.6, 1.4], ["-4%", "4%"]);
  const shade = useTransform(
    progress,
    [i / n, (i + 1) / n],
    [0, i === n - 1 ? 0 : 0.28]
  );

  return (
    <div className="sticky top-20 flex h-[calc(100svh-5rem)] items-center">
      <motion.div
        style={{ scale, y: i * 14, transformOrigin: "50% 0%" }}
        className="w-full"
      >
        <Sheet p={p} i={i} priority={i === 0} fx={{ imgY, shade }} />
      </motion.div>
    </div>
  );
}

export default function FeaturedProjects() {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const stacked = !reduce && !mobile;
  const stack = useRef(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: stack,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(n - 1, Math.max(0, Math.floor(v * n)));
    setActive((prev) => (prev === idx ? prev : idx));
  });

  if (!n) return null;

  return (
    <section aria-label="Selected work" className="mx-auto max-w-6xl px-6 pt-20 md:pt-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4">
            <span aria-hidden className="block h-px w-12 bg-ink" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Selected work
            </p>
          </div>
          <h2 className="mt-6 font-heading text-4xl font-extrabold leading-[1.04] tracking-tight text-text md:text-6xl">
            <Line>
              <SplitText text="Live projects for" inView />
            </Line>
            <Line>
              <SplitText text="real businesses." inView delay={0.2} className="text-accent" />
            </Line>
          </h2>
        </div>

        <NavLink
          to="/projects"
          className="group inline-flex items-center gap-2 rounded-md border-2 border-ink px-5 py-3 text-sm font-semibold text-text transition-colors duration-200 hover:bg-ink hover:text-on-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          All projects
          <ArrowUpRight
            size={16}
            aria-hidden
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        </NavLink>
      </div>

      <WordFade
        inView
        delay={0.3}
        text="Every project below is live. Click any card to open the real site."
        className="mt-5 max-w-md text-sm text-muted md:text-base"
      />

      <div ref={stack} className="relative mt-12 md:mt-16">
        {/* progress rail, wide screens only */}
        {stacked && (
          <div aria-hidden className="pointer-events-none absolute -left-14 top-0 hidden h-full xl:block">
            <div className="sticky top-[calc(50svh-6rem)] flex flex-col items-center gap-4">
              <span className="rotate-180 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted [writing-mode:vertical-rl]">
                Projects
              </span>
              <div className="relative h-24 w-px bg-ink/15">
                <motion.span
                  style={{ scaleY: scrollYProgress }}
                  className="absolute inset-0 origin-top bg-accent"
                />
              </div>
              <p className="text-sm font-extrabold tabular-nums text-text">
                <span className="text-accent">{pad(active + 1)}</span>
                <span className="text-muted"> / {pad(n)}</span>
              </p>
            </div>
          </div>
        )}

        {stacked ? (
          showcase.map((p, i) => (
            <StackItem key={p.title} p={p} i={i} progress={scrollYProgress} />
          ))
        ) : (
          <div className="grid gap-6">
            {showcase.map((p, i) => (
              <Reveal key={p.title}>
                <Sheet p={p} i={i} priority={i === 0} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <Reveal className="py-14 text-center">
        <NavLink to="/projects" className={`${BTN} bg-ink text-on-ink before:bg-accent`}>
          <span className="relative">See all projects</span>
          <ArrowRight
            size={16}
            aria-hidden
            className="relative transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
          />
        </NavLink>
      </Reveal>
    </section>
  );
}