import { useId, useMemo, useRef } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Brain, Code2, MapPin, Rocket } from "lucide-react";
import { NavLink } from "react-router-dom";
import heroImg from "../assets/images/heroimg.webp";
import { WordReveal } from "../components/motion/primitives";

const EMAIL = "leonoelzuze@gmail.com";

const quickFacts = [
  { label: "Based in", value: "Pune, India" },
  { label: "Studying", value: "Vishwakarma University" },
  { label: "Year", value: "2nd Year" },
  { label: "Focus", value: "AI & Fintech" },
];

const focusAreas = [
  {
    kicker: "AI & Data Science",
    headline: "Turn raw numbers into decisions.",
    icon: Brain,
    detail:
      "Python, Pandas, and scikit-learn to clean, explore, and model financial data, turning raw numbers into something a system can act on.",
  },
  {
    kicker: "Full Stack Development",
    headline: "From idea to something people can open.",
    icon: Code2,
    detail:
      "React and Tailwind on the frontend, Express and MongoDB on the backend, wired together so the models above actually reach a real interface.",
  },
  {
  kicker: "AI Agents & RAG",
  headline: "Assistants that actually know your data.",
  icon: Rocket,
  detail:
    "RAG pipelines and AI agents built on your own documents and workflows not a generic chatbot wrapper, something that answers from your real data.",
},
];

/* ---------- tapered arrow ---------- */

// cubic bezier control points, in the arrow's own viewBox
const SIDE_PTS = [[6, 14], [70, 2], [130, 10], [148, 60]];
const SIDE_SIZE = [150, 70];
const DOWN_PTS = [[30, 6], [14, 20], [34, 30], [30, 52]];
const DOWN_SIZE = [60, 60];

const bez = (p, t) => {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [
    a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0],
    a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1],
  ];
};

const tangent = (p, t) => {
  const u = 1 - t;
  const dx = 3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]);
  const dy = 3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1]);
  const l = Math.hypot(dx, dy) || 1;
  return [dx / l, dy / l];
};

const rotate = (v, a) => [
  v[0] * Math.cos(a) - v[1] * Math.sin(a),
  v[0] * Math.sin(a) + v[1] * Math.cos(a),
];

/* body = filled shape whose width shrinks from w0 (start) to w1 (tip); head = open V at the tip */
function buildArrow(p, w0, w1, head) {
  const N = 48;
  const left = [];
  const right = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = bez(p, t);
    const [tx, ty] = tangent(p, t);
    const w = (w1 + (w0 - w1) * Math.pow(1 - t, 1.3)) / 2;
    left.push([x - ty * w, y + tx * w]);
    right.push([x + ty * w, y - tx * w]);
  }
  const pts = [...left, ...right.reverse()];
  const body = "M" + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L") + "Z";
  const center = `M${p[0][0]} ${p[0][1]} C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}`;

  const tip = p[3];
  const dir = tangent(p, 1);
  const back = [-dir[0], -dir[1]];
  const a1 = rotate(back, 0.5);
  const a2 = rotate(back, -0.5);
  const headD =
    `M${(tip[0] + a1[0] * head).toFixed(2)} ${(tip[1] + a1[1] * head).toFixed(2)}` +
    `L${tip[0]} ${tip[1]}` +
    `L${(tip[0] + a2[0] * head).toFixed(2)} ${(tip[1] + a2[1] * head).toFixed(2)}`;

  return { body, center, head: headD };
}

