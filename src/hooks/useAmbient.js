import { useEffect } from "react";
import { motionValue, useReducedMotion, useSpring } from "framer-motion";

// One shared input for the whole site: pointer, phone tilt, or a slow idle wander.
const raw = { x: motionValue(0), y: motionValue(0) };
let users = 0;
let stop = null;
const clamp = (v) => Math.max(-1, Math.min(1, v));

function start() {
  let last = 0;
  let id;
  const onPointer = (e) => {
    last = performance.now();
    raw.x.set((e.clientX / window.innerWidth) * 2 - 1);
    raw.y.set((e.clientY / window.innerHeight) * 2 - 1);
  };
  const onTilt = (e) => {
    if (e.gamma == null) return;
    last = performance.now();
    raw.x.set(clamp(e.gamma / 30));
    raw.y.set(clamp(((e.beta ?? 45) - 45) / 30));
  };
  const loop = (t) => {
    if (t - last > 2500 && !document.hidden) {
      raw.x.set(Math.sin(t / 3200) * 0.6);
      raw.y.set(Math.cos(t / 4100) * 0.45);
    }
    id = requestAnimationFrame(loop);
  };

  window.addEventListener("pointermove", onPointer, { passive: true });
  // iOS needs a permission prompt for tilt, so there it falls back to touch-drag
  const tiltOk = window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function";
  if (tiltOk) window.addEventListener("deviceorientation", onTilt, { passive: true });
  id = requestAnimationFrame(loop);

  return () => {
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("deviceorientation", onTilt);
    cancelAnimationFrame(id);
  };
}

export function useAmbient() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    if (users++ === 0) stop = start();
    return () => {
      if (--users === 0) {
        stop?.();
        stop = null;
      }
    };
  }, [reduce]);
  const cfg = { stiffness: 45, damping: 18 };
  return { x: useSpring(raw.x, cfg), y: useSpring(raw.y, cfg) };
}