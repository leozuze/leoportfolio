import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import ReactiveGrain from "./ReactiveGrain";
import Glow from "../ui/Glow";

const BASE = {
  shape: "blob",
  colors: ["#F2621B", "#FFC542", "#8a2f0b", "#3a1608"],
  softness: 0.85,
  intensity: 0.5,
  noise: 0.4,
  scale: 1.1,
  offsetX: 0.3,
};

export default function HeroShader() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const mask = "radial-gradient(ellipse 60% 75% at 74% 50%, #000 15%, transparent 72%)";

  return (
    <div ref={ref} aria-hidden className="absolute inset-0 overflow-hidden" style={{ maskImage: mask, WebkitMaskImage: mask }}>
      <ReactiveGrain base={BASE} follow={0.35} paused={reduce || !visible} />
      {/* the yellow glow, moves a lot more than the shader under it */}
      <Glow color="rgba(255,197,66,0.30)" size={460} strength={170} className="right-[6%] top-[12%]" />
    </div>
  );
}