function TaperArrow({ points, size, w0 = 12, w1 = 2.5, head = 12, delay = 0, className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const id = useId().replace(/:/g, "");
  const show = reduce || inView;
  const geo = useMemo(() => buildArrow(points, w0, w1, head), [points, w0, w1, head]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${size[0]} ${size[1]}`}
      className={`h-auto overflow-visible text-accent ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width={size[0]} height={size[1]}>
          <motion.path
            d={geo.center}
            stroke="white"
            strokeWidth={w0 * 2 + 8}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: show ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 1.1, delay, ease: [0.4, 0, 0.2, 1] }}
          />
        </mask>
      </defs>

      <g mask={`url(#${id})`} fill="currentColor">
        <path d={geo.body} />
        <circle cx={points[0][0]} cy={points[0][1]} r={w0 / 2} />
      </g>

      <motion.path
        d={geo.head}
        stroke="currentColor"
        strokeWidth={Math.max(w1, 2.5)}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: show ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.3, delay: delay + 1.0, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ---------- focus card: tilt, orbit ring, live mini-visual ---------- */

const ENTER = [
  { x: -48, y: 28, rotate: -3 },
  { x: 0, y: 56, rotate: 0 },
  { x: 48, y: 28, rotate: 3 },
];

function CardVisual({ index, on, reduce }) {
  if (index === 0) {
    const bars = [38, 62, 46, 80, 58, 92, 70];
    return (
      <div className="flex h-16 items-end gap-1.5">
        {bars.map((h, k) => (
          <motion.span
            key={k}
            className="w-full origin-bottom rounded-t bg-accent/70"
            style={{ height: `${h}%` }}
            initial={{ scaleY: 0 }}
            animate={
              on
                ? reduce
                  ? { scaleY: 1 }
                  : { scaleY: [0, 1, 0.72, 1] }
                : { scaleY: 0 }
            }
            transition={
              reduce
                ? { duration: 0 }
                : {
                    duration: 3.2,
                    delay: 0.3 + k * 0.08,
                    times: [0, 0.25, 0.65, 1],
                    repeat: Infinity,
                    repeatDelay: 0.4,
                    ease: "easeInOut",
                  }
            }
          />
        ))}
      </div>
    );
  }

  if (index === 1) {
    const layers = [
      { label: "UI", hover: "" },
      { label: "API", hover: "group-hover:translate-y-1.5" },
      { label: "DB", hover: "group-hover:translate-y-3.5" },
    ];
    return (
      <div className="relative h-[72px]">
        {layers.map(({ label, hover }, k) => (
          <div
            key={label}
            className={`absolute inset-x-0 flex h-7 items-center justify-between rounded-lg border border-border bg-bg px-3 font-mono text-[10px] uppercase tracking-widest text-muted transition-all duration-500 group-hover:border-accent/50 group-hover:text-accent ${hover}`}
            style={{ top: k * 12, zIndex: 3 - k }}
          >
            <span>{label}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted">
        <span>training model</span>
        <span className="text-accent">{reduce ? "82%" : "running"}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
          initial={{ width: "0%" }}
          animate={on ? { width: reduce ? "82%" : ["0%", "82%", "82%"] } : { width: "0%" }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 3.4, times: [0, 0.7, 1], repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }
          }
        />
      </div>
    </div>
  );
}

function GlowCard({ item, index }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const { kicker, headline, detail, icon: Icon } = item;

  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 170, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [8, -8]), spring);
  const numX = useSpring(useTransform(px, [0, 1], [16, -16]), spring);
  const numY = useSpring(useTransform(py, [0, 1], [10, -10]), spring);

  const glow = useMotionTemplate`radial-gradient(320px circle at ${mx}px ${my}px, rgba(242,98,27,0.16), transparent 70%)`;

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    mx.set(x);
    my.set(y);
    px.set(x / r.width);
    py.set(y / r.height);
  };
  const onLeave = () => {
    mx.set(-300);
    my.set(-300);
    px.set(0.5);
    py.set(0.5);
  };

  const from = ENTER[index % ENTER.length];

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, x: reduce ? 0 : from.x, y: reduce ? 0 : from.y, rotate: reduce ? 0 : from.rotate }}
      animate={inView ? { opacity: 1, x: 0, y: 0, rotate: 0 } : undefined}
      transition={{ type: "spring", stiffness: 90, damping: 16, delay: index * 0.12 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-surface p-7 transition-colors hover:border-accent/60"
    >
      <motion.div aria-hidden="true" style={{ background: glow }} className="pointer-events-none absolute inset-0" />

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -right-1 -top-5 select-none font-logo text-8xl italic leading-none text-transparent"
        style={{ WebkitTextStroke: "1px rgba(242,98,27,0.25)", x: reduce ? 0 : numX, y: reduce ? 0 : numY }}
      >
        {String(index + 1).padStart(2, "0")}
      </motion.span>

      <div className="relative flex flex-1 flex-col">
        {/* icon with an orbiting dashed ring */}
        <span className="relative mb-5 flex h-12 w-12 items-center justify-center">
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-dashed border-accent/50"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          />
          <motion.span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent"
            animate={reduce ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 3 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon size={18} />
          </motion.span>
        </span>

        <p className="font-mono text-[11px] uppercase tracking-widest text-muted">{kicker}</p>
        <h3 className="mt-2 font-heading text-xl font-semibold leading-snug text-text">{headline}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{detail}</p>

        <div className="mt-auto pt-7">
          <CardVisual index={index} on={inView} reduce={reduce} />
        </div>
      </div>

      {/* accent line sweeping along the bottom edge on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-accent to-accent-2 transition-transform duration-500 group-hover:scale-x-100"
      />
    </motion.article>
  );
}

/* ---------- closing call to action ---------- */

function ClosingCTA() {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: 0, y: reduce ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="relative mt-24 overflow-hidden rounded-[2.5rem] border border-border bg-surface px-6 py-16 text-center md:mt-32 md:px-16 md:py-24"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-accent-2/10 blur-3xl" />

      <div className="relative">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">Got a project in mind?</p>
        <h2 className="mx-auto max-w-2xl font-heading text-3xl font-bold leading-[1.1] tracking-tight text-text md:text-5xl">
          <WordReveal text="Got an idea?" />{" "}
          <span className="font-logo font-normal italic text-accent">
            <WordReveal text="Let's make it real." delay={0.3} />
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted md:text-base">
          A website that converts, a data tool, or a full stack app. Tell me what you need and I'll tell you honestly how I'd build it.
        </p>

        {/* the button, with the arrow pointing at it */}
        <div className="relative mt-28 inline-block">
          {/* phones: short arrow straight down */}
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 flex -translate-x-1/2 flex-col items-center sm:hidden">
            <span className="-rotate-6 font-logo text-2xl italic text-accent">Start here</span>
            <TaperArrow points={DOWN_PTS} size={DOWN_SIZE} w0={9} head={10} delay={0.2} className="w-[60px]" />
          </div>

          {/* sm and up: arrow sweeps in from the left */}
          <div className="pointer-events-none absolute bottom-[calc(100%-8px)] right-[calc(100%-24px)] hidden sm:block">
            <span className="mb-1 block -rotate-6 font-logo text-2xl italic text-accent">Start here</span>
            <TaperArrow points={SIDE_PTS} size={SIDE_SIZE} w0={12} delay={0.2} className="w-[150px]" />
          </div>

          <NavLink
            to="/contact"
            className="relative inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-bg shadow-[0_0_40px_rgba(242,98,27,0.3)] transition-all duration-200 hover:scale-105 hover:bg-accent-2 hover:shadow-[0_0_60px_rgba(255,197,66,0.4)]"
          >
            Get In Touch <ArrowUpRight size={16} />
          </NavLink>
        </div>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted">
          or write to{" "}
          <a href={`mailto:${EMAIL}`} className="text-text transition-colors hover:text-accent">
            {EMAIL}
          </a>
        </p>
      </div>
    </motion.section>
  );
}

/* ---------- page ---------- */

export default function About() {
  const reduce = useReducedMotion();

  const rise = (i = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay: 0.1 + i * 0.1, ease: "easeOut" },
  });

  return (
    <div className="relative mx-auto max-w-6xl overflow-x-clip px-6 py-20 md:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      {/* Hero */}
      <div className="relative grid items-center gap-12 md:grid-cols-2">
        <div>
          <motion.div
            {...rise(0)}
            className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/60 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted"
          >
            <span className="relative flex h-2 w-2">
              {!reduce && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Open for new projects
          </motion.div>

          <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.08] tracking-tight text-text md:text-5xl">
            <WordReveal text="I turn business problems into" />{" "}
            <span className="font-logo font-normal italic text-accent">
              <WordReveal text="software that works." delay={0.3} />
            </span>
          </h1>

         <motion.p {...rise(2)} className="mt-6 max-w-md text-sm leading-relaxed text-muted md:text-base">
          I design and build full-stack web apps and AI features from messy data to a clean,
          working interface for people who need something real, not just a prototype. Currently
          sharpening that edge as an AI & Fintech student at Vishwakarma University, Pune.
        </motion.p>

          <motion.div {...rise(3)} className="mt-8 grid max-w-md grid-cols-2 gap-4">
            {quickFacts.map(({ label, value }) => (
              <div key={label} className="border-l-2 border-accent/40 pl-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-text">{value}</p>
              </div>
            ))}
          </motion.div>

          <motion.div {...rise(4)} className="mt-9 flex flex-wrap gap-4">
            <NavLink
              to="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-bg transition-all duration-200 hover:scale-105 hover:bg-accent-2"
            >
              See My Projects <ArrowUpRight size={16} />
            </NavLink>
            <NavLink
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
            >
              Get In Touch
            </NavLink>
          </motion.div>
        </div>

        {/* Portrait, with the handwritten note and arrow */}
        <motion.div
          initial={{ opacity: 0, x: reduce ? 0 : 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.25, ease: "easeOut" }}
          className="flex justify-center md:justify-end"
        >
          <div className="relative w-full max-w-xs md:max-w-sm">
            <span className="absolute left-0 top-0 -rotate-3 font-logo text-2xl italic text-accent">
              Hi, I'm Leo
            </span>
            <div className="pointer-events-none absolute left-[108px] top-1 w-[150px]">
              <TaperArrow points={SIDE_PTS} size={SIDE_SIZE} w0={12} delay={0.9} className="w-full" />
            </div>

            <div className="relative mt-20">
              <div className="absolute -inset-3 rotate-6 rounded-[2.5rem] border border-border bg-gradient-to-br from-accent/15 via-surface to-accent-2/10" />

              <motion.svg
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 h-16 w-16 text-accent/30"
                viewBox="0 0 60 60"
                fill="none"
                aria-hidden="true"
              >
                {Array.from({ length: 5 }).map((_, row) =>
                  Array.from({ length: 5 }).map((_, col) => (
                    <circle key={`${row}-${col}`} cx={6 + col * 12} cy={6 + row * 12} r="2" fill="currentColor" />
                  ))
                )}
              </motion.svg>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-accent-2/25 blur-xl"
              />

              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -left-3 top-4 z-20 flex items-center gap-2 rounded-2xl border border-border bg-bg px-3 py-2 shadow-lg md:-left-5"
              >
                <MapPin size={14} className="shrink-0 text-accent" />
                <p className="text-xs font-semibold text-text">Pune, India</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -bottom-3 -right-3 z-20 flex items-center gap-2 rounded-2xl border border-border bg-bg px-3 py-2 shadow-lg md:-right-5"
              >
                <span className="h-2 w-2 rounded-full bg-accent" />
                <p className="text-xs font-semibold text-text">Full-Stack & AI Dev</p>
              </motion.div>

              <img
                src={heroImg}
                alt="Leo Zuze"
                className="relative z-10 aspect-[4/5] w-full rounded-[2rem] object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* What I can build for you */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="mb-10 mt-28 md:mt-36"
      >
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">What I can build for you</p>
<h2 className="font-heading text-2xl font-bold text-text md:text-3xl">Three ways I can help</h2>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {focusAreas.map((item, i) => (
          <GlowCard key={item.kicker} item={item} index={i} />
        ))}
      </div>

      <ClosingCTA />
    </div>
  );
}