import { motion, useReducedMotion } from "framer-motion";

export function Cube({ size = 130 }) {
  const reduce = useReducedMotion();
  const h = size / 2;
  const faces = [
    `rotateY(0deg) translateZ(${h}px)`, `rotateY(90deg) translateZ(${h}px)`,
    `rotateY(180deg) translateZ(${h}px)`, `rotateY(-90deg) translateZ(${h}px)`,
    `rotateX(90deg) translateZ(${h}px)`, `rotateX(-90deg) translateZ(${h}px)`,
  ];
  return (
    <div style={{ width: size, height: size, perspective: 800 }}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={reduce ? undefined : { rotateX: 360, rotateY: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        {faces.map((t, i) => (
          <span key={i} className="absolute inset-0 border border-accent/30" style={{ transform: t }} />
        ))}
      </motion.div>
    </div>
  );
}

export function Rings({ size = 190 }) {
  const reduce = useReducedMotion();
  return (
    <div style={{ width: size, height: size, perspective: 800 }}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={reduce ? undefined : { rotateY: 360, rotateX: 30 }}
        transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
      >
        {[0, 60, 120].map((deg) => (
          <span
            key={deg}
            className="absolute inset-0 rounded-full border border-accent/30"
            style={{ transform: `rotateY(${deg}deg)` }}
          />
        ))}
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
      </motion.div>
    </div>
  );
}