import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";

const PROJECTS = [
  {
    title: "Threat Sense",
    tag: "Cybersecurity & Visualization",
    description:
      "A high-performance cybersecurity visualization platform built for real-time threat detection awareness, with a focus on clean UI/UX and dark-mode optimization.",
    href: "https://threat-sense.vercel.app/",
    github: "https://github.com/leozuze",
    featured: true,
  },
  {
    title: "Personal Portfolio",
    tag: "Web",
    description:
      "An earlier version of this portfolio site — SEO-optimized and built to establish an initial personal brand presence online.",
    href: "https://leoportfolio-nine.vercel.app/",
    github: "https://github.com/leozuze",
    featured: false,
  },
];

export default function Projects() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-accent font-mono text-xs uppercase tracking-widest mb-3"
      >
        Projects
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="font-heading text-4xl md:text-5xl font-bold text-text max-w-2xl mb-16"
      >
        Selected work.
      </motion.h1>

      <div className="grid gap-6">
        {PROJECTS.map((project, i) => (
          <motion.article
            key={project.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className={`rounded-3xl border border-border bg-surface p-8 md:p-10 hover:border-accent/40 transition-colors ${
              project.featured ? "md:p-12" : ""
            }`}
          >
            <span className="inline-block text-accent text-[10px] font-mono uppercase tracking-widest mb-4">
              {project.tag}
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-text mb-3">
              {project.title}
            </h2>
            <p className="text-muted text-sm md:text-base leading-relaxed max-w-2xl mb-6">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-accent text-bg px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Live Demo <ArrowUpRight size={14} />
              </a>
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-border px-5 py-2.5 rounded-full text-sm font-medium text-text hover:border-accent transition-colors"
              >
                <FaGithub size={14} /> Code
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}