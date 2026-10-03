import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { techIcons } from "../../data/skills";

// Names must match a skill name in data/skills.js exactly to pick up an icon.
const aiSkillNames = ["Python", "Pandas", "NumPy", "Scikit-learn", "Web Scraping", "Model Training"];
const devSkillNames = ["React", "JavaScript", "Tailwind CSS", "MongoDB", "Framer Motion"];
const toolSkillNames = ["Git", "GitHub", "VS Code", "Vercel", "Supabase"];

const toChips = (names) => names.map((name) => ({ name, icon: techIcons[name] }));

const aiSkills = toChips(aiSkillNames);
const devSkills = toChips(devSkillNames);
const toolSkills = toChips(toolSkillNames);

/* card with a cursor glow, plus a light sweep + glow flash once the reveal is done */
function SpotlightCard({ children, className = "", done = false, order = 0 }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const bg = useMotionTemplate`radial-gradient(380px circle at ${mx}px ${my}px, rgba(242,98,27,0.16), transparent 70%)`;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  const onLeave = () => {
    mx.set(-400);
    my.set(-400);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      animate={
        done && !reduce
          ? {
              boxShadow: [
                "0 0 0px rgba(242,98,27,0)",
                "0 0 55px rgba(242,98,27,0.4)",
                "0 0 0px rgba(242,98,27,0)",
              ],
            }
          : { boxShadow: "0 0 0px rgba(242,98,27,0)" }
      }
      transition={{ duration: 1.5, delay: order * 0.2, ease: "easeOut" }}
      className={`relative h-full overflow-hidden rounded-3xl border border-border bg-surface/70 backdrop-blur-md transition-colors hover:border-accent/50 ${className}`}
    >
      <motion.div
        aria-hidden="true"
        style={{ background: bg }}
        className="pointer-events-none absolute inset-0"
      />

      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
          initial={{ x: "-150%" }}
          animate={{ x: done ? "400%" : "-150%" }}
          transition={
            done
              ? { duration: 1.2, delay: order * 0.2, ease: "easeInOut" }
              : { duration: 0 }
          }
        >
          <div className="h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </motion.div>
      )}

      <div className="relative h-full">{children}</div>
    </motion.div>
  );
}

/* scroll-driven reveal: the card grows out from behind the previous card.
   The wrapper never moves (it's what gets scroll-measured); the inner div does. */
function Reveal({ index, stage, offsets, wrapRef, onSettled, className = "", children }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center 62%"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.6 });
  const e = useTransform(smooth, stage, [0, 1], { clamp: true }); // this card's own 0..1

  const x = useTransform(e, (v) => (1 - v) * (offsets.current[index]?.x ?? 0));
  const y = useTransform(e, (v) => (1 - v) * (offsets.current[index]?.y ?? 0));
  const scale = useTransform(e, [0, 1], [0.5, 1]);
  const opacity = useTransform(e, [0, 0.35], [0, 1]);

  useMotionValueEvent(e, "change", (v) => onSettled?.(v > 0.97));

  return (
    <div
      ref={(el) => {
        ref.current = el;
        wrapRef(el);
      }}
      className={className}
      style={{ position: "relative", zIndex: 10 - index }}
    >
      <motion.div style={reduce ? undefined : { x, y, scale, opacity }} className="h-full">
        {children}
      </motion.div>
    </div>
  );
}

function Chip({ name, icon: Icon }) {
  return (
    <div className="group flex items-center gap-2.5 rounded-xl border border-border bg-bg px-4 py-3 transition-colors hover:border-accent">
      {Icon && (
        <Icon size={18} className="text-muted transition-colors group-hover:text-accent" />
      )}
      <span className="whitespace-nowrap text-sm font-medium text-text transition-colors group-hover:text-accent">
        {name}
      </span>
    </div>
  );
}

