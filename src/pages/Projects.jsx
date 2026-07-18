import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects } from "../data/projects";
import { skillCategories, techIcons } from "../data/skills";

const categories = ["All", ...new Set(projects.map((p) => p.category))];

export default function Projects() {
  const shouldReduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTech, setActiveTech] = useState("All");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesTech = activeTech === "All" || p.tech.includes(activeTech);
      return matchesCategory && matchesTech;
    });
  }, [activeCategory, activeTech]);

  const headerFade = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
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

  // Horizontal, touch-swipeable, scrollbar hidden — native momentum
  // scroll on mobile does the "swipe like a phone" feel for free, this
  // class just hides the bar so it doesn't look like a scroll widget.
  const scrollRowClass =
    "flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 overflow-x-hidden">
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

        {/* Built With — every skill I have, grouped the same way the
            Skills page groups them. Selecting a tech with no matching
            project yet just shows the empty state below; that's expected
            for skills I haven't used in a live project. */}
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

      {/* Project grid */}
      <motion.div layout className="grid md:grid-cols-2 gap-10">
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => (
            <motion.div
              key={project.title}
              layout
              variants={card}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="group relative"
            >
              <div
                className={`absolute -inset-3 bg-gradient-to-br from-accent/15 via-surface to-accent-2/10 rounded-[2.5rem] border border-border ${project.rotate} transition-transform duration-300 group-hover:rotate-0`}
              />

              <div className="relative z-10 bg-surface border border-border rounded-3xl overflow-hidden hover:border-accent transition-colors">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  <div className="relative aspect-video overflow-hidden bg-bg">
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    <span className="absolute top-4 left-4 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-full bg-bg/80 backdrop-blur border border-border text-muted group-hover:text-accent group-hover:border-accent transition-colors">
                      {project.category}
                    </span>
                  </div>

                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-heading text-xl font-semibold text-text">
                        {project.title}
                      </h3>
                      <ArrowUpRight
                        size={20}
                        className="shrink-0 text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                      />
                    </div>
                    <p className="mt-1 text-sm text-accent font-medium">
                      {project.tagline}
                    </p>
                    <p className="mt-3 text-sm text-muted leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </a>

                {/* Tech stack tags */}
                <div className="px-6 pb-6 pt-2 flex flex-wrap gap-2 border-t border-border/60 mt-2">
                  {project.tech.map((tech) => {
                    const Icon = techIcons[tech];
                    return (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted bg-bg border border-border rounded-full px-2.5 py-1 mt-3"
                      >
                        {Icon && <Icon size={12} className="text-accent" />}
                        {tech}
                      </span>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

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
