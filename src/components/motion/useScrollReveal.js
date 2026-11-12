import { useEffect, useRef, useState } from "react";

/* Scroll-aware reveal.
   shown = true  while the element is in view, or above the viewport (already passed)
   shown = false while it is below the viewport (not reached yet)
   So things animate in as you scroll down, reset when you scroll back up past them,
   and everything above you stays visible. */
export function useScrollReveal({ enabled = true, margin = "0px 0px -12% 0px" } = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const rootBottom = entry.rootBounds ? entry.rootBounds.bottom : window.innerHeight;
        const below = !entry.isIntersecting && entry.boundingClientRect.top >= rootBottom;
        setShown(!below);
      },
      { rootMargin: margin }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [enabled, margin]);

  return [ref, shown];
}