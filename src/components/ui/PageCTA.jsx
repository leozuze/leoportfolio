import { NavLink } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../motion/primitives";
import { SplitText, WordFade } from "../motion/TextReveal";
import { FlowLines } from "./Curves";

const BTN =
  "group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md bg-on-ink px-6 py-3.5 text-sm font-semibold text-ink transition-colors duration-300 before:absolute before:inset-0 before:translate-y-full before:bg-accent before:transition-transform before:duration-300 before:ease-out hover:text-on-accent hover:before:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-ink motion-reduce:before:transition-none";

const LINK =
  "border-b-2 border-white/40 pb-1 text-sm font-semibold text-on-ink transition-colors duration-200 hover:border-accent-soft hover:text-accent-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-ink";

const Line = ({ children }) => (
  <span className="block overflow-hidden pb-[0.14em] pr-2">{children}</span>
);

function Action({ action, primary }) {
  const inner = primary ? (
    <>
      <span className="relative">{action.label}</span>
      <ArrowUpRight
        size={16}
        aria-hidden
        className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
      />
    </>
  ) : (
    action.label
  );
  const cls = primary ? BTN : LINK;

  if (action.to) {
    return (
      <NavLink to={action.to} className={cls}>
        {inner}
      </NavLink>
    );
  }
  return (
    <a
      href={action.href}
      {...(action.external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={cls}
    >
      {inner}
    </a>
  );
}

/* Ink call-to-action panel for the bottom of a page.
   lines: [{ text, accent? }]. primary and secondary: { label, to | href, external? } */
export default function PageCTA({ eyebrow, lines, text, primary, secondary, className = "" }) {
  return (
    <Reveal className={className}>
      <section className="relative overflow-hidden rounded-xl bg-ink px-6 py-14 text-on-ink md:px-14 md:py-20">
        <FlowLines
          className="text-white/[0.1]"
          count={5}
          gap={30}
          inView
          accentLine={2}
          accentColor="var(--color-accent-soft)"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-44 -right-24 h-96 w-96 rounded-full bg-accent"
        />

        <div className="relative max-w-xl">
          <div className="flex items-center gap-4">
            <span aria-hidden className="block h-px w-12 bg-accent-soft" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-ink/60">
              {eyebrow}
            </p>
          </div>

          <h2 className="mt-6 font-heading text-3xl font-extrabold leading-[1.06] tracking-tight sm:text-4xl md:text-5xl">
            {lines.map((line, i) => (
              <Line key={line.text}>
                <SplitText
                  text={line.text}
                  inView
                  delay={i * 0.15}
                  className={line.accent ? "text-accent-soft" : undefined}
                />
              </Line>
            ))}
          </h2>

          <WordFade
            text={text}
            inView
            delay={0.3}
            className="mt-5 max-w-md text-sm leading-relaxed text-on-ink/65 md:text-base"
          />

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <Action action={primary} primary />
            {secondary && <Action action={secondary} />}
          </div>
        </div>
      </section>
    </Reveal>
  );
}