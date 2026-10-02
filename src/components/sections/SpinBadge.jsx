import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function SpinBadge() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const rotate = useSpring(useTransform(scrollY, [0, 2000], [0, 360]), { stiffness: 80, damping: 20 });

  return (
    <NavLink
      to="/contact"
      aria-label="Start a project"
      className="group relative block h-28 w-28 rounded-full border border-border bg-bg"
    >
      <motion.svg viewBox="0 0 120 120" style={reduce ? undefined : { rotate }} className="h-full w-full">
        <defs>
          <path id="badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text className="fill-text font-mono uppercase" fontSize="9.5">
          <textPath href="#badge-circle" textLength="270" lengthAdjust="spacing">
            Available for freelance • AI developer •
          </textPath>
        </text>
      </motion.svg>
      <span className="absolute inset-0 flex items-center justify-center text-accent transition-transform group-hover:scale-125">
        <ArrowUpRight size={22} />
      </span>
    </NavLink>
  );
}