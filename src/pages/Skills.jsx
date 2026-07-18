import { motion, useReducedMotion } from "framer-motion";
import { skillCategories } from "../data/skills";

export default function Skills() {
  const shouldReduceMotion = useReducedMotion();

  const headerFade = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  const categoryHeader = {
    hidden: (i) => ({ opacity: 0, x: shouldReduceMotion ? 0 : i % 2 === 0 ? -32 : 32 }),
    visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  const cardContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  };
  const card = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 overflow-x-hidden">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.6 }}
        variants={headerFade}
        className="max-w-2xl mb-20"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-accent mb-2">
          Skills & Tools
        </p>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-text mb-4">
          What I Work With
        </h1>
        <p className="text-muted text-sm md:text-base leading-relaxed">
          AI and fintech development come first — data pipelines, model
          training, and the tools around them. Full stack web development
          rounds out the picture, turning that work into something people can
          actually use.
        </p>
      </motion.div>

      <div className="space-y-20">
        {skillCategories.map((category, ci) => (
          <div key={category.title}>
            <motion.div
              custom={ci}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.4 }}
              variants={categoryHeader}
              className="mb-8"
            >
              <h2 className="font-heading text-xl md:text-2xl font-semibold text-text">
                {category.title}
              </h2>
              <p className="text-sm text-muted mt-1">{category.tagline}</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
              variants={cardContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {category.skills.map(({ name, icon: Icon, detail }) => (
                <motion.div
                  key={name}
                  variants={card}
                  className="group bg-surface border border-border rounded-2xl p-5 hover:border-accent transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon
                      size={20}
                      className="text-muted group-hover:text-accent transition-colors shrink-0"
                    />
                    <h3 className="font-heading text-base font-semibold text-text">
                      {name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{detail}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
