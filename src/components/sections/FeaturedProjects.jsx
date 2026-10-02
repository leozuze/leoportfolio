import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { projects } from "../../data/projects";
import { techIcons } from "../../data/skills";
import { Reveal, WordReveal } from "../motion/primitives";

const live = projects.filter((p) => p.category === "Websites");

function ProjectPanel({ p, i, total }) {
  const wrap = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const dim = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const host = new URL(p.url).host;

  return (
    <div ref={wrap} className="h-[92svh] md:h-[100svh]">
      <motion.article
        style={reduce ? { top: 96 + i * 14 } : { scale, opacity: dim, top: 96 + i * 14 }}
        className="sticky grid origin-top gap-6 rounded-3xl border border-border bg-surface p-4 shadow-2xl shadow-black/40 sm:p-6 md:grid-cols-12 md:gap-10 md:p-8"
      >
        {/* browser frame */}
        <Reveal y={40} className="md:col-span-7">
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${p.title}`}
            className="group block overflow-hidden rounded-2xl border border-border bg-bg"
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="ml-3 truncate font-mono text-[11px] text-muted">{host}</span>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden">
              <motion.img
                src={p.image}
                alt={`${p.title} website`}
                loading="lazy"
                decoding="async"
                style={reduce ? undefined : { y: imgY }}
                className="absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </a>
        </Reveal>

        {/* copy */}
        <div className="flex flex-col justify-between md:col-span-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              <span className="text-accent">{String(i + 1).padStart(2, "0")}</span> / {String(total).padStart(2, "0")} · {p.subCategory}
            </p>
            <h3 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-text md:text-4xl">
              <WordReveal text={p.title} />
            </h3>
            <Reveal delay={0.1}>
              <p className="mt-2 text-sm font-medium text-accent">{p.tagline}</p>
              <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted md:line-clamp-none">{p.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.highlights.map((t) => {
                  const Icon = techIcons[t];
                  return (
                    <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted">
                      {Icon && <Icon size={12} className="text-accent" />}
                      {t}
                    </span>
                  );
                })}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="mt-6">
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-accent-2"
            >
              Visit live site <ArrowUpRight size={16} />
            </a>
          </Reveal>
        </div>
      </motion.article>
    </div>
  );
}

export default function FeaturedProjects() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-10 pt-24 md:pt-32">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-20">
        <div className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Selected work</p>
          <h2 className="mt-3 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-text md:text-5xl">
            <WordReveal text="Live right now," />{" "}
            <span className="font-logo font-normal italic text-accent">
              <WordReveal text="built for real businesses." delay={0.2} />
            </span>
          </h2>
        </div>
        <Reveal>
          <NavLink
            to="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
          >
            All projects <ArrowUpRight size={16} />
          </NavLink>
        </Reveal>
      </div>

      {live.map((p, i) => (
        <ProjectPanel key={p.title} p={p} i={i} total={live.length} />
      ))}
    </section>
  );
}