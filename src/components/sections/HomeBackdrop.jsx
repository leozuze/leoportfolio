import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useAmbient } from "../../hooks/useAmbient";

const HomeScene = lazy(() => import("../3d/HomeScene"));

// One canvas pinned behind every section of the Home sheet.
export default function HomeBackdrop() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const amb = useAmbient();
  const [visible, setVisible] = useState(false);
  const [capable] = useState(
    () => (navigator.hardwareConcurrency || 4) >= 4 && !navigator.connection?.saveData
  );

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none sticky top-0 -z-10 -mb-[100svh] h-svh">
      {capable && !reduce && (
        <Suspense fallback={null}>
          <HomeScene amb={amb} active={visible} />
        </Suspense>
      )}
    </div>
  );
}