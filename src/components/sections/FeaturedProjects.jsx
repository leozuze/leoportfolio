import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { projects } from "../../data/projects";

// Homepage only ever shows projects flagged featured: true in
// data/projects.js — add more there and mark the ones you want teased
// here, the rest still show up on the full /projects page.
const featuredProjects = projects.filter((p) => p.featured);

export default function FeaturedProjects() {
  const shouldReduceMotion = useReducedMotion();

  const headerLeft = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -32 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };
  const headerRight = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : 32 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.55, ease: "easeOut", delay: 0.1 },
    },
  };

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2, delayChildren: 0.15 },
    },
  };

  const item = {
    hidden: (i) => ({
      opacity: 0,
      x: shouldReduceMotion ? 0 : i % 2 === 0 ? -64 : 64,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 overflow-x-hidden">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.4 }}
          variants={headerLeft}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-2">
            Selected Work
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text">
            Featured Projects
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.4 }}
          variants={headerRight}
        >
          <NavLink
            to="/projects"
            className="inline-flex items-center gap-2 border border-border px-5 py-2.5 rounded-full font-medium text-sm text-text hover:border-accent hover:text-accent transition-colors"
          >
            View All Projects <ArrowUpRight size={16} />
          </NavLink>
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={container}
        className="grid md:grid-cols-2 gap-10"
      >
        {featuredProjects.map((project, i) => (
          <motion.div
            key={project.title}
            custom={i}
            variants={item}
            className="group relative"
          >
            <div
              className={`absolute -inset-3 bg-gradient-to-br from-accent/15 via-surface to-accent-2/10 rounded-[2.5rem] border border-border ${project.rotate} transition-transform duration-300 group-hover:rotate-0`}
            />

            <motion.a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 block bg-surface border border-border rounded-3xl overflow-hidden hover:border-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
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

              <div className="p-6">
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
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-muted group-hover:text-accent transition-colors">
                  Visit Site
                </span>
              </div>
            </motion.a>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
