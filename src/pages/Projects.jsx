import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { projects } from "../data/projects";
import { skillCategories } from "../data/skills";
import { slugify } from "../lib/slugify";
import ProjectCard from "../components/projects/ProjectCard";
import Seo from "../components/Seo";

const categories = ["All", ...new Set(projects.map((p) => p.category))];
const categoryOrder = categories.filter((c) => c !== "All");

export default function Projects() {
  const shouldReduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTech, setActiveTech] = useState("All");
  const [searchParams] = useSearchParams();
  const openSlug = searchParams.get("open");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesTech = activeTech === "All" || p.tech.includes(activeTech);
      return matchesCategory && matchesTech;
    });
  }, [activeCategory, activeTech]);

  const groupedFiltered = useMemo(() => {
    return categoryOrder
      .map((cat) => ({ label: cat, items: filtered.filter((p) => p.category === cat) }))
      .filter((group) => group.items.length > 0);
  }, [filtered]);

  const headerFade = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  const groupTitle = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  const card = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
    exit: { opacity: 0, y: shouldReduceMotion ? 0 : -12, transition: { duration: 0.25, ease: "easeIn" } },
  };

  const resetFilters = () => {
    setActiveCategory("All");
    setActiveTech("All");
  };

  const chipClass = (isActive) =>
    `shrink-0 snap-start inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
      isActive
        ? "bg-accent/10 border-accent text-accent"
        : "border-border text-muted hover:border-accent hover:text-accent"
    }`;

  const scrollRowClass =
    "flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 overflow-x-hidden">
      <Seo
        title="Projects | Leo Zuze, AI & Full Stack Developer"
        description="Live client websites, full stack apps and AI projects by Leo Zuze, including fraud detection tools, flight and places search, and business sites."
        path="/projects"
      />

      {/* Page header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.6 }}
        variants={headerFade}
        className="max-w-2xl mb-14"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-accent mb-2">
          Portfolio
        </p>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-text mb-4">
          Projects
        </h1>
        <p className="text-muted text-sm md:text-base leading-relaxed">
          A growing collection of client and personal builds. Filter by
          category or by anything in my stack.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.6 }}
        variants={headerFade}
        className="mb-14 space-y-6"
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted mb-3">
            Category
          </p>
          <div className={scrollRowClass}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={chipClass(activeCategory === cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
              Built With
            </p>
            {activeTech !== "All" && (
              <button
                onClick={() => setActiveTech("All")}
                className="text-xs text-muted hover:text-accent transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-4">
            {skillCategories.map((group) => (
              <div key={group.title}>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted/60 mb-2">
                  {group.title}
                </p>
                <div className={scrollRowClass}>
                  {group.skills.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      onClick={() => setActiveTech(activeTech === name ? "All" : name)}
                      aria-pressed={activeTech === name}
                      className={chipClass(activeTech === name)}
                    >
                      <Icon size={14} />
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Project groups */}
      <div className="flex flex-col gap-16">
        {groupedFiltered.map((group) => (
          <div key={group.label}>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.6 }}
              variants={groupTitle}
              className="font-heading text-lg font-semibold text-text mb-6"
            >
              {group.label}
            </motion.p>

            <motion.div layout className="grid md:grid-cols-2 gap-10">
              <AnimatePresence mode="popLayout">
                {group.items.map((project) => (
                  <ProjectCard
                    key={project.title}
                    project={project}
                    variants={card}
                    autoOpen={openSlug === slugify(project.title)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-muted text-sm mb-4">
            No projects match that combination yet.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-full font-medium text-sm border border-border text-text hover:border-accent hover:text-accent transition-colors"
          >
            Clear filters
          </button>
        </motion.div>
      )}
    </div>
  );
}