/* one ring of icons. The ring spins one way, each icon spins back so it stays upright */
function Ring({ items, radius, duration, reverse, reduce }) {
  return (
    <motion.div
      className="absolute inset-0"
      animate={reduce ? undefined : { rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {items.map(({ name, icon: Icon }, k) => {
        const a = (360 / items.length) * k;
        return (
          <div
            key={name}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%, -50%) rotate(${a}deg) translateX(${radius}px) rotate(${-a}deg)`,
            }}
          >
            <motion.div
              title={name}
              aria-label={name}
              animate={reduce ? undefined : { rotate: reverse ? 360 : -360 }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {Icon ? <Icon size={18} /> : <span className="font-mono text-[10px]">{name[0]}</span>}
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
}

function Orbit({ skills, reduce }) {
  const inner = skills.slice(0, 3);
  const outer = skills.slice(3);
  return (
    <div className="relative mx-auto h-[320px] w-full max-w-[320px] shrink-0">
      {/* ring guides: radius 85 and 135 inside a 320px box */}
      <div className="absolute inset-[75px] rounded-full border border-dashed border-border" />
      <div className="absolute inset-[25px] rounded-full border border-dashed border-border/70" />

      <Ring items={inner} radius={85} duration={28} reduce={reduce} />
      <Ring items={outer} radius={135} duration={44} reverse reduce={reduce} />

      <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/50 bg-bg font-mono text-xs font-semibold text-accent shadow-[0_0_40px_rgba(242,98,27,0.35)]">
        {!reduce && (
          <span className="absolute inset-0 animate-ping rounded-full border border-accent/40" />
        )}
        AI
      </div>
    </div>
  );
}

/* the marquee chips, travelling around a closed elliptical loop.
   Positions are set straight on the DOM every frame (no React re-render). */
function ChipLoop({ tools, reduce }) {
  const box = useRef(null);
  const guide = useRef(null);
  const els = useRef([]);
  const size = useRef({ w: 700, h: 300 });
  const angle = useRef(0);

  const place = () => {
    const { w, h } = size.current;
    const rx = Math.max(70, w / 2 - 85);
    const ry = Math.max(55, Math.min(h / 2 - 35, rx * 0.4));
    const n = tools.length;

    if (guide.current) {
      guide.current.style.width = `${rx * 2}px`;
      guide.current.style.height = `${ry * 2}px`;
    }

    els.current.forEach((el, i) => {
      if (!el) return;
      const t = angle.current + (i * Math.PI * 2) / n;
      const x = Math.cos(t) * rx;
      const y = Math.sin(t) * ry;
      const depth = (Math.sin(t) + 1) / 2; // 0 = far side, 1 = near side
      const s = 0.72 + 0.28 * depth;
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${s})`;
      el.style.opacity = String(0.4 + 0.6 * depth);
      el.style.zIndex = String(1 + Math.round(depth * 10));
    });
  };

  useLayoutEffect(() => {
    const measure = () => {
      if (!box.current) return;
      size.current = { w: box.current.offsetWidth, h: box.current.offsetHeight };
      place();
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    angle.current += (delta / 1000) * ((Math.PI * 2) / 40); // one lap every 40s
    place();
  });

  return (
    <div ref={box} className="relative h-[280px] w-full md:h-[300px]">
      <div
        ref={guide}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-border"
      />

      <div className="absolute left-1/2 top-1/2 z-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/50 bg-bg font-mono text-[10px] font-semibold uppercase tracking-wider text-accent shadow-[0_0_40px_rgba(242,98,27,0.35)]">
        {!reduce && (
          <span className="absolute inset-0 animate-ping rounded-full border border-accent/40" />
        )}
        Ship
      </div>

      {tools.map((c, i) => (
        <div
          key={c.name}
          ref={(el) => {
            els.current[i] = el;
          }}
          className="absolute left-1/2 top-1/2 will-change-transform"
        >
          <Chip {...c} />
        </div>
      ))}
    </div>
  );
}

export default function SkillsPreview() {
  const reduce = useReducedMotion();

  const [done, setDone] = useState(false);
  const grid = useRef(null);
  const wraps = useRef([]);
  const offsets = useRef([{ x: 0, y: 70 }, { x: 0, y: 0 }, { x: 0, y: 0 }]);

  // each card's start point = centre of the previous card, measured from the real layout
  useLayoutEffect(() => {
    const measure = () => {
      const c = wraps.current.map((el) =>
        el ? { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 } : null
      );
      offsets.current = c.map((cur, i) =>
        i === 0 || !cur || !c[i - 1]
          ? { x: 0, y: 70 }
          : { x: c[i - 1].x - cur.x, y: c[i - 1].y - cur.y }
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (grid.current) ro.observe(grid.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl overflow-x-hidden px-6 py-20 md:py-28">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: reduce ? 0 : -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">
            What I Work With
          </p>
          <h2 className="font-heading text-3xl font-bold text-text md:text-4xl">
            Skills & Tools
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: reduce ? 0 : 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
        >
          <NavLink
            to="/skills"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
          >
            View All Skills <ArrowUpRight size={16} />
          </NavLink>
        </motion.div>
      </div>

      <div ref={grid} className="relative grid gap-6 md:grid-cols-3">
        {/* AI & Fintech: comes first */}
        <Reveal
          index={0}
          stage={[0, 0.6]}
          offsets={offsets}
          wrapRef={(el) => {
            wraps.current[0] = el;
          }}
          className="md:col-span-2"
        >
          <SpotlightCard done={done} order={0}>
            <div className="flex flex-col gap-8 p-8 md:flex-row md:items-center md:p-10">
              <div className="flex-1">
                <span className="inline-block rounded-full border border-accent/40 bg-bg px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                  Primary Focus
                </span>
                <h3 className="mt-4 font-heading text-2xl font-semibold text-text md:text-3xl">
                  AI & Fintech Dev
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                  Models that find patterns in messy data, flag fraud, and turn raw
                  numbers into decisions.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {aiSkills.map(({ name }) => (
                    <span
                      key={name}
                      className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              <Orbit skills={aiSkills} reduce={reduce} />
            </div>
          </SpotlightCard>
        </Reveal>

        {/* Full Stack: grows out of the AI card */}
        <Reveal
          index={1}
          stage={[0.2, 0.8]}
          offsets={offsets}
          wrapRef={(el) => {
            wraps.current[1] = el;
          }}
        >
          <SpotlightCard done={done} order={1}>
            <div className="p-8">
              <h3 className="mb-6 font-heading text-xl font-semibold text-text">
                Full Stack Dev
              </h3>
              <div className="flex flex-wrap gap-3">
                {devSkills.map((c) => (
                  <Chip key={c.name} {...c} />
                ))}
              </div>
            </div>
          </SpotlightCard>
        </Reveal>

        {/* Tools: grows out of the Full Stack card, then triggers the finish effect */}
        <Reveal
          index={2}
          stage={[0.4, 1]}
          offsets={offsets}
          wrapRef={(el) => {
            wraps.current[2] = el;
          }}
          onSettled={setDone}
          className="md:col-span-3"
        >
          <SpotlightCard done={done} order={2}>
            <div className="px-8 pb-6 pt-8 md:px-10 md:pt-10">
              <h3 className="font-heading text-xl font-semibold text-text md:text-2xl">
                Tools & Deployment
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                The tools I use to build, version and ship.
              </p>
              <ChipLoop tools={toolSkills} reduce={reduce} />
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}