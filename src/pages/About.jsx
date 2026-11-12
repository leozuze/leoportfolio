import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Bot, Check, Code2, MessageSquare } from "lucide-react";
import { NavLink } from "react-router-dom";
import HeroPortrait from "../components/home/HeroPortrait";
import PageHeader from "../components/ui/PageHeader";
import TaperArrow from "../components/ui/TaperArrow";
import { FlowLines } from "../components/ui/Curves";
import { Reveal } from "../components/motion/primitives";
import { SplitText } from "../components/motion/TextReveal";
import { useScrollReveal } from "../components/motion/useScrollReveal";
import Seo from "../components/Seo";
import { SEO } from "../data/seoRoutes";

const EASE = [0.22, 1, 0.36, 1];
const EMAIL = "leonoelzuze@gmail.com";
const pad = (n) => String(n).padStart(2, "0");

const BTN =
  "group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md px-6 py-3.5 text-sm font-semibold transition-colors duration-300 before:absolute before:inset-0 before:translate-y-full before:transition-transform before:duration-300 before:ease-out hover:before:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:before:transition-none";

const Line = ({ children }) => (
  <span className="block overflow-hidden pb-[0.14em] pr-2">{children}</span>
);

const facts = [
  { label: "Role", value: "Freelance AI engineer" },
  { label: "Focus", value: "AI assistants, automation, web apps" },
  { label: "Approach", value: "One developer, start to finish" },
  { label: "Status", value: "Taking new projects" },
];

/* ---------- small flat visuals for the three cards ---------- */

function ChatVisual({ show }) {
  const bubble = (cls, delay, fromX) => (
    <motion.div
      className={`h-7 rounded-md ${cls}`}
      initial={{ opacity: 0, x: fromX }}
      animate={
        show
          ? { opacity: 1, x: 0, transition: { duration: 0.45, delay, ease: EASE } }
          : { opacity: 0, x: fromX, transition: { duration: 0.2 } }
      }
    />
  );
  return (
    <div aria-hidden className="space-y-2">
      {bubble("w-3/5 bg-ink/10", 0.2, -14)}
      {bubble("ml-auto w-2/5 bg-ink", 0.45, 14)}
      {bubble("w-1/2 bg-ink/10", 0.7, -14)}
    </div>
  );
}

