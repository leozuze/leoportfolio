import { useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { GrainGradient } from "@paper-design/shaders-react";
import { useAmbient } from "../../hooks/useAmbient";
import { useIsMobile } from "../../hooks/useIsMobile";

const lerp = (a, b, t) => a + (b - a) * t;

// The Paper grain shader, but its offset follows pointer/tilt and (optionally) scroll.
export default function ReactiveGrain({ base, follow = 0.2, sweep = null, paused = false }) {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const { x, y } = useAmbient();
  const { scrollYProgress } = useScroll();
  const last = useRef(0);
  const [o, setO] = useState({ ox: 0, oy: 0, rot: 0 });

  const update = () => {
    if (reduce || paused) return;
    const now = performance.now();
    if (now - last.current < (mobile ? 50 : 33)) return; // cap re-renders
    last.current = now;
    const p = sweep ? scrollYProgress.get() : 0;
    const ox = +((sweep ? lerp(sweep.ox[0], sweep.ox[1], p) : 0) + x.get() * follow).toFixed(3);
    const oy = +((sweep ? lerp(sweep.oy[0], sweep.oy[1], p) : 0) + y.get() * follow * 0.7).toFixed(3);
    const rot = sweep ? Math.round(lerp(sweep.rot[0], sweep.rot[1], p)) : 0;
    setO((prev) => (prev.ox === ox && prev.oy === oy && prev.rot === rot ? prev : { ox, oy, rot }));
  };
  useMotionValueEvent(x, "change", update);
  useMotionValueEvent(y, "change", update);
  useMotionValueEvent(scrollYProgress, "change", () => sweep && update());

  return (
    <GrainGradient
      style={{ width: "100%", height: "100%" }}
      colors={base.colors}
      colorBack="#141416"
      softness={base.softness ?? 0.85}
      intensity={base.intensity ?? 0.5}
      noise={base.noise ?? 0.4}
      shape={base.shape}
      scale={base.scale ?? 1.1}
      offsetX={(base.offsetX ?? 0) + o.ox}
      offsetY={(base.offsetY ?? 0) + o.oy}
      rotation={(base.rotation ?? 0) + o.rot}
      speed={reduce || paused ? 0 : mobile ? 0.18 : 0.3}
      maxPixelCount={mobile ? 600000 : 1500000}
    />
  );
}