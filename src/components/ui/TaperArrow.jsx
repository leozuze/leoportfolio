import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "../motion/useScrollReveal";

// cubic bezier control points, in the arrow's own viewBox
const PRESETS = {
  side: { points: [[6, 14], [70, 2], [130, 10], [148, 60]], size: [150, 70], w0: 12, head: 12 },
  down: { points: [[30, 6], [14, 20], [34, 30], [30, 52]], size: [60, 60], w0: 9, head: 10 },
};

const bez = (p, t) => {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [
    a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0],
    a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1],
  ];
};

const tangent = (p, t) => {
  const u = 1 - t;
  const dx = 3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]);
  const dy = 3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1]);
  const l = Math.hypot(dx, dy) || 1;
  return [dx / l, dy / l];
};

const rotate = (v, a) => [
  v[0] * Math.cos(a) - v[1] * Math.sin(a),
  v[0] * Math.sin(a) + v[1] * Math.cos(a),
];

/* body = filled shape whose width shrinks from w0 (start) to w1 (tip); head = open V at the tip */
function buildArrow(p, w0, w1, head) {
  const N = 48;
  const left = [];
  const right = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = bez(p, t);
    const [tx, ty] = tangent(p, t);
    const w = (w1 + (w0 - w1) * Math.pow(1 - t, 1.3)) / 2;
    left.push([x - ty * w, y + tx * w]);
    right.push([x + ty * w, y - tx * w]);
  }
  const pts = [...left, ...right.reverse()];
  const body = "M" + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L") + "Z";
  const center = `M${p[0][0]} ${p[0][1]} C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}`;

  const tip = p[3];
  const dir = tangent(p, 1);
  const back = [-dir[0], -dir[1]];
  const a1 = rotate(back, 0.5);
  const a2 = rotate(back, -0.5);
  const headD =
    `M${(tip[0] + a1[0] * head).toFixed(2)} ${(tip[1] + a1[1] * head).toFixed(2)}` +
    `L${tip[0]} ${tip[1]}` +
    `L${(tip[0] + a2[0] * head).toFixed(2)} ${(tip[1] + a2[1] * head).toFixed(2)}`;

  return { body, center, head: headD };
}

/* variant: "side" (sweeps in from the left) or "down" (short, for phones).
   Color comes from the text color class you pass, e.g. text-accent-soft. */
export default function TaperArrow({ variant = "side", w1 = 2.5, delay = 0, className = "" }) {
  const reduce = useReducedMotion();
  const [ref, shown] = useScrollReveal({ margin: "0px 0px -15% 0px" });
  const id = useId().replace(/:/g, "");
  const { points, size, w0, head } = PRESETS[variant];
  const show = reduce || shown;
  const geo = useMemo(() => buildArrow(points, w0, w1, head), [points, w0, w1, head]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${size[0]} ${size[1]}`}
      className={`h-auto overflow-visible ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width={size[0]} height={size[1]}>
          <motion.path
            d={geo.center}
            stroke="white"
            strokeWidth={w0 * 2 + 8}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: show ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 1.1, delay: show ? delay : 0, ease: [0.4, 0, 0.2, 1] }}
          />
        </mask>
      </defs>

      <g mask={`url(#${id})`} fill="currentColor">
        <path d={geo.body} />
        <circle cx={points[0][0]} cy={points[0][1]} r={w0 / 2} />
      </g>

      <motion.path
        d={geo.head}
        stroke="currentColor"
        strokeWidth={Math.max(w1, 2.5)}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: show ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.3, delay: show ? delay + 1 : 0, ease: "easeOut" }}
      />
    </svg>
  );
}