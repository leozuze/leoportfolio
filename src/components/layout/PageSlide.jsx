import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useIsMobile } from "../../hooks/useIsMobile";

// The sheet that slides over the pinned hero
export default function PageSlide({ children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const scale = useTransform(p, [0, 1], [mobile ? 0.97 : 0.92, 1]);
  const radius = useTransform(p, [0, 1], [40, 0]);

  return (
    <motion.div
      ref={ref}
      style={
        reduce
          ? undefined
          : { scale, borderTopLeftRadius: radius, borderTopRightRadius: radius, transformOrigin: "50% 0%" }
      }
      className="relative z-10 border-t border-border bg-bg shadow-[0_-40px_80px_-20px_rgba(0,0,0,0.6)]"
    >
      <div aria-hidden className="mx-auto mt-3 h-1 w-12 rounded-full bg-border" />
      {children}
    </motion.div>
  );
}