import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { techIcons } from "../../data/skills";

// Curated subsets for the homepage teaser — full detail lives on /skills.
// Names must match a skill name in data/skills.js exactly to pick up an icon.
const aiSkillNames = ["Python", "Pandas", "NumPy", "Scikit-learn", "Web Scraping", "Model Training"];
const devSkillNames = ["React", "JavaScript", "Tailwind CSS", "MongoDB", "Framer Motion"];
const toolSkillNames = ["Git", "GitHub", "VS Code", "Vercel", "Supabase"];

const toChips = (names) => names.map((name) => ({ name, icon: techIcons[name] }));

const aiSkills = toChips(aiSkillNames);
const devSkills = toChips(devSkillNames);
const toolSkills = toChips(toolSkillNames);

export default function SkillsPreview() {
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

  const column = {
    hidden: (i) => ({
      opacity: 0,
      x: shouldReduceMotion ? 0 : i % 2 === 0 ? -48 : 48,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const chipContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
  };
  const chip = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
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
            What I Work With
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text">
            Skills & Tools
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.4 }}
          variants={headerRight}
        >
          <NavLink
            to="/skills"
            className="inline-flex items-center gap-2 border border-border px-5 py-2.5 rounded-full font-medium text-sm text-text hover:border-accent hover:text-accent transition-colors"
          >
            View All Skills <ArrowUpRight size={16} />
          </NavLink>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* AI & Fintech — primary focus */}
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={column}
          className="relative bg-surface border border-accent/30 rounded-3xl p-8"
        >
          <span className="absolute -top-3 left-8 bg-bg border border-accent/40 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-accent">
            Primary Focus
          </span>
          <h3 className="font-heading text-xl font-semibold text-text mb-6">
            AI & Fintech Dev
          </h3>

          <motion.div
            variants={chipContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            {aiSkills.map(({ name, icon: Icon }) => (
              <motion.div
                key={name}
                variants={chip}
                className="group flex items-center gap-2.5 bg-bg border border-border rounded-xl px-4 py-3 hover:border-accent transition-colors"
              >
                <Icon
                  size={18}
                  className="text-muted group-hover:text-accent transition-colors"
                />
                <span className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                  {name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Full Stack Dev — secondary */}
        <motion.div
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={column}
          className="bg-surface border border-border rounded-3xl p-8"
        >
          <h3 className="font-heading text-xl font-semibold text-text mb-6">
            Full Stack Dev
          </h3>

          <motion.div
            variants={chipContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            {devSkills.map(({ name, icon: Icon }) => (
              <motion.div
                key={name}
                variants={chip}
                className="group flex items-center gap-2.5 bg-bg border border-border rounded-xl px-4 py-3 hover:border-accent transition-colors"
              >
                <Icon
                  size={18}
                  className="text-muted group-hover:text-accent transition-colors"
                />
                <span className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                  {name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Tools & Deployment */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
        }}
        className="mt-8 bg-surface border border-border rounded-3xl p-8"
      >
        <h3 className="font-heading text-xl font-semibold text-text mb-6">
          Tools & Deployment
        </h3>

        <motion.div
          variants={chipContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          {toolSkills.map(({ name, icon: Icon }) => (
            <motion.div
              key={name}
              variants={chip}
              className="group flex items-center gap-2.5 bg-bg border border-border rounded-xl px-4 py-3 hover:border-accent transition-colors"
            >
              <Icon
                size={18}
                className="text-muted group-hover:text-accent transition-colors"
              />
              <span className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                {name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
