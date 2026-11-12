import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { slugify } from "../../lib/slugify";
import { SplitText } from "../motion/TextReveal";
import { useScrollReveal } from "../motion/useScrollReveal";

const EASE = [0.22, 1, 0.36, 1];
const WIPE_HIDDEN = "inset(100% 0% 0% 0%)";
const WIPE_SHOWN = "inset(0% 0% 0% 0%)";

const col = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const rise = {
  hidden: { opacity: 0, y: 16, transition: { duration: 0.25 } },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const BTN =
  "group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-on-ink transition-colors duration-300 before:absolute before:inset-0 before:translate-y-full before:bg-accent before:transition-transform before:duration-300 before:ease-out hover:before:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:before:transition-none";

/* `variants` drives the enter and exit when the filters change. `ref` is passed through
   so AnimatePresence popLayout can measure the card. */
export default function ProjectCard({ project, variants, ref }) {
  const reduce = useReducedMotion();
  const [imgRef, imgShown] = useScrollReveal({ margin: "0px 0px -8% 0px" });
  const [textRef, textShown] = useScrollReveal({ margin: "0px 0px -12% 0px" });

  return (
    <motion.article
      ref={ref}
      id={slugify(project.title)}
      layout
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group/card relative flex scroll-mt-28 flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors duration-300 hover:border-ink"
    >
      <motion.a
        ref={imgRef}
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden="true"
        initial={reduce ? false : { clipPath: WIPE_HIDDEN }}
        animate={
          reduce || imgShown
            ? { clipPath: WIPE_SHOWN, transition: { duration: 1, ease: EASE } }
            : { clipPath: WIPE_HIDDEN, transition: { duration: 0.3 } }
        }
        className="group relative block aspect-[16/10] overflow-hidden bg-ink"
      >
        <img
          src={project.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transform-none"
        />

        <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-md bg-on-ink text-ink transition-transform duration-300 group-hover:rotate-45 motion-reduce:transform-none">
          <ArrowUpRight size={18} aria-hidden />
        </span>

        <span className="absolute inset-0 flex items-end bg-ink/0 p-5 transition-colors duration-300 group-hover:bg-ink/50">
          <span className="inline-flex translate-y-3 items-center gap-2 rounded-md bg-on-ink px-4 py-2.5 text-sm font-semibold text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
            View live project <ArrowUpRight size={15} aria-hidden />
          </span>
        </span>
      </motion.a>

      <motion.div
        ref={textRef}
        variants={col}
        initial={reduce ? false : "hidden"}
        animate={reduce || textShown ? "show" : "hidden"}
        className="flex flex-1 flex-col justify-between gap-7 p-6 md:p-8"
      >
        <div>
          <motion.p
            variants={rise}
            className="text-xs font-semibold uppercase tracking-[0.16em] text-muted"
          >
            {project.subCategory || project.category}
          </motion.p>

          <h3 className="mt-3 font-heading text-2xl font-extrabold leading-tight tracking-tight text-text md:text-3xl">
            <span className="block overflow-hidden pb-[0.14em] pr-2">
              <SplitText text={project.title} inView stagger={0.05} />
            </span>
          </h3>

          <motion.p variants={rise} className="mt-2 text-sm font-semibold text-accent">
            {project.tagline}
          </motion.p>
          <motion.p variants={rise} className="mt-3 text-sm leading-relaxed text-muted">
            {project.description}
          </motion.p>

          <motion.ul variants={rise} aria-label="What was delivered" className="mt-5 flex flex-wrap gap-2">
            {["Design", "Build", "Launch"].map((t) => (
              <li
                key={t}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted"
              >
                {t}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div variants={rise}>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${project.title} live project (opens in a new tab)`}
            className={BTN}
          >
            <span className="relative">View live project</span>
            <ArrowUpRight
              size={16}
              aria-hidden
              className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
            />
          </a>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}