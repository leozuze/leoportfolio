import { useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { Flicks, FlowLines } from "../ui/Curves";

const WHAT = ["AI chatbots", "AI agents", "Automation", "Knowledge assistants", "Web apps"];
const FOR = ["Customer support", "Lead capture", "Internal tools", "Dashboards", "Integrations"];

const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

function Diamond({ outline = false }) {
  return (
    <span
      aria-hidden
      className={`mx-8 inline-block h-3 w-3 shrink-0 rotate-45 sm:mx-12 sm:h-4 sm:w-4 ${
        outline ? "border-2 border-accent-soft" : "bg-accent-soft"
      }`}
    />
  );
}

function Row({ items, outline = false, hidden = false }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item} className="flex items-center whitespace-nowrap">
          <span
            className={
              outline
                ? "text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl"
                : "text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
            }
            style={outline ? { WebkitTextStroke: "1.5px rgba(245,240,230,0.6)" } : undefined}
          >
            {item}
          </span>
          <Diamond outline={outline} />
        </li>
      ))}
    </ul>
  );
}

/* One scrolling row. speed is % of the track per second.
   Scrolling down speeds it up, scrolling up reverses it. */
function Track({ speed, direction, boost, activeRef, pausedRef, className = "", children }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const x = useTransform(baseX, (v) => `${v}%`);
  const dir = useRef(direction);

  useAnimationFrame((_, delta) => {
    if (reduce || !activeRef.current || pausedRef.current) return;
    const b = boost.get();
    if (b < -0.05) dir.current = -direction;
    else if (b > 0.05) dir.current = direction;
    const move = dir.current * speed * (delta / 1000) * (1 + Math.abs(b));
    baseX.set(wrap(-50, 0, baseX.get() + move));
  });

  return (
    <motion.div style={{ x }} className={`relative flex w-max ${className}`}>
      {children}
    </motion.div>
  );
}

export default function ServicesMarquee() {
  const bandRef = useRef(null);
  const inView = useInView(bandRef);
  const activeRef = useRef(false);
  const pausedRef = useRef(false);

  // only animate while the band is on screen
  useEffect(() => {
    activeRef.current = inView;
  }, [inView]);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smooth, [-1500, 0, 1500], [-4, 0, 4], { clamp: false });

  return (
    <div
      ref={bandRef}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      role="group"
      aria-label="What I build and what it does for you"
      className="relative overflow-hidden bg-ink pb-12 pt-14 text-on-ink md:pb-16 md:pt-16"
    >
      {/* flat shapes and fine lines, kept behind the text */}
      <FlowLines
        className="text-white/[0.14]"
        count={5}
        gap={30}
        inView
        accentLine={2}
        accentColor="var(--color-accent-soft)"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-28 h-72 w-72 rounded-full bg-accent"
      />

      {/* header row */}
      <div className="relative mx-auto mb-8 flex max-w-6xl items-end justify-between px-6">
        <div className="flex items-center gap-4">
          <span aria-hidden className="block h-px w-12 bg-accent-soft" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-ink/60">
            What I build, and what it does for you
          </p>
        </div>
        <Flicks inView className="h-11 w-11 text-accent-soft" />
      </div>

      <Track speed={1.25} direction={-1} boost={boost} activeRef={activeRef} pausedRef={pausedRef}>
        <Row items={WHAT} />
        <Row items={WHAT} hidden />
      </Track>

      <Track
        speed={0.9}
        direction={1}
        boost={boost}
        activeRef={activeRef}
        pausedRef={pausedRef}
        className="mt-6 md:mt-8"
      >
        <Row items={FOR} outline />
        <Row items={FOR} outline hidden />
      </Track>
    </div>
  );
}