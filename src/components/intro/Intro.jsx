import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { heroAvatar, heroCutout, heroPhoto } from "../../lib/heroImage";
import { SplitText } from "../motion/TextReveal";
import { Flicks } from "../ui/Curves";
import { useIntro } from "./IntroContext";

// The 3D scene only downloads when it is actually going to play
const IntroScene = lazy(() => import("./IntroScene"));

// Phones see the truck on their first visits, then the short name reveal. 0 = never on phones.
const MOBILE_TRUCK_VISITS = 3;
const VISITS_KEY = "leo-intro-visits";

const SCENE_MS = 5000; // keep in sync with T.end in IntroScene.jsx
const CURTAIN_MS = 1900;
const WIPE = [0.76, 0, 0.24, 1];

const readVisits = () => {
  try {
    return Number(localStorage.getItem(VISITS_KEY)) || 0;
  } catch {
    return 0;
  }
};

const bumpVisits = () => {
  try {
    localStorage.setItem(VISITS_KEY, String(readVisits() + 1));
  } catch {
    // storage is blocked (private mode): the visit simply isn't counted
  }
};

const hasWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

// Don't make slow or low-memory devices wait for a 3D scene
const shouldSkip3D = () => {
  const c = navigator.connection;
  return !!(
    c?.saveData ||
    /2g|3g/.test(c?.effectiveType || "") ||
    (navigator.hardwareConcurrency || 8) < 4 ||
    (navigator.deviceMemory || 8) <= 2
  );
};

const isLargeScreen = () => window.matchMedia("(min-width: 1024px)").matches;

const pickMode = () => {
  if (!hasWebGL() || shouldSkip3D()) return "curtain";
  if (isLargeScreen()) return "scene";
  return readVisits() < MOBILE_TRUCK_VISITS ? "scene" : "curtain";
};

export default function Intro() {
  const { done, finish } = useIntro();
  const [mode] = useState(pickMode);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const counted = useRef(false);

  const onReady = useCallback(() => {
    readyRef.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (done) return;

    // count this visit once (the guard keeps dev double-runs from counting twice)
    if (!counted.current) {
      counted.current = true;
      bumpVisits();
    }

    // warm up the hero photo and the laptop avatar while the intro plays
    new Image().src = heroCutout ?? heroPhoto;
    new Image().src = heroAvatar;

    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";

    const timer =
      mode === "curtain"
        ? setTimeout(finish, CURTAIN_MS)
        : // if the 3D scene is still downloading after 4s, open the site instead
          setTimeout(() => {
            if (!readyRef.current) finish();
          }, 4000);

    return () => {
      clearTimeout(timer);
      html.style.overflow = prev;
      window.scrollTo(0, 0);
    };
  }, [done, finish, mode]);

  return (
    <AnimatePresence>
      {!done && mode === "scene" && (
        <motion.div
          key="scene"
          role="status"
          aria-label="Loading portfolio"
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          // starts below the navbar (h-20 = 5rem) so the navbar stays visible
          className="fixed inset-x-0 bottom-0 top-20 z-40 bg-bg"
        >
          {/* phones: a centred 60%-height band so the truck reads larger; desktop: full area */}
          <div className="absolute inset-x-0 top-1/2 h-[60svh] -translate-y-1/2 md:inset-0 md:h-auto md:translate-y-0">
            <Suspense fallback={null}>
              <IntroScene avatar={heroAvatar} onReady={onReady} onDone={finish} />
            </Suspense>
          </div>

          <div className="absolute inset-x-6 bottom-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border">
              {ready && (
                <motion.div
                  className="h-px origin-left bg-accent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: SCENE_MS / 1000, ease: "linear" }}
                />
              )}
            </div>
            <button
              type="button"
              onClick={finish}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Skip
            </button>
          </div>
        </motion.div>
      )}

      {!done && mode === "curtain" && (
        <motion.div
          key="curtain"
          role="status"
          aria-label="Loading portfolio"
          exit={{ y: "-100%", transition: { duration: 0.85, ease: WIPE } }}
          className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-ink text-on-ink"
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-ink/50">
              Portfolio
            </p>
            <button
              type="button"
              onClick={finish}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-on-ink/60 transition-colors hover:text-on-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-ink"
            >
              Skip
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6">
            <div className="relative w-fit font-heading text-[3.4rem] font-extrabold leading-none tracking-tight sm:text-8xl lg:text-[8.5rem]">
              <span className="block overflow-hidden pb-[0.14em] pr-2">
                <SplitText text="Leo" by="chars" delay={0.15} stagger={0.05} className="text-on-ink" />{" "}
                <SplitText text="Zuze" by="chars" delay={0.4} stagger={0.05} className="text-accent-soft" />
              </span>
              <Flicks
                delay={1}
                className="absolute -right-[0.5em] -top-[0.1em] hidden h-[0.45em] w-[0.45em] text-accent-soft sm:block"
              />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-on-ink/60"
            >
              AI engineer &amp; full-stack developer
            </motion.p>
          </div>

          <div className="mx-auto w-full max-w-6xl px-6 pb-10">
            <div className="h-px w-full bg-white/15">
              <motion.div
                className="h-px origin-left bg-accent-soft"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: CURTAIN_MS / 1000, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}