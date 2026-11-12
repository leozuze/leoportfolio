import { SplitText, WordFade } from "../motion/TextReveal";

const Line = ({ children }) => (
  <span className="block overflow-hidden pb-[0.14em] pr-2">{children}</span>
);

/* lines: [{ text, accent? }]. The accent line is the one red phrase. */
export default function PageHeader({ eyebrow, lines, intro, children }) {
  return (
    <header className="relative max-w-3xl">
      <div className="flex items-center gap-4">
        <span aria-hidden className="block h-px w-12 bg-ink" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
      </div>

      <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.04] tracking-tight text-text sm:text-5xl md:text-6xl">
        {lines.map((line, i) => (
          <Line key={line.text}>
            <SplitText
              text={line.text}
              delay={0.1 + i * 0.15}
              className={line.accent ? "text-accent" : undefined}
            />
          </Line>
        ))}
      </h1>

      {intro && (
        <WordFade
          text={intro}
          delay={0.5}
          className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg"
        />
      )}
      {children}
    </header>
  );
}