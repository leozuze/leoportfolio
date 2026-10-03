import { motion, useReducedMotion } from "framer-motion";
import Drift from "../ui/Drift";
import { Cube } from "../ui/Wireframes";

/* ---------- Services: turning dashed circles + wireframe cubes ---------- */
export function ServicesMotif() {
  const reduce = useReducedMotion();
  return (
    <>
      <Drift strength={-30} className="-left-40 top-[12%] aspect-square w-[520px] max-w-[90vw]">
        {[1, 0.72, 0.46].map((s, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-dashed border-accent/20"
            style={{ scale: s }}
            animate={reduce ? undefined : { rotate: i % 2 ? -360 : 360 }}
            transition={{ duration: 90 + i * 30, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </Drift>
      <Drift strength={60} className="right-[8%] top-[18%] hidden sm:block">
        <Cube size={90} />
      </Drift>
      <Drift strength={90} className="bottom-[14%] right-[24%] hidden sm:block">
        <Cube size={44} />
      </Drift>
    </>
  );
}

/* ---------- Projects: floating browser-window outlines ---------- */
function Win({ w, h, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="rounded-xl border border-accent/25"
      style={{ width: w, height: h }}
      animate={reduce ? undefined : { y: [0, -14, 0] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div className="flex gap-1.5 border-b border-accent/20 px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-accent/30" />
        ))}
      </div>
      <div className="mx-3 mt-3 h-1.5 w-1/2 rounded-full bg-accent/15" />
      <div className="mx-3 mt-2 h-1.5 w-1/3 rounded-full bg-accent/10" />
    </motion.div>
  );
}

export function ProjectsMotif() {
  return (
    <>
      <Drift strength={50} className="-right-10 top-[10%] rotate-6 sm:right-[4%]">
        <Win w={220} h={150} />
      </Drift>
      <Drift strength={-40} className="-left-12 bottom-[12%] -rotate-6 sm:left-[3%]">
        <Win w={180} h={120} delay={1.5} />
      </Drift>
      <Drift strength={80} className="bottom-[30%] right-[30%] hidden rotate-3 sm:block">
        <Win w={120} h={84} delay={3} />
      </Drift>
    </>
  );
}

/* ---------- Skills: orbit system ---------- */
export function SkillsMotif() {
  const reduce = useReducedMotion();
  return (
    <>
      <Drift strength={45} className="-right-48 top-[8%] aspect-square w-[560px] max-w-[110vw]">
        {[100, 72, 46].map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-accent/20"
            style={{ inset: `${(100 - p) / 2}%` }}
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 30 + i * 18, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/70" />
          </motion.div>
        ))}
        <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/60" />
      </Drift>
      <Drift strength={-30} className="bottom-[10%] left-[6%] hidden sm:block">
        <div className="grid grid-cols-4 gap-5 font-mono text-lg text-accent/30">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i}>+</span>
          ))}
        </div>
      </Drift>
    </>
  );
}

/* ---------- CTA: ripples spreading from the centre ---------- */
export function CtaMotif() {
  const reduce = useReducedMotion();
  return (
    <Drift strength={30} className="left-1/2 top-1/2 aspect-square w-[min(720px,120vw)] -translate-x-1/2 -translate-y-1/2">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-accent/30"
          initial={{ scale: 0.2, opacity: 0 }}
          animate={reduce ? { scale: 0.4 + i * 0.2, opacity: 0.2 } : { scale: [0.2, 1], opacity: [0.5, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: i * 1.5, ease: "easeOut" }}
        />
      ))}
    </Drift>
  );
}