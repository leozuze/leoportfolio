import { mkdir, readFile, writeFile } from "node:fs/promises";
import { SEO, urlFor } from "../src/data/seoRoutes.js";

const dist = new URL("../dist/", import.meta.url);
const template = await readFile(new URL("index.html", dist), "utf8");

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function swap(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`prerender-meta: could not find ${label} in dist/index.html`);
  }
  return html.replace(pattern, replacement);
}

const meta = (attr, key) => new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*\\/?>`);

function build(entry) {
  const url = urlFor(entry.path);
  const title = esc(entry.title);
  const description = esc(entry.description);
  let html = template;

  html = swap(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, "<title>");
  html = swap(html, meta("name", "description"), `<meta name="description" content="${description}" />`, "description");
  html = swap(
    html,
    meta("name", "robots"),
    `<meta name="robots" content="${entry.noindex ? "noindex, follow" : "index, follow"}" />`,
    "robots"
  );
  html = swap(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    entry.noindex ? "" : `<link rel="canonical" href="${url}" />`,
    "canonical"
  );
  html = swap(html, meta("property", "og:url"), `<meta property="og:url" content="${url}" />`, "og:url");
  html = swap(html, meta("property", "og:title"), `<meta property="og:title" content="${title}" />`, "og:title");
  html = swap(html, meta("property", "og:description"), `<meta property="og:description" content="${description}" />`, "og:description");
  html = swap(html, meta("name", "twitter:title"), `<meta name="twitter:title" content="${title}" />`, "twitter:title");
  html = swap(html, meta("name", "twitter:description"), `<meta name="twitter:description" content="${description}" />`, "twitter:description");
  return html;
}

// With "cleanUrls" on Vercel, /about is served from about.html
const outputs = [
  ["index.html", SEO.home],
  ["about.html", SEO.about],
  ["projects.html", SEO.projects],
  ["services.html", SEO.services],
  ["skills.html", SEO.skills],
  ["contact.html", SEO.contact],
  ["404.html", SEO.notFound], // unknown URLs get a real 404 status with this page
];

await mkdir(dist, { recursive: true });
for (const [file, entry] of outputs) {
  await writeFile(new URL(file, dist), build(entry), "utf8");
  console.log(`prerender-meta: wrote dist/${file}`);
}