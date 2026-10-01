import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { services, getWhatsAppLink } from "../../data/services";

export default function ServicesCarousel() {
  const ref = useRef(null);
  const track = useRef(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);

  useLayoutEffect(() => {
    const measure = () => setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section ref={ref} style={{ height: `calc(100svh + ${dist}px)` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-20">
        <motion.div
          ref={track}
          style={{ x }}
          className="flex w-max gap-6 px-6 md:gap-8 md:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
        >
          <div className="flex w-[80vw] shrink-0 flex-col justify-between sm:w-[360px]">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">What I do</p>
            <h2 className="font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-text md:text-5xl">
              Everything your business needs <span className="font-logo font-normal italic text-accent">online.</span>
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Keep scrolling →</p>
          </div>

          {services.map((s, i) => (
            <article
              key={s.id}
              className="group flex h-[min(68svh,540px)] w-[82vw] shrink-0 flex-col justify-between rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-accent sm:w-[420px]"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-muted">
                  <span>{String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}</span>
                  {s.status === "in-development" && <span className="text-accent">In development</span>}
                </div>
                <h3 className="mt-8 font-heading text-2xl font-semibold text-text">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.tagline}</p>
                <ul className="mt-6 divide-y divide-border/70 border-t border-border/70 text-sm text-muted">
                  {s.features.map((f) => (
                    <li key={f} className="py-2.5">{f}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-text">{s.price ?? "Let's talk"}</span>
                <a
                  href={getWhatsAppLink(s.title)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
                >
                  {s.cta} <ArrowUpRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </motion.div>

        <div className="mx-auto mt-10 h-px w-full max-w-6xl bg-border px-6">
          <motion.div style={{ scaleX: scrollYProgress }} className="h-px origin-left bg-accent" />
        </div>
      </div>
    </section>
  );
}