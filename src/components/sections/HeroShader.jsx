import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { GrainGradient } from "@paper-design/shaders-react";

export default function HeroShader() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  // Fades the shader into the page so it never looks like a pasted rectangle
  const mask = "radial-gradient(ellipse 60% 75% at 74% 50%, #000 15%, transparent 72%)";

  return (
    <div ref={ref} aria-hidden className="absolute inset-0 overflow-hidden" style={{ maskImage: mask, WebkitMaskImage: mask }}>
      <GrainGradient
        style={{ width: "100%", height: "100%" }}
        colors={["#F2621B", "#FFC542", "#8a2f0b", "#3a1608"]}
        colorBack="#141416"
        softness={0.85}
        intensity={0.5}
        noise={0.4}
        shape="blob"
        scale={1.1}
        offsetX={0.3}
        speed={reduce || !visible ? 0 : 0.3}
        maxPixelCount={1500000}
      />
    </div>
  );
}