import { motion, useReducedMotion, useTransform } from "framer-motion";
import { useAmbient } from "../../hooks/useAmbient";

// Positions a decoration and nudges it with the pointer / phone tilt.
// Different `strength` values on different layers give a sense of depth.
export default function Drift({ strength = 40, className = "", children }) {
  const reduce = useReducedMotion();
  const { x, y } = useAmbient();
  const tx = useTransform(x, (v) => v * strength);
  const ty = useTransform(y, (v) => v * strength * 0.7);
  return (
    <motion.div aria-hidden className={`pointer-events-none absolute ${className}`} style={reduce ? undefined : { x: tx, y: ty }}>
      {children}
    </motion.div>
  );
}