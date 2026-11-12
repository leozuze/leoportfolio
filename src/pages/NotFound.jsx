import { motion, useReducedMotion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { ArrowUpRight, Home } from "lucide-react";
import { SplitText, WordFade } from "../components/motion/TextReveal";
import Seo from "../components/Seo";
import { SEO } from "../data/seoRoutes";

const EASE = [0.22, 1, 0.36, 1];

const Line = ({ children }) => (
  <span className="block overflow-hidden pb-[0.14em] pr-2">{children}</span>
);

export default function NotFound() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 md:pb-32 md:pt-24">
      <Seo {...SEO.notFound} />

      <div className="grid items-center gap-14 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="flex items-center gap-4">
            <span aria-hidden className="block h-px w-12 bg-ink" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Error 404</p>
          </div>

          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.04] tracking-tight text-text sm:text-5xl md:text-6xl">
            <Line>
              <SplitText text="This page" delay={0.1} />
            </Line>
            <Line>
              <SplitText text="doesn't exist." delay={0.25} className="text-accent" />
            </Line>
          </h1>

          <WordFade
            delay={0.5}
            text="The link may be broken, or the page has moved. Everything else on the site is exactly where it should be."
            className="mt-6 max-w-md text-base leading-relaxed text-muted md:text-lg"
          />

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <NavLink
              to="/"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-on-ink transition-colors duration-300 before:absolute before:inset-0 before:translate-y-full before:bg-accent before:transition-transform before:duration-300 before:ease-out hover:before:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:before:transition-none"
            >
              <Home size={16} aria-hidden className="relative" />
              <span className="relative">Back to home</span>
            </NavLink>
            <NavLink
              to="/projects"
              className="group inline-flex items-center gap-1.5 border-b-2 border-ink pb-1 text-sm font-semibold text-text transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              See projects instead
              <ArrowUpRight
                size={16}
                aria-hidden
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
              />
            </NavLink>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <motion.div
              aria-hidden
              initial={reduce ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
              className="absolute -inset-5 rounded-full border-2 border-ink/10"
            />
            <motion.div
              aria-hidden
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: EASE }}
              className="absolute inset-0 rounded-full bg-accent"
            />
            <div className="absolute inset-0 grid place-items-center">
              <p
                aria-hidden
                className="font-heading text-[6.5rem] font-extrabold leading-none tracking-tight text-on-accent md:text-[8.5rem]"
              >
                <span className="block overflow-hidden pb-[0.1em]">
                  <SplitText text="404" by="chars" delay={0.7} stagger={0.12} />
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}