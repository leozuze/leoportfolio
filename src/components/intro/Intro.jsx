import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import heroImg from "../../assets/images/heroimg.webp";
import { useIntro } from "./IntroContext";

// Start downloading the 3D scene the moment this file loads (not when it first renders)
const scenePromise = import("./IntroScene");
const IntroScene = lazy(() => scenePromise);
const INTRO_MS = 5000; // keep in sync with T.end in IntroScene.jsx

const hasWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

export default function Intro() {
  const { done, finish } = useIntro();
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (done) return;
    if (!hasWebGL()) return finish(); // old devices: skip straight to the site
    new Image().src = heroImg;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
      window.scrollTo(0, 0);
    };
  }, [done, finish]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="intro"
          role="status"
          aria-label="Loading portfolio"
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          // starts below the navbar (h-20 = 5rem) and sits under it, so the navbar stays visible
          className="fixed inset-x-0 bottom-0 top-20 z-40 bg-bg"
        >
          <Suspense fallback={null}>
            <IntroScene avatar={heroImg} onReady={onReady} onDone={finish} />
          </Suspense>

          <div className="absolute inset-x-6 bottom-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border">
              {ready && (
                <motion.div
                  className="h-px origin-left bg-accent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: INTRO_MS / 1000, ease: "linear" }}
                />
              )}
            </div>
            <button
              onClick={finish}
              className="font-mono text-[11px] uppercase tracking-widest text-muted transition-colors hover:text-accent"
            >
              Skip
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
