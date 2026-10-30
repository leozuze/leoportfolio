import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-words text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
    >
      {children}
    </a>
  ),

  pre: ({ children }) => (
    <pre className="my-3 max-w-full overflow-x-auto rounded-xl border border-white/10 bg-black/25 p-3 font-mono text-xs leading-relaxed">
      {children}
    </pre>
  ),

table: ({ children }) => (
  <div
    className="my-4 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-white/10"
    role="region"
    aria-label="Answer table"
    tabIndex={0}
  >
    <table className="w-full min-w-[480px] border-collapse text-left text-xs leading-6">
      {children}
    </table>
  </div>
),

thead: ({ children }) => (
  <thead className="bg-white/[0.06]">
    {children}
  </thead>
),

tbody: ({ children }) => (
  <tbody className="divide-y divide-white/[0.07]">
    {children}
  </tbody>
),

tr: ({ children }) => (
  <tr className="transition-colors hover:bg-white/[0.025]">
    {children}
  </tr>
),

th: ({ children, style }) => (
  <th
    style={style}
    className="min-w-[120px] border-b border-white/10 px-4 py-3 align-top font-semibold text-text"
  >
    {children}
  </th>
),

td: ({ children, style }) => (
  <td
    style={style}
    className="min-w-[120px] px-4 py-3 align-top text-text/80 [&_p]:m-0"
  >
    {children}
  </td>
),

  // Do not load external images supplied by generated Markdown.
  img: ({ alt }) => (
    <span className="text-muted">{alt || "[Image omitted]"}</span>
  ),
};

export default function ChatMarkdown({ text }) {
  return (
    <div
      className="
        min-w-0 text-[13px] leading-7 text-text/85
        [overflow-wrap:anywhere]
        [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0
        [&_strong]:font-semibold [&_strong]:text-text
        [&_h1]:mb-2 [&_h1]:mt-5 [&_h1]:text-lg [&_h1]:font-semibold
        [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold
        [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold
        [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5
        [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5
        [&_li]:my-1 [&_li::marker]:text-accent
        [&_blockquote]:my-3 [&_blockquote]:border-l-2
        [&_blockquote]:border-accent/50 [&_blockquote]:pl-3
        [&_blockquote]:text-muted
        [&_code]:rounded [&_code]:bg-white/5
        [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono
        [&_code]:text-[0.9em]
        [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_hr]:my-4 [&_hr]:border-white/10
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        skipHtml
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}