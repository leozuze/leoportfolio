import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Home() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-28 md:py-36">
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeUp}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-muted text-xs font-mono uppercase tracking-widest mb-8"
      >
        <Sparkles size={12} className="text-accent" />
        AI & Fintech · Pune, India
      </motion.div>

      <motion.h1
        initial="hidden"
        animate="visible"
        custom={1}
        variants={fadeUp}
        className="font-heading text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-text max-w-3xl"
      >
        Turning data into decisions,
        <br />
        <span className="text-accent">code into products.</span>
      </motion.h1>

      <motion.p
        initial="hidden"
        animate="visible"
        custom={2}
        variants={fadeUp}
        className="mt-6 text-muted text-lg max-w-xl leading-relaxed"
      >
        I'm Leo Zuze — an aspiring AI and fintech developer studying B.Tech at
        Vishwakarma University. I work with Python, machine learning, and
        data analysis, and build the web interfaces that put that work in
        front of people.
      </motion.p>

      <motion.div
        initial="hidden"
        animate="visible"
        custom={3}
        variants={fadeUp}
        className="mt-10 flex flex-wrap gap-4"
      >
        <NavLink
          to="/projects"
          className="inline-flex items-center gap-2 bg-accent text-bg px-6 py-3 rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
        >
          See my work <ArrowUpRight size={16} />
        </NavLink>
        <NavLink
          to="/contact"
          className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-medium text-sm text-text hover:border-accent transition-colors"
        >
          Get in touch
        </NavLink>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        custom={4}
        variants={fadeUp}
        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-border pt-10"
      >
        {[
          ["Python", "pandas · numpy · seaborn"],
          ["ML", "learning, applying, iterating"],
          ["Web", "React · Tailwind · JS"],
          ["Focus", "fintech & security"],
        ].map(([title, sub]) => (
          <div key={title}>
            <p className="font-heading text-text font-semibold">{title}</p>
            <p className="text-muted text-xs mt-1">{sub}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}