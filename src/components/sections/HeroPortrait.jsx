import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import heroImg from "../../assets/images/heroimg.webp";

const HeroScene = lazy(() => import("./HeroScene"));

function canRun3D() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if ((navigator.hardwareConcurrency || 4) < 4 || navigator.connection?.saveData) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function HeroPortrait() {
  const box = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (!canRun3D()) return;
    const t = setTimeout(() => setEnabled(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className="relative mx-auto w-full max-w-[270px] sm:max-w-sm lg:max-w-md aspect-[4/5]">
      <img
        src={heroImg}
        alt="Leo Zuze"
        width="800"
        height="1000"
        fetchPriority="high"
        decoding="async"
        className={`absolute inset-0 h-full w-full rounded-3xl object-cover transition-opacity duration-500 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />
      {enabled && (
        <div className="absolute -inset-[12%]">
          <Suspense fallback={null}>
            <HeroScene onReady={onReady} active={inView} />
          </Suspense>
        </div>
      )}
    </div>
  );
}