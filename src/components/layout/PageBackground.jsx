import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FlowLines } from "../ui/Curves";

// One flat look per page: a sand panel with fine flowing lines and one outlined shape.
const VARIANTS = {
  about:    { side: "right", lines: 6, accent: 2, shape: "ring" },
  projects: { side: "left",  lines: 7, accent: 4, shape: "diamond" },
  services: { side: "right", lines: 5, accent: 1, shape: "diamond" },
  skills:   { side: "left",  lines: 6, accent: 3, shape: "ring" },
  contact:  { side: "right", lines: 7, accent: 5, shape: "ring" },
  lost:     { side: "right", lines: 4, accent: 1, shape: "diamond" },
};

export default function PageBackground() {
  const { pathname } = useLocation();
  const seg = pathname.split("/")[1];
  if (seg === "") return null; // Home draws its own hero

  const v = VARIANTS[seg] ?? VARIANTS.lost;
  const right = v.side === "right";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] overflow-hidden"
    >
      <motion.div
        key={seg}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={`absolute inset-y-0 hidden w-[34%] bg-sand md:block ${
          right ? "right-0" : "left-0"
        }`}
      >
        <FlowLines className="text-ink/25" count={v.lines} accentLine={v.accent} delay={0.3} />
      </motion.div>

      {v.shape === "ring" ? (
        <div
          className={`absolute top-28 hidden h-72 w-72 rounded-full border border-ink/10 md:block ${
            right ? "left-[6%]" : "right-[6%]"
          }`}
        />
      ) : (
        <div
          className={`absolute top-40 hidden h-44 w-44 rotate-45 border border-ink/10 md:block ${
            right ? "left-[10%]" : "right-[10%]"
          }`}
        />
      )}
    </div>
  );
}