import { lazy, Suspense, useEffect } from "react";
import {
  motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import HeroPortrait from "./HeroPortrait";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useIntro } from "../intro/IntroContext";

const HeroShader = lazy(() => import("./HeroShader"));

const Line = ({ i, children, className = "" }) => (
  <span className="block overflow-hidden pb-[0.14em] pr-2">
    <motion.span
      className={`block ${className}`}
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  </span>
);

export default function Hero() {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const { done } = useIntro();
  const { scrollY } = useScroll();

  // Step 1 (0-200): text card and portrait card slide into each other
  const S1 = [0, 200];
  const textX = useTransform(scrollY, S1, [0, mobile ? 0 : 30]);
  const textRotate = useTransform(scrollY, S1, [0, mobile ? 0 : 2]);
  const textScale = useTransform(scrollY, S1, [1, 0.96]);
  const imgX = useTransform(scrollY, S1, [0, mobile ? 0 : -170]);
  const imgY = useTransform(scrollY, S1, [0, mobile ? -80 : -30]);
  const imgRotate = useTransform(scrollY, S1, [0, mobile ? 0 : -3]);
  const imgScale = useTransform(scrollY, S1, [1, 0.97]);

  // Step 2 (200-400): parent card appears around both, text card's own box dissolves
  const S2 = [200, 400];
  const parentOpacity = useTransform(scrollY, S2, [0, 1]);
  const parentScale = useTransform(scrollY, S2, [0.9, 1]);
  const textBorder = useTransform(scrollY, S2, ["rgba(43,43,46,1)", "rgba(43,43,46,0)"]);
  const textBg = useTransform(scrollY, S2, ["rgba(20,20,22,0.7)", "rgba(20,20,22,0)"]);

  // Step 3 (400+): the whole parent card sinks while the next sheet covers it
  const S3 = [420, 1000];
  const groupScale = useTransform(scrollY, S3, [1, mobile ? 0.95 : 0.9]);
  const groupY = useTransform(scrollY, S3, [0, mobile ? 60 : 110]);
  const groupTilt = useTransform(scrollY, S3, [0, mobile ? 0 : 6]);
  const groupRadius = useTransform(scrollY, S3, [0, 32]);
  const groupOpacity = useTransform(scrollY, S3, [1, 0.35]);

  // background: slow zoom on scroll + cursor drift (fine pointers only)
  const bgScale = useTransform(scrollY, [0, 1000], [1, 1.15]);
  const bgY = useTransform(scrollY, [0, 1000], [0, 80]);
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const driftX = useSpring(dx, { stiffness: 40, damping: 20 });

  useEffect(() => {
    if (reduce || mobile || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (e) => {
      dx.set((e.clientX / window.innerWidth - 0.5) * -40);
      dy.set((e.clientY / window.innerHeight - 0.5) * -24);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduce, mobile, dx, dy]);

  return (
    <section className="relative">
      <div className="sticky top-20 isolate" style={{ perspective: 1400 }}>
        <motion.div
          style={
            reduce
              ? undefined
              : {
                  scale: groupScale,
                  y: groupY,
                  rotateX: groupTilt,
                  borderRadius: groupRadius,
                  opacity: groupOpacity,
                  transformOrigin: "50% 100%",
                }
          }
          className="relative overflow-hidden"
        >
          {/* shader loads behind the intro, so it is ready when the cards arrive */}
          <motion.div
            aria-hidden
            className="absolute -inset-6 -z-10"
            style={reduce ? undefined : { scale: bgScale, y: bgY, x: driftX }}
          >
            <motion.div
              className="h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.6, delay: 0.3 }}
            >
              <Suspense fallback={null}>
                <HeroShader />
              </Suspense>
            </motion.div>
          </motion.div>

          <div className="relative mx-auto max-w-6xl">
            {/* the parent card that ends up holding both cards */}
            <motion.div
              aria-hidden
              style={reduce ? { opacity: 0 } : { opacity: parentOpacity, scale: parentScale }}
              className="absolute inset-x-2 inset-y-3 rounded-[2.5rem] border border-border bg-surface/60 backdrop-blur-sm sm:inset-x-4"
            >
              <span className="absolute -top-3 left-8 bg-bg px-3 font-mono text-[10px] uppercase tracking-widest text-accent">
                Leo Zuze
              </span>
            </motion.div>

            <div className="relative grid min-h-[calc(100svh-5rem)] items-center gap-14 px-6 py-12 md:grid-cols-12 md:gap-8">
              {done && (
                <>
                  {/* card 1: text, floats in slowly */}
                  <motion.div
                    className="relative z-10 md:col-span-7"
                    initial={{ opacity: 0, y: 90 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.div
                      style={
                        reduce
                          ? undefined
                          : {
                              x: textX,
                              rotate: textRotate,
                              scale: textScale,
                              borderColor: textBorder,
                              backgroundColor: textBg,
                            }
                      }
                      className="rounded-3xl border border-border bg-bg/70 p-6 sm:p-8 lg:p-10"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="font-mono text-xs uppercase tracking-widest text-muted"
                      >
                        Leo Zuze · Pune, India
                      </motion.p>

                      <h1 className="mt-6 text-text">
                        <Line i={2} className="font-logo text-[3.25rem] font-normal italic leading-[0.95] text-accent sm:text-7xl lg:text-[6.5rem]">
                          Full-Stack & AI Developer
                        </Line>
                        <Line i={3} className="mt-4 font-heading text-xl font-medium leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                          I turn business problems into
                        </Line>
                        <Line i={4} className="font-heading text-xl font-medium leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                          software that works.
                        </Line>
                      </h1>

                      <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3, duration: 0.7 }}
                        className="mt-7 max-w-md text-base leading-relaxed text-muted"
                      >
                        Websites, web apps, dashboards and AI features, designed and built
                        end to end by one developer, from first idea to live launch.
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.7 }}
                        className="mt-9 flex flex-wrap items-center gap-4"
                      >
                        <NavLink to="/contact" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-accent-2">
                          Start a project <ArrowUpRight size={16} />
                        </NavLink>
                        <NavLink to="/projects" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent">
                          See live work
                        </NavLink>
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  {/* card 2: portrait, wipes in a beat later */}
                  <motion.div
                    style={
                      reduce ? undefined : { x: imgX, y: imgY, scale: imgScale, rotate: imgRotate }
                    }
                    initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
                    animate={{ clipPath: "inset(-20% -20% -20% -20%)" }}
                    transition={{ duration: 1.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-20 md:col-span-5"
                  >
                    <HeroPortrait />
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* extra pinned scroll so steps 1 and 2 finish before the next sheet arrives */}
      <div aria-hidden style={{ height: mobile ? 340 : 420 }} />
    </section>
  );
}