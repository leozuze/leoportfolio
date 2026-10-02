import { useLayoutEffect, useRef, useState } from "react";
import {
  motion, useMotionTemplate, useMotionValue, useReducedMotion,
  useScroll, useSpring, useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { services, getWhatsAppLink } from "../../data/services";
import { WordReveal } from "../motion/primitives";
import { useIsMobile } from "../../hooks/useIsMobile";

function ServiceCard({ s, i, total, x }) {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const outer = useRef(null);
  const m = useRef({ left: 0, w: 420 });
  const [, tick] = useState(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(260px circle at ${gx}% ${gy}%, rgba(242,98,27,0.16), transparent 70%)`;

  // Distance of this card's centre from the screen centre, in px
  const center = useTransform(x, (v) => m.current.left + v + m.current.w / 2 - window.innerWidth / 2);

  // 0 = just off the right edge, 1 = arrived. Narrow range = quick arrival.
  const arrive = useTransform(center, (c) => {
    const vw = window.innerWidth;
    const start = vw / 2 + 140;
    const end = vw * 0.22;
    return Math.min(1, Math.max(0, (start - c) / (start - end)));
  });
  const spring = { stiffness: 190, damping: 20 };
  const enterY = useSpring(useTransform(arrive, [0, 1], [150, 0]), spring);
  const enterRotate = useSpring(useTransform(arrive, [0, 1], [7, 0]), spring);
  const enterOpacity = useTransform(arrive, [0, 0.5], [0, 1]);

  const tilt = mobile ? 8 : 18;
  const rotateY = useTransform(center, [-700, 0, 700], [tilt, 0, -tilt]);
  const scale = useTransform(center, [-700, 0, 700], [0.9, 1, 0.9]);
  const numX = useTransform(center, [-700, 700], [50, -50]);
  const content = useTransform(center, [-500, 0, 500], [0.45, 1, 0.45]);

  useLayoutEffect(() => {
    const measure = () => {
      m.current = { left: outer.current.offsetLeft, w: outer.current.offsetWidth };
      tick((n) => n + 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    gx.set(((e.clientX - r.left) / r.width) * 100);
    gy.set(((e.clientY - r.top) / r.height) * 100);
  };

  return (
    <motion.div
      ref={outer}
      style={
        reduce
          ? undefined
          : { rotateY, rotateZ: enterRotate, scale, y: enterY, opacity: enterOpacity, transformPerspective: 1200 }
      }
      className="w-[82vw] shrink-0 sm:w-[420px]"
    >
      {/* inner card floats on its own loop, independent of the scroll-driven outer */}
      <motion.article
        onPointerMove={onMove}
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 4.5 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
        className="group relative flex h-[min(68svh,540px)] w-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-accent"
      >
        <motion.div
          aria-hidden
          style={{ background: glare }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <motion.span
          aria-hidden
          style={{ x: numX, WebkitTextStroke: "1px rgba(242,98,27,0.28)" }}
          className="pointer-events-none absolute -right-2 -top-6 select-none font-logo text-[9rem] italic leading-none text-transparent"
        >
          {String(i + 1).padStart(2, "0")}
        </motion.span>

        <motion.div style={{ opacity: content }} className="relative flex h-full flex-col justify-between">
          <div>
            <div className="font-mono text-xs text-muted">
              {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              {s.status === "in-development" && <span className="ml-3 text-accent">In development</span>}
            </div>
            <h3 className="mt-8 font-heading text-2xl font-semibold text-text">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.tagline}</p>
            <ul className="mt-6 divide-y divide-border/70 border-t border-border/70 text-sm text-muted">
              {s.features.map((f) => (
                <li key={f} className="py-2.5">{f}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-text">{s.price ?? "Let's talk"}</span>
            <a
              href={getWhatsAppLink(s.title)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
            >
              {s.cta} <ArrowUpRight size={14} />
            </a>
          </div>
        </motion.div>
      </motion.article>
    </motion.div>
  );
}

export default function ServicesCarousel() {
  const ref = useRef(null);
  const track = useRef(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const ghostX = useTransform(scrollYProgress, [0, 1], [0, dist * 0.35]);

  useLayoutEffect(() => {
    const measure = () => setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section ref={ref} style={{ height: `calc(100svh + ${dist}px)` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-20">
        <motion.span
          aria-hidden
          style={{ x: ghostX, WebkitTextStroke: "1px rgba(250,250,248,0.07)" }}
          className="pointer-events-none absolute bottom-16 left-0 select-none whitespace-nowrap font-logo text-[28vw] italic leading-none text-transparent md:text-[16rem]"
        >
          Services
        </motion.span>

        <motion.div
          ref={track}
          style={{ x }}
          className="relative flex w-max gap-6 px-6 md:gap-8 md:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
        >
          <div className="flex w-[80vw] shrink-0 flex-col justify-between sm:w-[360px]">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">What I do</p>
            <h2 className="font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-text md:text-5xl">
              <WordReveal text="Everything your business needs" />{" "}
              <span className="font-logo font-normal italic text-accent">
                <WordReveal text="online." delay={0.3} />
              </span>
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Keep scrolling →</p>
          </div>

          {services.map((s, i) => (
            <ServiceCard key={s.id} s={s} i={i} total={services.length} x={x} />
          ))}
        </motion.div>

        <div className="mx-auto mt-10 h-px w-full max-w-6xl bg-border px-6">
          <motion.div style={{ scaleX: scrollYProgress }} className="h-px origin-left bg-accent" />
        </div>
      </div>
    </section>
  );
}