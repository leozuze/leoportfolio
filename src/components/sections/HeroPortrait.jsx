import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import heroImg from "../../assets/images/heroimg.webp";
import AvailabilityCard from "./AvailabilityCard";

export default function HeroPortrait() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 120, damping: 18 };
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), spring);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), spring);

  const onMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { mx.set(0); my.set(0); };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="mx-auto w-full max-w-[280px] sm:max-w-sm lg:max-w-md"
      style={{ perspective: 1200 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative aspect-[4/5]"
      >
        {/* orbit ring: half of it passes in front of the photo, half behind */}
        {!reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 hidden aspect-square w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30 sm:block"
            style={{ rotateX: 72 }}
            animate={{ rotateZ: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
          </motion.div>
        )}

        <div
          aria-hidden
          className="absolute inset-0 rounded-3xl border border-accent/60"
          style={{ transform: "translate3d(18px, 18px, -60px)" }}
        />
        <img
          src={heroImg}
          alt="Leo Zuze"
          width="1200"
          height="1500"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full rounded-3xl object-cover shadow-2xl shadow-black/50"
        />

        <div
          className="absolute -bottom-5 left-5 rounded-xl border border-border bg-bg px-4 py-2.5"
          style={{ transform: "translateZ(70px)" }}
        >
          <p className="text-sm font-semibold text-text">Leo Zuze</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">AI Developer</p>
        </div>

        <div
          className="absolute -top-5 right-2 sm:-bottom-12 sm:-right-10 sm:top-auto"
          style={{ transform: "translateZ(90px)" }}
        >
          <AvailabilityCard />
        </div>
      </motion.div>
    </div>
  );
}