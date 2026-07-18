import { motion } from "framer-motion";
import { GraduationCap, MapPin, Target } from "lucide-react";

export default function About() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-accent font-mono text-xs uppercase tracking-widest mb-3"
      >
        About
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="font-heading text-4xl md:text-5xl font-bold text-text max-w-2xl"
      >
        Learning AI, building the tools to apply it.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-6 text-muted text-lg leading-relaxed max-w-2xl"
      >
        I'm currently pursuing my B.Tech at Vishwakarma University, focused
        on the intersection of artificial intelligence and fintech. Most of
        my hands-on work right now is in Python — data analysis and
        visualization with pandas, NumPy, Matplotlib, Seaborn, and Cufflinks
        — while I build toward applying machine learning to real financial
        and security problems. Alongside that, I build web interfaces with
        React and Tailwind CSS, so the tools and models I work on don't stay
        stuck in a notebook.
      </motion.p>

      <div className="grid md:grid-cols-3 gap-6 mt-16">
        <div className="p-6 rounded-2xl border border-border bg-surface">
          <GraduationCap size={20} className="text-accent mb-3" />
          <h3 className="font-heading font-semibold text-text mb-1">Education</h3>
          <p className="text-muted text-sm leading-relaxed">
            B.Tech, Vishwakarma University — currently in progress.
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-border bg-surface">
          <Target size={20} className="text-accent mb-3" />
          <h3 className="font-heading font-semibold text-text mb-1">Focus</h3>
          <p className="text-muted text-sm leading-relaxed">
            AI applied to fintech and security — data analysis first, ML
            models next.
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-border bg-surface">
          <MapPin size={20} className="text-accent mb-3" />
          <h3 className="font-heading font-semibold text-text mb-1">Based in</h3>
          <p className="text-muted text-sm leading-relaxed">
            Pune, India — open to remote collaboration.
          </p>
        </div>
      </div>
    </section>
  );
}