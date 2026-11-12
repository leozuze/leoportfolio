import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { skillCategories } from "../../data/skills";
import { SplitText, WordFade } from "../motion/TextReveal";
import { Reveal } from "../motion/primitives";
import { FlowLines } from "../ui/Curves";

const EASE = [0.22, 1, 0.36, 1];
const AUTO_MS = 7000;
const pad = (n) => String(n).padStart(2, "0");

const Line = ({ children }) => (
  <span className="block overflow-hidden pb-[0.14em] pr-2">{children}</span>
);

export default function SkillsPreview() {
  const reduce = useReducedMotion();
  const uid = useId();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true); // stops for good once the visitor interacts
  const cat = skillCategories[active];
  const playing = auto && inView && !reduce;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(
      () => setActive((a) => (a + 1) % skillCategories.length),
      AUTO_MS
    );
    return () => clearTimeout(t);
  }, [playing, active]);

  // arrow keys move between the tabs
  const onKey = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    setAuto(false);
    const count = skillCategories.length;
    const next = (active + (e.key === "ArrowDown" ? 1 : -1) + count) % count;
    setActive(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Skills and tools"
      className="mx-auto max-w-6xl px-6 py-20 md:py-28"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4">
            <span aria-hidden className="block h-px w-12 bg-ink" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              What I work with
            </p>
          </div>
          <h2 className="mt-6 font-heading text-4xl font-extrabold leading-[1.04] tracking-tight text-text md:text-6xl">
            <Line>
              <SplitText text="The skills behind" inView />
            </Line>
            <Line>
              <SplitText text="every project." inView delay={0.2} className="text-accent" />
            </Line>
          </h2>
        </div>

        <NavLink
          to="/skills"
          className="group inline-flex items-center gap-2 rounded-md border-2 border-ink px-5 py-3 text-sm font-semibold text-text transition-colors duration-200 hover:bg-ink hover:text-on-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          All skills
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
        text="You don't need to know any of this to work with me. It's here so you can see the range of what I can build."
        className="mt-5 max-w-lg text-sm text-muted md:text-base"
      />

      <Reveal className="mt-12 grid gap-6 md:grid-cols-12">
        {/* tabs */}
        <div
          role="tablist"
          aria-label="Skill areas"
          aria-orientation="vertical"
          onKeyDown={onKey}
          className="flex flex-col gap-2 md:col-span-4"
        >
          {skillCategories.map((c, i) => {
            const on = i === active;
            return (
              <button
                key={c.title}
                id={`${uid}-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`${uid}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => {
                  setAuto(false);
                  setActive(i);
                }}
                className="relative overflow-hidden rounded-lg border border-transparent px-5 py-4 text-left transition-colors duration-200 hover:border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {on && (
                  <motion.span
                    layoutId={`${uid}-tab`}
                    aria-hidden
                    className="absolute inset-0 rounded-lg border border-ink bg-surface"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}

                {/* auto-advance progress */}
                {on && playing && (
                  <motion.span
                    key={`bar-${active}`}
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-accent"
                  />
                )}

                <span className="relative flex items-start gap-4">
                  <span
                    className={`pt-1 text-xs font-bold tabular-nums transition-colors ${
                      on ? "text-accent" : "text-muted"
                    }`}
                  >
                    {pad(i + 1)}
                  </span>
                  <span>
                    <span
                      className={`block font-heading text-lg font-extrabold leading-snug transition-colors ${
                        on ? "text-text" : "text-text/60"
                      }`}
                    >
                      {c.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted">{c.tagline}</span>
                    <span className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      {c.skills.length} skills
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* panel */}
        <div
          role="tabpanel"
          id={`${uid}-panel`}
          aria-labelledby={`${uid}-tab-${active}`}
          onPointerEnter={() => setAuto(false)}
          className="relative overflow-hidden rounded-xl bg-ink p-6 text-on-ink md:col-span-8 md:p-9"
        >
          <FlowLines
            className="text-white/[0.1]"
            count={5}
            gap={28}
            inView
            accentLine={3}
            accentColor="var(--color-accent-soft)"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="relative"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-6 select-none font-heading text-[9rem] font-extrabold leading-none text-transparent"
                style={{ WebkitTextStroke: "1px rgba(245,240,230,0.12)" }}
              >
                {pad(active + 1)}
              </span>

              <div className="relative mb-7 flex items-center gap-3">
                <span aria-hidden className="block h-px w-8 bg-accent-soft" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-ink/60">
                  {cat.tagline}
                </p>
              </div>

              <ul className="relative grid gap-x-8 gap-y-7 sm:grid-cols-2">
                {cat.skills.map((s, k) => {
                  const Icon = s.icon;
                  return (
                    <motion.li
                      key={s.name}
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={reduce ? undefined : { x: 4 }}
                      transition={{ duration: 0.45, delay: 0.08 + k * 0.05, ease: EASE }}
                      className="group flex gap-4"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-white/10 text-accent-soft transition-colors duration-300 group-hover:bg-accent group-hover:text-on-accent">
                        <Icon size={20} aria-hidden />
                      </span>
                      <div>
                        <p className="font-bold">{s.name}</p>
                        <p className="mt-1 text-sm leading-relaxed text-on-ink/65">
                          {s.detail}
                        </p>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}