function AgentVisual({ show }) {
  const steps = ["Reads the request", "Looks it up", "Completes the task"];
  return (
    <ul aria-hidden className="space-y-2.5">
      {steps.map((label, i) => (
        <li key={label} className="flex items-center gap-3 text-xs font-semibold text-muted">
          <span className="relative grid h-5 w-5 shrink-0 place-items-center border border-border">
            <motion.span
              className="absolute inset-0 bg-accent"
              initial={{ scale: 0 }}
              animate={
                show
                  ? { scale: 1, transition: { duration: 0.3, delay: 0.3 + i * 0.35 } }
                  : { scale: 0, transition: { duration: 0.15 } }
              }
            />
            <Check size={12} className="relative text-on-accent" />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

function WebVisual({ show }) {
  const bar = (cls, delay) => (
    <motion.div
      className={`origin-left ${cls}`}
      initial={{ scaleX: 0 }}
      animate={
        show
          ? { scaleX: 1, transition: { duration: 0.5, delay, ease: EASE } }
          : { scaleX: 0, transition: { duration: 0.15 } }
      }
    />
  );
  return (
    <div aria-hidden className="border border-border p-2.5">
      {bar("h-1.5 w-full bg-ink/15", 0.2)}
      <div className="mt-2.5">{bar("h-10 w-full bg-ink/10", 0.35)}</div>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {bar("h-6 bg-ink/10", 0.5)}
        {bar("h-6 bg-ink/10", 0.6)}
        {bar("h-6 bg-accent", 0.7)}
      </div>
    </div>
  );
}

const focusAreas = [
  {
    kicker: "AI assistants",
    headline: "Answer customers around the clock.",
    icon: MessageSquare,
    Visual: ChatVisual,
    detail:
      "Chat assistants on your website that answer in your tone, capture enquiries and hand over to you when a person is needed.",
  },
  {
    kicker: "Automation and agents",
    headline: "Take repetitive work off your plate.",
    icon: Bot,
    Visual: AgentVisual,
    detail:
      "Software that reads requests, looks things up and completes the task end to end, connected to the tools you already use.",
  },
  {
    kicker: "Websites and web apps",
    headline: "From first idea to live launch.",
    icon: Code2,
    Visual: WebVisual,
    detail:
      "Fast, professional sites and full web apps with accounts and a database, designed and built end to end by one developer.",
  },
];

const principles = [
  {
    title: "Plain language",
    text: "I explain everything without jargon. You tell me the goal, I handle the technology.",
  },
  {
    title: "One developer, start to finish",
    text: "You work directly with me, so there are no hand-offs and nothing gets lost in translation.",
  },
  {
    title: "A fixed quote",
    text: "Scope, timeline and price are agreed before any work begins, so there are no surprises.",
  },
];

function FocusCard({ item, index }) {
  const reduce = useReducedMotion();
  const [ref, shown] = useScrollReveal({ margin: "0px 0px -10% 0px" });
  const show = reduce || shown;
  const { kicker, headline, detail, icon: Icon, Visual } = item;

  return (
    <motion.article
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 36 }}
      animate={
        show
          ? { opacity: 1, y: 0, transition: { duration: 0.7, delay: index * 0.12, ease: EASE } }
          : { opacity: 0, y: 36, transition: { duration: 0.25 } }
      }
      className="group/card relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-7 transition-colors duration-300 hover:border-ink"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-1 -top-4 select-none font-heading text-[7rem] font-extrabold leading-none text-transparent transition-transform duration-500 group-hover/card:-translate-x-2 motion-reduce:transform-none"
        style={{ WebkitTextStroke: "1px rgba(22,20,15,0.12)" }}
      >
        {pad(index + 1)}
      </span>

      <div className="relative flex flex-1 flex-col">
        <span className="grid h-12 w-12 place-items-center rounded-md bg-ink text-on-ink transition-colors duration-300 group-hover/card:bg-accent">
          <Icon size={22} aria-hidden />
        </span>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted">{kicker}</p>
        <h3 className="mt-2 font-heading text-xl font-extrabold leading-snug text-text">{headline}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{detail}</p>

        <div className="mt-auto pt-7">
          <Visual show={show} />
        </div>

        <NavLink
          to="/services"
          className="mt-6 inline-flex w-fit items-center gap-1.5 border-b-2 border-ink pb-0.5 text-sm font-semibold text-text transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          See pricing <ArrowUpRight size={14} aria-hidden />
        </NavLink>
      </div>
    </motion.article>
  );
}

function Closing() {
  return (
    <Reveal className="mt-24 md:mt-32">
      <section className="relative overflow-hidden rounded-xl bg-ink px-6 py-16 text-center text-on-ink md:px-16 md:py-24">
        <FlowLines
          className="text-white/[0.1]"
          count={5}
          gap={30}
          inView
          accentLine={2}
          accentColor="var(--color-accent-soft)"
        />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-ink/60">
            Got a project in mind?
          </p>
          <h2 className="mx-auto mt-5 max-w-2xl font-heading text-4xl font-extrabold leading-[1.04] tracking-tight md:text-6xl">
            <Line>
              <SplitText text="Got an idea?" inView />
            </Line>
            <Line>
              <SplitText text="Let's make it real." inView delay={0.2} className="text-accent-soft" />
            </Line>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-on-ink/65 md:text-base">
            A website that converts, an AI assistant, or a tool that saves your team hours. Tell me
            what you need and I&rsquo;ll tell you honestly how I&rsquo;d build it.
          </p>

          {/* the button, with the arrow pointing at it */}
          <div className="relative mt-28 inline-block">
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 flex -translate-x-1/2 flex-col items-center sm:hidden">
              <span className="-rotate-6 font-heading text-base font-extrabold text-accent-soft">Start here</span>
              <TaperArrow variant="down" delay={0.2} className="w-[60px] text-accent-soft" />
            </div>

            <div className="pointer-events-none absolute bottom-[calc(100%-8px)] right-[calc(100%-24px)] hidden sm:block">
              <span className="mb-1 block -rotate-6 font-heading text-base font-extrabold text-accent-soft">
                Start here
              </span>
              <TaperArrow variant="side" delay={0.2} className="w-[150px] text-accent-soft" />
            </div>

            <NavLink
              to="/contact"
              className={`${BTN} relative bg-on-ink text-ink before:bg-accent hover:text-on-accent`}
            >
              <span className="relative">Get in touch</span>
              <ArrowUpRight
                size={16}
                aria-hidden
                className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
              />
            </NavLink>
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-on-ink/60">
            or write to{" "}
            <a
              href={`mailto:${EMAIL}`}
              className="text-on-ink transition-colors hover:text-accent-soft"
            >
              {EMAIL}
            </a>
          </p>
        </div>
      </section>
    </Reveal>
  );
}

export default function About() {
  return (
    <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-12 md:pb-32 md:pt-16">
      <Seo {...SEO.about} />

      {/* Hero */}
      <div className="grid items-end gap-14 md:grid-cols-12">
        <div className="pb-4 md:col-span-7 md:pb-16">
          <PageHeader
            eyebrow="About"
            lines={[
              { text: "I turn business problems" },
              { text: "into software" },
              { text: "that works.", accent: true },
            ]}
            intro="I design and build AI assistants, automation and web apps for businesses, from the first conversation to a live launch. I work directly with you, explain everything in plain language and build around how your business actually runs."
          />

          <dl className="mt-9 grid max-w-md grid-cols-2 gap-x-6 gap-y-5">
            {facts.map(({ label, value }) => (
              <div key={label} className="border-l-2 border-accent pl-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-text">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <NavLink to="/projects" className={`${BTN} bg-ink text-on-ink before:bg-accent`}>
              <span className="relative">See my projects</span>
              <ArrowUpRight
                size={16}
                aria-hidden
                className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
              />
            </NavLink>
            <NavLink
              to="/contact"
              className="border-b-2 border-ink pb-1 text-sm font-semibold text-text transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Get in touch
            </NavLink>
          </div>
        </div>

        {/* portrait stands on a baseline */}
        <div className="md:col-span-5">
          <HeroPortrait />
          <div aria-hidden className="mx-auto h-2 w-full max-w-[460px] bg-ink" />
        </div>
      </div>

      {/* Three ways I can help */}
      <section aria-label="What I can build for you" className="mt-24 md:mt-32">
        <div className="flex items-center gap-4">
          <span aria-hidden className="block h-px w-12 bg-ink" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            What I can build for you
          </p>
        </div>
        <h2 className="mt-6 font-heading text-4xl font-extrabold leading-[1.04] tracking-tight text-text md:text-5xl">
          <Line>
            <SplitText text="Three ways I can" inView />
          </Line>
          <Line>
            <SplitText text="help your business." inView delay={0.15} className="text-accent" />
          </Line>
        </h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {focusAreas.map((item, i) => (
            <FocusCard key={item.kicker} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* How I work */}
      <Reveal className="mt-24 grid gap-10 md:mt-32 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex items-center gap-4">
            <span aria-hidden className="block h-px w-12 bg-ink" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">How I work</p>
          </div>
          <h2 className="mt-6 font-heading text-3xl font-extrabold leading-[1.08] tracking-tight text-text md:text-4xl">
            Simple, clear, <span className="text-accent">no surprises.</span>
          </h2>
        </div>

        <ul className="divide-y divide-border border-y border-border md:col-span-8">
          {principles.map((p, i) => (
            <li key={p.title} className="grid gap-2 py-6 sm:grid-cols-[3rem_1fr]">
              <span className="text-sm font-bold tabular-nums text-accent">{pad(i + 1)}</span>
              <div>
                <h3 className="font-heading text-lg font-extrabold text-text">{p.title}</h3>
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted md:text-base">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>

      <Closing />
    </div>
  );
}