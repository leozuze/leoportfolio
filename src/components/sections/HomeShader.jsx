import { useEffect, useRef, useState } from "react";
import ReactiveGrain from "./ReactiveGrain";
import { useIsMobile } from "../../hooks/useIsMobile";

const BASE = {
  shape: "wave",
  colors: ["#F2621B", "#FFC542", "#6b250a", "#2a1006"],
  scale: 1.2,
  intensity: 0.4,
};

// One WebGL canvas pinned behind every section of the Home sheet.
export default function HomeShader() {
  const mobile = useIsMobile();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [capable] = useState(
    () =>
      (navigator.hardwareConcurrency || 4) >= 4 &&
      !navigator.connection?.saveData &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  // phones and weaker devices get the lightweight glows only
  if (mobile || !capable) return null;

  const mask = "linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)";
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none sticky top-0 -z-10 -mb-[100svh] h-svh overflow-hidden opacity-50"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      <ReactiveGrain
        base={BASE}
        follow={0.25}
        sweep={{ ox: [0.35, -0.35], oy: [-0.3, 0.3], rot: [0, 140] }}
        paused={!visible}
      />
    </div>
  );
}