import { motion } from "framer-motion";

const SKILL_GROUPS = [
  {
    label: "Data & AI",
    items: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Cufflinks"],
  },
  {
    label: "Web Development",
    items: ["React", "JavaScript", "HTML5", "CSS3", "Tailwind CSS"],
  },
  {
    label: "Tools",
    items: ["Git", "GitHub", "Vite"],
  },
];

export default function Skills() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-accent font-mono text-xs uppercase tracking-widest mb-3"
      >
        Skills
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="font-heading text-4xl md:text-5xl font-bold text-text max-w-2xl mb-16"
      >
        What I work with.
      </motion.h1>

      <div className="grid md:grid-cols-3 gap-8">
        {SKILL_GROUPS.map((group, i) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <h3 className="font-heading font-semibold text-text mb-4 text-sm uppercase tracking-wide">
              {group.label}
            </h3>
            <ul className="space-y-2.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-muted text-sm"
                >
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}