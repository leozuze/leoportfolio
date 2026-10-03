import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
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

// Don't make slow or low-memory devices wait for a 3D scene
const shouldSkip = () => {
  const c = navigator.connection;
  return !!(
    c?.saveData ||
    /2g|3g/.test(c?.effectiveType || "") ||
    (navigator.hardwareConcurrency || 8) < 4 ||
    (navigator.deviceMemory || 8) <= 2
  );
};

export default function Intro() {
  const { done, finish } = useIntro();
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const onReady = useCallback(() => {
    readyRef.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (done) return;
    if (!hasWebGL() || shouldSkip()) return finish();
    new Image().src = heroImg;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    // if the 3D scene is still downloading after 4s, open the site instead of waiting
    const bail = setTimeout(() => {
      if (!readyRef.current) finish();
    }, 4000);
    return () => {
      clearTimeout(bail);
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
          {/* phones: a centred 60%-height band so the truck reads larger; desktop: full area */}
          <div className="absolute inset-x-0 top-1/2 h-[60svh] -translate-y-1/2 md:inset-0 md:h-auto md:translate-y-0">
            <Suspense fallback={null}>
              <IntroScene avatar={heroImg} onReady={onReady} onDone={finish} />
            </Suspense>
          </div>

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