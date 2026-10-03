import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence, motion, useMotionValueEvent, useReducedMotion,
  useScroll, useSpring, useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { projects } from "../../data/projects";
import { techIcons } from "../../data/skills";
import { useIsMobile } from "../../hooks/useIsMobile";
import { WordReveal } from "../motion/primitives";

const live = projects.filter((p) => p.category === "Websites");
const n = live.length;

/* a bad or missing url must not crash the page */
const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
};

function useViewportWidth() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const f = () => setW(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return w;
}

/* one card on the ring. `active` runs 0 .. n-1 as you scroll, so `d` is its distance from the front */
function RingCard({ p, i, active, cfg }) {
  const { w, h, R, step } = cfg;
  const rad = Math.PI / 180;
  const d = useTransform(active, (a) => i - a);
  const x = useTransform(d, (v) => R * Math.sin(v * step * rad));
  const z = useTransform(d, (v) => R * Math.cos(v * step * rad) - R);
  const rotateY = useTransform(d, (v) => v * step);
  const scale = useTransform(d, (v) => 1 - 0.08 * Math.min(Math.abs(v), 1.5));
  const opacity = useTransform(d, (v) => 1 - 0.25 * Math.min(Math.abs(v), 2));
  const shade = useTransform(d, (v) => Math.min(Math.abs(v), 1) * 0.55);
  const zIndex = useTransform(d, (v) => Math.round(100 - Math.abs(v) * 20));
  const pointerEvents = useTransform(d, (v) => (Math.abs(v) < 0.5 ? "auto" : "none"));
  const host = hostOf(p.url);

  return (
    <motion.div
      style={{
        position: "absolute", left: "50%", top: "50%", width: w, height: h,
        marginLeft: -w / 2, marginTop: -h / 2, x, z, rotateY, scale, opacity, zIndex, pointerEvents,
      }}
    >
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${p.title}`}
        className="relative block h-full w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/50"
      >
        <div className="flex h-8 items-center gap-1.5 border-b border-border px-3">
          {[0, 1, 2].map((k) => (
            <span key={k} className="h-1.5 w-1.5 rounded-full bg-border" />
          ))}
          <span className="ml-2 truncate font-mono text-[10px] text-muted">{host}</span>
        </div>
        <img src={p.image} alt={`${p.title} website`} loading="lazy" decoding="async" className="h-[calc(100%-2rem)] w-full object-cover" />
        <motion.span aria-hidden style={{ opacity: shade }} className="absolute inset-0 bg-bg" />
      </a>
    </motion.div>
  );
}

export default function FeaturedProjects() {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const vw = useViewportWidth();
  const ref = useRef(null);
  const [idx, setIdx] = useState(0);

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const raw = useTransform(p, [0.06, 0.94], [0, Math.max(0, n - 1)]);
  const active = useSpring(raw, { stiffness: 110, damping: 24 });
  useMotionValueEvent(active, "change", (v) => setIdx(Math.min(n - 1, Math.max(0, Math.round(v)))));

  const w = mobile ? Math.min(vw * 0.78, 340) : Math.min(560, Math.max(360, vw * 0.5));
  const cfg = { w, h: w * 0.66, R: w * (mobile ? 0.75 : 0.95), step: mobile ? 46 : 38 };
  const cur = live[idx] ?? live[0];

  if (!cur) return null; // no live projects: render nothing instead of crashing

  if (reduce) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-heading text-3xl font-semibold text-text md:text-4xl">Live right now</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {live.map((pr) => (
            <a key={pr.title} href={pr.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl border border-border bg-surface">
              <img src={pr.image} alt={pr.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
              <div className="p-4">
                <h3 className="font-heading text-lg font-semibold text-text">{pr.title}</h3>
                <p className="mt-1 text-sm text-muted">{pr.tagline}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} style={{ height: `${100 + (n - 1) * 85}svh` }}>
      <div className="sticky top-20 flex h-[calc(100svh-5rem)] flex-col px-6">
        <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-4 pt-4 md:pt-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Selected work</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold leading-tight tracking-tight text-text md:text-4xl">
              <WordReveal text="Live right now," />{" "}
              <span className="font-logo font-normal italic text-accent">
                <WordReveal text="built for real businesses." delay={0.2} />
              </span>
            </h2>
          </div>
          <NavLink
            to="/projects"
            className="hidden shrink-0 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent sm:inline-flex"
          >
            All projects <ArrowUpRight size={16} />
          </NavLink>
        </div>

        {/* the ring (clipped sideways so side cards can't widen the page) */}
        <div
          className="relative min-h-0 flex-1 overflow-x-clip"
          style={{ perspective: 1300, perspectiveOrigin: "50% 45%" }}
        >
          {live.map((pr, i) => (
            <RingCard key={pr.title} p={pr} i={i} active={active} cfg={cfg} />
          ))}
        </div>

        {/* details for the project at the front */}
        <div className="mx-auto w-full max-w-2xl pb-4 text-center md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
                <span className="text-accent">{String(idx + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")} · {cur.subCategory}
              </p>
              <h3 className="mt-2 font-heading text-2xl font-semibold text-text md:text-3xl">{cur.title}</h3>
              <p className="mt-1 text-sm font-medium text-accent">{cur.tagline}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted sm:line-clamp-3">{cur.description}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {(cur.highlights ?? []).slice(0, 4).map((t) => {
                  const Icon = techIcons[t];
                  return (
                    <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted">
                      {Icon && <Icon size={12} className="text-accent" />}
                      {t}
                    </span>
                  );
                })}
              </div>
              <a
                href={cur.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-accent-2"
              >
                Visit live site <ArrowUpRight size={16} />
              </a>
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 flex justify-center gap-2">
            {live.map((_, k) => (
              <span key={k} className={`h-1 rounded-full transition-all ${k === idx ? "w-8 bg-accent" : "w-3 bg-border"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}