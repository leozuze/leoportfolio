import { motion, useReducedMotion, useTransform } from "framer-motion";
import { useAmbient } from "../../hooks/useAmbient";

// A soft colour blob that drifts with the pointer / phone tilt.
// Width is capped at 90vw so it never overflows a phone.
export default function Glow({ color = "rgba(255,197,66,0.2)", size = 520, strength = 60, className = "" }) {
  const reduce = useReducedMotion();
  const { x, y } = useAmbient();
  const tx = useTransform(x, (v) => v * strength);
  const ty = useTransform(y, (v) => v * strength * 0.7);
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: `min(${size}px, 90vw)`,
        aspectRatio: "1",
        x: reduce ? 0 : tx,
        y: reduce ? 0 : ty,
        background: `radial-gradient(circle, ${color}, transparent 65%)`,
      }}
    />
  );
}