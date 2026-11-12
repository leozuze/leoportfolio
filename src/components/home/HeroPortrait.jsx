import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { heroCutout as cutout, heroPhoto } from "../../lib/heroImage";

const EASE = [0.22, 1, 0.36, 1];

// Tuning: the person's width as a percentage of the circle.
// 68 = head barely above the circle, 72 = about 10% above (matches the reference), 80 = floats too high.
const PERSON_W = 72;

// Edit freely.
const CARD_TOP = { label: "Based in", value: "Pune, India" };
const CARD_BOTTOM = { label: "Availability", value: "Taking new projects" };

function InfoCard({ label, value, className, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={`absolute z-10 rounded-md border border-border bg-surface px-4 py-3 ${className}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-text">{value}</p>
    </motion.div>
  );
}

export default function HeroPortrait() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const spring = { stiffness: 80, damping: 20 };
  const personX = useSpring(useTransform(mx, [-0.5, 0.5], [10, -10]), spring);
  const circleX = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), spring);

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
  };
  const reset = () => mx.set(0);

  /* No cutout file: the photo inside a circle, with an offset red ring */
  if (!cutout) {
    return (
      <div
        onPointerMove={onMove}
        onPointerLeave={reset}
        className="relative mx-auto w-full max-w-[420px] pb-12 md:pb-16"
      >
        <div className="relative aspect-square">
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="absolute inset-0 translate-x-4 translate-y-4 rounded-full border-2 border-accent"
          />
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
            className="relative h-full w-full overflow-hidden rounded-full bg-ink"
          >
            <motion.img
              src={heroPhoto}
              alt="Leo Zuze"
              width="1200"
              height="1500"
              fetchPriority="high"
              decoding="async"
              style={reduce ? undefined : { x: personX, scale: 1.08 }}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>

        <InfoCard {...CARD_TOP} delay={1.1} className="right-0 top-[10%] hidden sm:block" />
        <InfoCard {...CARD_BOTTOM} delay={1.25} className="bottom-[22%] left-0 md:-left-5" />
      </div>
    );
  }

  /* Cutout: red circle, head rises above it, cut flat where the marquee starts */
  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="relative mx-auto w-full max-w-[460px] pt-14 md:pt-8"
    >
      <div
        className="relative aspect-[1/0.82]"
        style={{ clipPath: "inset(-30% -8% 0 -8%)" }}
      >
        {/* outlined ring */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
          className="absolute -left-[6%] -top-[6%] aspect-square w-[112%] rounded-full border-2 border-ink/10"
        />

        {/* solid circle */}
        <motion.div
          aria-hidden
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: EASE }}
          style={{ x: reduce ? 0 : circleX, transformOrigin: "50% 100%" }}
          className="absolute left-0 top-0 aspect-square w-full rounded-full bg-accent"
        />

        {/* person, rises from behind the marquee edge */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: EASE }}
          style={{ width: `${PERSON_W}%` }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
        >
          <motion.img
            src={cutout}
            alt="Leo Zuze"
            width="960"
            height="1240"
            fetchPriority="high"
            decoding="async"
            style={reduce ? undefined : { x: personX }}
            className="block h-auto w-full"
          />
        </motion.div>
      </div>

      <InfoCard {...CARD_TOP} delay={1.1} className="right-0 top-[26%] hidden sm:block md:-right-3" />
      <InfoCard {...CARD_BOTTOM} delay={1.25} className="bottom-[14%] left-0 md:-left-5" />
    </div>
  );
}