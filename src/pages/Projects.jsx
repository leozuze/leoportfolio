import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { projects } from "../data/projects";
import ProjectCard from "../components/projects/ProjectCard";
import PageHeader from "../components/ui/PageHeader";
import PageCTA from "../components/ui/PageCTA";
import { Reveal } from "../components/motion/primitives";
import Seo from "../components/Seo";
import { SEO } from "../data/seoRoutes";

const categories = ["All", ...new Set(projects.map((p) => p.category))];
const categoryOrder = categories.filter((c) => c !== "All");
const countOf = (cat) => (cat === "All" ? projects.length : projects.filter((p) => p.category === cat).length);

export default function Projects() {
  const reduce = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState("All");

  const groups = useMemo(
    () =>
      categoryOrder
        .map((cat) => ({
          label: cat,
          items: projects.filter(
            (p) => p.category === cat && (activeCategory === "All" || activeCategory === cat)
          ),
        }))
        .filter((g) => g.items.length > 0),
    [activeCategory]
  );

  // enter and exit when the filter changes
  const card = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
    exit: { opacity: 0, y: reduce ? 0 : -12, transition: { duration: 0.25, ease: "easeIn" } },
  };

  const chipClass = (on) =>
    `inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
      on
        ? "border-ink bg-ink text-on-ink"
        : "border-border text-muted hover:border-ink hover:text-text"
    }`;

  return (
    <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-12 md:pb-32 md:pt-16">
      <Seo {...SEO.projects} />

      <PageHeader
        eyebrow="Projects"
        lines={[{ text: "Live projects for" }, { text: "real businesses.", accent: true }]}
        intro="Every project here is live. Click any card to open the real site."
      />

      {/* Filters */}
      <Reveal className="mt-12">
        <div role="group" aria-label="Filter projects by type" className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={chipClass(activeCategory === cat)}
            >
              {cat}
              <span className="text-xs tabular-nums opacity-70">{countOf(cat)}</span>
            </button>
          ))}
        </div>
      </Reveal>

      {/* Project groups */}
      <div className="mt-14 flex flex-col gap-16">
        {groups.map((group) => (
          <section key={group.label} aria-label={group.label}>
            <Reveal className="mb-6 flex items-center gap-4">
              <span aria-hidden className="block h-px w-12 bg-accent" />
              <h2 className="font-heading text-lg font-extrabold text-text">{group.label}</h2>
              <span className="text-xs font-semibold tabular-nums text-muted">{group.items.length}</span>
            </Reveal>

            <motion.div layout className="grid gap-8 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {group.items.map((project) => (
                  <ProjectCard key={project.title} project={project} variants={card} />
                ))}
              </AnimatePresence>
            </motion.div>
          </section>
        ))}
      </div>

      <PageCTA
        className="mt-24 md:mt-32"
        eyebrow="Your project next"
        lines={[{ text: "Want something" }, { text: "like these?", accent: true }]}
        text="Tell me what you need and I'll tell you honestly how I'd build it, what it would cost and how long it would take."
        primary={{ label: "Start a project", to: "/contact" }}
        secondary={{ label: "See services and prices", to: "/services" }}
      />
    </div>
  );
}