import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useIsMobile } from "../../hooks/useIsMobile";
import { Cube, Rings } from "../ui/Wireframes";

const PageShader = lazy(() => import("./PageShader"));

const WARM = ["#F2621B", "#FFC542", "#6b250a", "#2a1006"];

// One look per page. Tweak scale / offsetX / offsetY to move the pattern around.
const VARIANTS = {
  about:    { shape: "wave",    colors: WARM, scale: 1.2, offsetX: -0.3, offsetY: 0.1, rotation: 20, object: "rings", pos: "right-[8%] top-[24%]" },
  projects: { shape: "ripple",  colors: WARM, scale: 1.1, offsetX: 0.4,  offsetY: -0.1, object: "cube",  pos: "left-[6%] top-[30%]" },
  services: { shape: "corners", colors: WARM, scale: 1.0, offsetX: 0,    offsetY: 0,    object: "cube",  pos: "right-[10%] top-[20%]" },
  skills:   { shape: "dots",    colors: WARM, scale: 0.7, offsetX: 0.2,  offsetY: 0,    intensity: 0.35, object: "rings", pos: "left-[8%] top-[26%]" },
  contact:  { shape: "blob",    colors: WARM, scale: 1.1, offsetX: -0.4, offsetY: 0.1,  object: "cube",  pos: "right-[10%] top-[28%]" },
  lost:     { shape: "sphere",  colors: WARM, scale: 1.0, offsetX: 0,    offsetY: 0,    object: "rings", pos: "right-[14%] top-[22%]" },
};

export default function PageBackground() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const { scrollY } = useScroll();
  const shaderY = useTransform(scrollY, [0, 2500], [0, -140]);
  const objY = useTransform(scrollY, [0, 2500], [0, -380]);

  const seg = pathname.split("/")[1];
  if (seg === "") return null; // Home keeps its own hero shader
  const v = VARIANTS[seg] ?? VARIANTS.lost;
  const Obj = v.object === "cube" ? Cube : Rings;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        key={seg}
        className="absolute inset-x-0 -inset-y-40"
        style={reduce ? undefined : { y: shaderY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: 1.4 }}
      >
        <Suspense fallback={null}>
          <PageShader v={v} mobile={mobile} paused={reduce} />
        </Suspense>
      </motion.div>

      {/* fades toward the bottom so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/30 to-bg" />

      <motion.div
        key={`${seg}-obj`}
        className={`absolute hidden sm:block ${v.pos}`}
        style={reduce ? undefined : { y: objY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
      >
        <Obj />
      </motion.div>
    </div>
  );
}