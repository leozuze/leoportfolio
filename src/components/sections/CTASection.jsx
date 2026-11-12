import { useId, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, FileText, Mail, MessageCircle, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { SplitText, WordFade } from "../motion/TextReveal";
import { Reveal } from "../motion/primitives";
import { useScrollReveal } from "../motion/useScrollReveal";
import { START_PROJECT_URL } from "../layout/navData";

const EASE = [0.22, 1, 0.36, 1];
const EMAIL = "leonoelzuze@gmail.com";

// Edit the wording so it matches your real terms.
const STEPS = [
  {
    title: "A short chat",
    text: "Tell me what you need and what is slowing you down. No jargon, no commitment.",
  },
  {
    title: "A fixed quote",
    text: "You get the scope, timeline and price in writing before any work begins.",
  },
  {
    title: "Build and review",
    text: "I build in stages and show you progress, so you see it working and can steer it.",
  },
  {
    title: "Launch and support",
    text: "Your project goes live, and I stay around to fix things and make improvements.",
  },
];

// Prices in the first answer come from data/services.js. Edit the rest to match your terms.
const FAQ = [
  {
    q: "How much does a project cost?",
    a: "Prices start from $100 for a website, $120 for workflow automation, and $150 to $250 for AI assistants, agents and knowledge assistants. After a short chat you get a fixed quote, so there are no surprises.",
  },
  {
    q: "Do I need to understand the technology?",
    a: "No. I explain everything in plain language. You only need to tell me what you want to achieve and how your business works.",
  },
  {
    q: "Will it work with the tools I already use?",
    a: "In most cases, yes. I connect to the tools you already use, such as spreadsheets, forms, inboxes and websites, so your team doesn't have to change how it works.",
  },
  {
    q: "Who will I be working with?",
    a: "Directly with me. I design and build every project end to end, so there are no hand-offs and nothing gets lost in translation.",
  },
  {
    q: "What if the assistant can't answer something?",
    a: "It passes the conversation to you or your team. You decide when a person should step in.",
  },
  {
    q: "What happens after launch?",
    a: "Your project goes live, ready for visitors. If you need changes or support later, message me and we'll sort it out.",
  },
];

const CONTACTS = [
  { icon: MessageCircle, label: "WhatsApp", sub: "Message me directly", href: START_PROJECT_URL, external: true },
  { icon: Mail, label: "Email", sub: EMAIL, href: `mailto:${EMAIL}` },
  { icon: FileText, label: "Contact form", sub: "Describe your project", to: "/contact" },
];

const list = { hidden: {}, show: { transition: { staggerChildren: 0.14 } } };
const item = {
  hidden: { opacity: 0, y: 18, transition: { duration: 0.25 } },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const rule = {
  hidden: { scaleX: 0, transition: { duration: 0.2 } },
  show: { scaleX: 1, transition: { duration: 0.9, ease: EASE } },
};

const Line = ({ children }) => (
  <span className="block overflow-hidden pb-[0.14em] pr-2">{children}</span>
);

/* One step. Its rule fills with ink and its numeral fills with red as you scroll past. */
function Step({ step, i, progress }) {
  const reduce = useReducedMotion();
  const fill = useTransform(progress, (v) =>
    reduce ? 1 : Math.min(1, Math.max(0, v * STEPS.length - i))
  );
  const num = `0${i + 1}`;

  return (
    <motion.li variants={item} className="group relative pt-6">
      <motion.span
        aria-hidden
        variants={rule}
        style={{ originX: 0 }}
        className="absolute inset-x-0 top-0 h-0.5 bg-ink/20"
      >
        <motion.span
          style={{ scaleX: fill }}
          className="absolute inset-0 origin-left bg-ink transition-colors duration-300 group-hover:bg-accent"
        />
      </motion.span>

      <p className="relative font-heading text-5xl font-extrabold tracking-tight">
        <span
          aria-hidden
          className="text-transparent"
          style={{ WebkitTextStroke: "1.5px var(--color-accent)" }}
        >
          {num}
        </span>
        <motion.span aria-hidden style={{ opacity: fill }} className="absolute inset-0 text-accent">
          {num}
        </motion.span>
        <span className="sr-only">{num}</span>
      </p>

      <h3 className="mt-4 font-heading text-xl font-extrabold text-text">{step.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
    </motion.li>
  );
}

function Faq() {
  const reduce = useReducedMotion();
  const uid = useId();
  const [open, setOpen] = useState(0);

  return (
    <div className="mt-20 grid gap-10 md:mt-24 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="flex items-center gap-4">
          <span aria-hidden className="block h-px w-12 bg-ink" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Common questions
          </p>
        </div>
        <h2 className="mt-6 font-heading text-3xl font-extrabold leading-[1.08] tracking-tight text-text md:text-4xl">
          <Line>
            <SplitText text="Questions" inView />
          </Line>
          <Line>
            <SplitText text="people ask." inView delay={0.15} className="text-accent" />
          </Line>
        </h2>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
          Can&rsquo;t find your answer? Message me and I&rsquo;ll reply personally.
        </p>
      </div>

      <Reveal as="ul" className="divide-y divide-border border-y border-border lg:col-span-8">
        {FAQ.map((f, i) => {
          const on = open === i;
          return (
            <li key={f.q}>
              <h3>
                <button
                  type="button"
                  id={`${uid}-q-${i}`}
                  aria-expanded={on}
                  aria-controls={`${uid}-a-${i}`}
                  onClick={() => setOpen(on ? -1 : i)}
                  className="group flex w-full items-center justify-between gap-6 py-5 text-left font-heading text-lg font-extrabold text-text transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {f.q}
                  <motion.span
                    aria-hidden
                    animate={{ rotate: on ? 45 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-text transition-colors group-hover:border-accent group-hover:text-accent"
                  >
                    <Plus size={16} />
                  </motion.span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    id={`${uid}-a-${i}`}
                    role="region"
                    aria-labelledby={`${uid}-q-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-xl pb-6 text-sm leading-relaxed text-muted md:text-base">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </Reveal>
    </div>
  );
}

const tileClass =
  "group flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-5 transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transform-none motion-reduce:transition-none";

function Tile({ icon: Icon, label, sub, href, to, external }) {
  const inner = (
    <>
      <span className="flex min-w-0 items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-ink text-on-ink transition-colors duration-300 group-hover:bg-accent">
          <Icon size={20} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block font-bold text-text">{label}</span>
          <span className="block truncate text-sm text-muted">{sub}</span>
        </span>
      </span>
      <ArrowUpRight
        size={18}
        aria-hidden
        className="shrink-0 text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
      />
    </>
  );

  if (to) {
    return (
      <NavLink to={to} className={tileClass}>
        {inner}
      </NavLink>
    );
  }
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={tileClass}
    >
      {inner}
    </a>
  );
}

export default function CTASection() {
  const reduce = useReducedMotion();
  // one ref serves both the reveal and the scroll-linked step fill
  const [listRef, listShown] = useScrollReveal({ margin: "0px 0px -10% 0px" });
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 45%"],
  });

  return (
    <section
      aria-label="How a project works"
      className="mx-auto max-w-6xl px-6 py-20 md:py-28"
    >
      <div className="flex items-center gap-4">
        <span aria-hidden className="block h-px w-12 bg-ink" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          How it works
        </p>
      </div>

      <h2 className="mt-6 font-heading text-4xl font-extrabold leading-[1.04] tracking-tight text-text md:text-6xl">
        <Line>
          <SplitText text="From first chat to" inView />
        </Line>
        <Line>
          <SplitText text="live launch." inView delay={0.2} className="text-accent" />
        </Line>
      </h2>

      <WordFade
        inView
        delay={0.3}
        text="Four clear steps, so you always know what happens next."
        className="mt-5 max-w-md text-sm text-muted md:text-base"
      />

      <motion.ol
        ref={listRef}
        variants={list}
        initial={reduce ? "show" : "hidden"}
        animate={reduce || listShown ? "show" : "hidden"}
        className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STEPS.map((step, i) => (
          <Step key={step.title} step={step} i={i} progress={scrollYProgress} />
        ))}
      </motion.ol>

      <Faq />

      <div className="mt-20 md:mt-24">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Start with step one
        </p>
        <Reveal className="grid gap-4 md:grid-cols-3">
          {CONTACTS.map((c) => (
            <Tile key={c.label} {...c} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}