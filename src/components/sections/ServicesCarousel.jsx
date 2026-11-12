import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { NavLink } from "react-router-dom";
import { services, getWhatsAppLink } from "../../data/services";
import { SplitText, WordFade } from "../motion/TextReveal";
import { Flicks, FlowLines } from "../ui/Curves";
import { scrollToY } from "../../lib/lenis";

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { stiffness: 200, damping: 20 };
const pad = (n) => String(n).padStart(2, "0");

// Flat button that fills from the bottom on hover
const BTN =
  "group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md px-5 py-3 text-sm font-semibold transition-colors duration-300 before:absolute before:inset-0 before:translate-y-full before:transition-transform before:duration-300 before:ease-out hover:before:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:before:transition-none";

const CARD_W = "w-[82vw] shrink-0 sm:w-[420px]";

const Line = ({ children }) => (
  <span className="block overflow-hidden pb-[0.14em] pr-2">{children}</span>
);

function IntroBlock({ className = "" }) {
  return (
    <div className={`relative flex flex-col justify-between gap-8 ${className}`}>
      <div>
        <div className="flex items-center gap-4">
          <span aria-hidden className="block h-px w-12 bg-ink" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            What I build
          </p>
        </div>

        <h2 className="mt-6 font-heading text-[2.1rem] font-extrabold leading-[1.04] tracking-tight text-text sm:text-[2.6rem]">
          <Line>
            <SplitText text="What I can" inView />
          </Line>
          <Line>
            <SplitText text="build for your" inView delay={0.15} />
          </Line>
          <span className="relative block">
            <Line>
              <SplitText text="business." inView delay={0.3} className="text-accent" />
            </Line>
            <Flicks
              inView
              delay={1}
              className="absolute left-[5.4em] top-[0.05em] h-[0.7em] w-[0.7em] text-accent"
            />
          </span>
        </h2>

        <WordFade
          inView
          delay={0.5}
          text="Five services, one developer. Every project starts with a short chat and a fixed quote, so you know the price before any work begins."
          className="mt-5 max-w-sm text-sm leading-relaxed text-muted"
        />
      </div>

      <motion.p
        whileInView={{ x: [0, 6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="text-xs font-semibold uppercase tracking-[0.16em] text-muted"
      >
        Keep scrolling &rarr;
      </motion.p>
    </div>
  );
}

/* "From $150": the number counts up the first time it is seen */
function PriceTag({ price }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const parts = useMemo(() => {
    const m = /^(.*?)(\d[\d,]*)(.*)$/.exec(price ?? "");
    return m ? { pre: m[1], num: Number(m[2].replace(/,/g, "")), post: m[3] } : null;
  }, [price]);
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString("en-US"));

  useEffect(() => {
    if (!parts) return;
    if (reduce) {
      mv.set(parts.num);
      return;
    }
    if (!inView) return;
    const controls = animate(mv, parts.num, { duration: 1.1, ease: EASE });
    return () => controls.stop();
  }, [inView, reduce, parts, mv]);

  if (!parts) {
    return (
      <p className="font-heading text-2xl font-extrabold text-text">
        {price ?? "Let\u2019s talk"}
      </p>
    );
  }

  return (
    <p ref={ref} className="font-heading text-2xl font-extrabold text-text">
      {parts.pre}
      <motion.span>{text}</motion.span>
      {parts.post}
    </p>
  );
}

/* fx (optional) carries scroll-driven values from the track:
   scale, numeralX and ringOpacity. Without it the card is static. */
function ServiceCard({ s, i, fx, className = "w-full" }) {
  const reduce = useReducedMotion();
  const Icon = s.icon;
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rotateY = useSpring(tx, SPRING);
  const rotateX = useSpring(ty, SPRING);

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    tx.set(((e.clientX - r.left) / r.width - 0.5) * 7);
    ty.set(-((e.clientY - r.top) / r.height - 0.5) * 7);
  };
  const onLeave = () => {
    tx.set(0);
    ty.set(0);
  };

  return (
    <motion.article
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        ...(fx ? { scale: fx.scale } : null),
      }}
      className={`group/card relative flex h-full min-h-[26rem] flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface p-7 transition-[translate,border-color] duration-300 hover:-translate-y-1.5 hover:border-ink motion-reduce:transform-none motion-reduce:transition-none ${className}`}
    >
      {/* ink outline while the card is in the centre of the screen */}
      <motion.span
        aria-hidden
        style={{ opacity: fx ? fx.ringOpacity : 0 }}
        className="pointer-events-none absolute inset-0 rounded-xl border-2 border-ink"
      />

      <motion.span
        aria-hidden
        style={{ x: fx ? fx.numeralX : 0, WebkitTextStroke: "1px rgba(22,20,15,0.12)" }}
        className="pointer-events-none absolute -right-1 -top-4 select-none font-heading text-[7.5rem] font-extrabold leading-none text-transparent transition-transform duration-500 group-hover/card:-translate-x-2 motion-reduce:transform-none"
      >
        {pad(i + 1)}
      </motion.span>

      <div className="relative">
        <span className="grid h-12 w-12 place-items-center rounded-md bg-ink text-on-ink transition-colors duration-300 group-hover/card:bg-accent">
          <Icon size={22} aria-hidden />
        </span>

        <h3 className="mt-7 max-w-[18rem] font-heading text-2xl font-extrabold leading-tight tracking-tight text-text">
          {s.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{s.tagline}</p>

        <ul className="mt-6 divide-y divide-border border-t border-border text-sm text-text/80">
          {s.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 py-2.5">
              <Check size={15} aria-hidden className="mt-0.5 shrink-0 text-accent" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-7 flex items-center justify-between gap-4">
        <div>
          <PriceTag price={s.price} />
          <p className="text-xs text-muted">Fixed quote, no surprises</p>
        </div>

        <a
          href={getWhatsAppLink(s.title)}
          target="_blank"
          rel="noreferrer"
          className={`${BTN} bg-ink text-on-ink before:bg-accent`}
        >
          <span className="relative">{s.cta}</span>
          <ArrowUpRight
            size={16}
            aria-hidden
            className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        </a>
      </div>
    </motion.article>
  );
}

function EndCard({ className = "w-full" }) {
  return (
    <article
      className={`relative flex h-full min-h-[26rem] flex-col justify-between overflow-hidden rounded-xl bg-ink p-7 text-on-ink ${className}`}
    >
      <FlowLines
        className="text-white/[0.12]"
        count={5}
        gap={28}
        inView
        accentLine={2}
        accentColor="var(--color-accent-soft)"
      />
      <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-on-ink/60">
        Not sure what you need?
      </p>
      <div className="relative">
        <h3 className="font-heading text-3xl font-extrabold leading-tight tracking-tight">
          Describe the problem. I&rsquo;ll suggest the fix.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-on-ink/65">
          Tell me what slows your team down. I&rsquo;ll recommend the simplest
          solution and what it would cost.
        </p>
        <NavLink
          to="/contact"
          className={`${BTN} mt-7 bg-on-ink text-ink before:bg-accent hover:text-on-accent`}
        >
          <span className="relative">Talk to me</span>
          <ArrowUpRight
            size={16}
            aria-hidden
            className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        </NavLink>
      </div>
    </article>
  );
}

/* An item on the scrolling track. It measures itself, so everything follows how close it is
   to the screen centre: it reveals as it arrives from the right and un-reveals if you scroll
   back, scales up in the middle, and the numeral drifts. children receives { scale, numeralX, ringOpacity }. */
function TrackItem({ x, register, children }) {
  const el = useRef(null);
  const left = useMotionValue(0);
  const width = useMotionValue(420);

  useLayoutEffect(() => {
    const node = el.current;
    if (!node) return;
    const measure = () => {
      left.set(node.offsetLeft);
      width.set(node.offsetWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [left, width]);

  const center = useTransform(
    [x, left, width],
    ([xv, l, w]) => l + xv + w / 2 - window.innerWidth / 2
  );
  // 0 while still off-screen to the right, 1 once it has arrived; scrolling back reverses it
  const reveal = useTransform(center, (c) =>
    Math.min(1, Math.max(0, (window.innerWidth / 2 + 140 - c) / 300))
  );
  const rise = useTransform(reveal, [0, 1], [40, 0]);
  const scale = useTransform(center, [-700, 0, 700], [0.94, 1, 0.94]);
  const numeralX = useTransform(center, [-700, 700], [24, -24]);
  const ringOpacity = useTransform(center, [-260, 0, 260], [0, 1, 0]);

  return (
    <motion.div
      ref={(node) => {
        el.current = node;
        register?.(node);
      }}
      style={{ opacity: reveal, y: rise }}
      className={CARD_W}
    >
      {children({ scale, numeralX, ringOpacity })}
    </motion.div>
  );
}

export default function ServicesCarousel() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const track = useRef(null);
  const cards = useRef([]);
  const [dist, setDist] = useState(0);
  const [active, setActive] = useState(0);
  const total = services.length;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const ghostX = useTransform(scrollYProgress, [0, 1], [0, dist * 0.3]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const idx = Math.min(total - 1, Math.max(0, Math.floor(p * (total + 0.99))));
    setActive((prev) => (prev === idx ? prev : idx));
  });

  useLayoutEffect(() => {
    if (!track.current) return;
    const measure = () =>
      setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* the service index: scroll so that card i sits at the left edge */
  const jumpTo = (i) => {
    const card = cards.current[i];
    const section = ref.current;
    const trackEl = track.current;
    if (!card || !section || !trackEl) return;
    const pad0 = parseFloat(getComputedStyle(trackEl).paddingLeft) || 0;
    const progress = dist > 0 ? Math.min(1, Math.max(0, (card.offsetLeft - pad0) / dist)) : 0;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const range = section.offsetHeight - window.innerHeight;
    scrollToY(top + progress * range);
  };

  /* reduced motion: a normal grid, no scroll-driven movement */
  if (reduce) {
    return (
      <section ref={ref} aria-label="Services" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <IntroBlock className="max-w-xl" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ServiceCard key={s.id} s={s} i={i} />
          ))}
          <EndCard />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      aria-label="Services"
      style={{ height: `calc(100svh - 6rem + ${dist}px)` }}
    >
      <div className="sticky top-20 flex h-[calc(100svh-6rem)] flex-col justify-center overflow-hidden">
        <motion.span
          aria-hidden
          style={{ x: ghostX, WebkitTextStroke: "1px rgba(22,20,15,0.08)" }}
          className="pointer-events-none absolute bottom-16 left-0 select-none whitespace-nowrap font-heading text-[26vw] font-extrabold leading-none text-transparent md:bottom-20 md:text-[15rem]"
        >
          Services
        </motion.span>

        <motion.div
          ref={track}
          style={{ x }}
          className="relative flex w-max items-stretch gap-6 px-6 md:gap-8 md:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
        >
          <IntroBlock className="w-[80vw] shrink-0 sm:w-[420px]" />

          {services.map((s, i) => (
            <TrackItem
              key={s.id}
              x={x}
              register={(node) => {
                cards.current[i] = node;
              }}
            >
              {(fx) => <ServiceCard s={s} i={i} fx={fx} />}
            </TrackItem>
          ))}

          <TrackItem x={x}>{() => <EndCard />}</TrackItem>
        </motion.div>

        <div className="relative mx-auto mt-8 flex w-full max-w-6xl items-center gap-4 px-6 sm:gap-6">
          <div className="min-w-0 flex-1 overflow-hidden text-sm font-semibold text-text">
            <AnimatePresence mode="wait">
              <motion.p
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="truncate"
              >
                <span className="text-accent">{pad(active + 1)}</span> / {pad(total)}
                <span className="mx-2 text-muted">&mdash;</span>
                {services[active].title}
              </motion.p>
            </AnimatePresence>
          </div>

          <div role="group" aria-label="Jump to a service" className="hidden items-center sm:flex">
            {services.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpTo(i)}
                aria-label={`Go to ${s.title}`}
                aria-current={i === active ? "true" : undefined}
                className="group/seg grid h-8 w-8 place-items-center focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span
                  className={`block transition-all duration-300 ${
                    i === active
                      ? "h-1 w-6 bg-accent"
                      : "h-0.5 w-5 bg-ink/25 group-hover/seg:bg-ink/60"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="h-px w-24 shrink-0 bg-ink/15 sm:w-48">
            <motion.div
              style={{ scaleX: scrollYProgress }}
              className="h-px origin-left bg-accent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}