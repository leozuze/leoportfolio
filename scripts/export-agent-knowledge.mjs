// Exports the website's own data files to public/agent-knowledge.json so the
// JayZ assistant can never say anything the website does not say.
//
// Run:  node scripts/export-agent-knowledge.mjs      (or: npm run export:agent)
// It also runs automatically before every build through the "prebuild" script.
//
// The data files import icons and images, which plain Node cannot load. esbuild
// (already installed with Vite) bundles them in memory with those imports
// replaced by empty stubs. Nothing temporary is written to disk.

import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ---- Adjust these three paths if your data files live somewhere else ------
const PROJECTS_FILE = path.join(ROOT, "src", "data", "projects.js");
const SERVICES_FILE = path.join(ROOT, "src", "data", "services.js");
const SKILLS_FILE = path.join(ROOT, "src", "data", "skills.js");
// ----------------------------------------------------------------------------

const OUT_FILE = path.join(ROOT, "public", "agent-knowledge.json");
const SCHEMA_VERSION = 1;

// A feed with fewer items than this is treated as broken and fails the build.
const MIN_PROJECTS = 3;
const MIN_SERVICES = 3;
const MIN_SKILL_CATEGORIES = 2;

// Facts that only the bot needs (GitHub repo names, other names a visitor might
// use, tech stack). They are kept here so projects.js stays clean.
// Keyed by the exact project title in projects.js. Verify the stack entries.
const PROJECT_EXTRAS = {
  DANN: { github: null, aliases: [], stack: [] },
  SkyScout: {
    github: "Flight-Finder",
    aliases: ["NevuX", "Flight Finder"],
    stack: [
      "Python",
      "React",
      "SerpAPI",
      "AviationStack",
      "Geoapify",
      "OpenStreetMap",
      "Mapillary",
      "Wikipedia",
      "Leaflet",
    ],
  },
  "Jamco Builders": { github: null, aliases: ["Jamco"], stack: [] },
  "Talitha Cumi Accessories": {
    github: "Talitha-Cumi-Accessories",
    aliases: ["Talitha Cumi", "Talitha"],
    stack: ["React", "Vite", "JavaScript"],
  },
  "Ritz Marketing": { github: null, aliases: ["Ritz"], stack: [] },
  "Nexus Lending": {
    github: "Nexus-Lending",
    aliases: ["Nexus"],
    stack: ["React", "Vite", "Tailwind CSS", "Framer Motion"],
  },
};

// ---- Load the data files ---------------------------------------------------

// Replaces icon packages and image imports with an empty module.
const stubAssets = {
  name: "stub-assets",
  setup(b) {
    b.onResolve(
      { filter: /^(react-icons(\/.*)?|lucide-react)$|\.(png|jpe?g|webp|gif|svg|avif)$/ },
      (args) => ({ path: args.path, namespace: "stub" })
    );
    b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
      contents: "module.exports = {};",
      loader: "js",
    }));
  },
};

const toImportPath = (file) => JSON.stringify(file.split(path.sep).join("/"));

async function loadData() {
  const result = await build({
    stdin: {
      contents: [
        `export { projects } from ${toImportPath(PROJECTS_FILE)};`,
        `export { services } from ${toImportPath(SERVICES_FILE)};`,
        `export { skillCategories } from ${toImportPath(SKILLS_FILE)};`,
      ].join("\n"),
      resolveDir: ROOT,
      loader: "js",
    },
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    plugins: [stubAssets],
    logLevel: "silent",
  });

  const code = result.outputFiles[0].text;
  const url = "data:text/javascript;base64," + Buffer.from(code).toString("base64");
  return import(url);
}

// ---- Validation helpers ----------------------------------------------------

const problems = [];

function text(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    problems.push(`${label} is missing or empty`);
    return "";
  }
  return value.trim();
}

function link(value, label) {
  const v = text(value, label);
  if (v && !/^https:\/\/[^\s]+$/.test(v)) problems.push(`${label} is not a valid https URL: ${v}`);
  return v;
}

function list(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    problems.push(`${label} must be a non-empty list`);
    return [];
  }
  return value.map((item, i) => text(item, `${label}[${i}]`));
}

// ---- Build the feed --------------------------------------------------------

const data = await loadData();

const projects = (data.projects ?? []).map((p) => {
  const label = `project "${p.title ?? "?"}"`;
  const extras = PROJECT_EXTRAS[p.title];
  if (!extras) {
    console.warn(`Note: no PROJECT_EXTRAS entry for ${label}. It is exported without repo, aliases or stack.`);
  }
  return {
    title: text(p.title, `${label} title`),
    category: text(p.category, `${label} category`),
    subCategory: text(p.subCategory, `${label} subCategory`),
    tagline: text(p.tagline, `${label} tagline`),
    description: text(p.description, `${label} description`),
    url: link(p.url, `${label} url`),
    status: "live", // projects.js only holds live projects
    github: extras?.github ?? null,
    aliases: extras?.aliases ?? [],
    stack: extras?.stack ?? [],
  };
});

const services = (data.services ?? []).map((s) => {
  const label = `service "${s.id ?? s.title ?? "?"}"`;
  return {
    id: text(s.id, `${label} id`),
    title: text(s.title, `${label} title`),
    tagline: text(s.tagline, `${label} tagline`),
    description: text(s.description, `${label} description`),
    features: list(s.features, `${label} features`),
    price: text(s.price, `${label} price`),
    priceNote: text(s.priceNote, `${label} priceNote`),
  };
});

const skillCategories = (data.skillCategories ?? []).map((c) => {
  const label = `skill category "${c.title ?? "?"}"`;
  return {
    title: text(c.title, `${label} title`),
    tagline: text(c.tagline, `${label} tagline`),
    skills: (c.skills ?? []).map((s) => ({
      name: text(s.name, `${label} skill name`),
      detail: text(s.detail, `${label} skill "${s.name ?? "?"}" detail`),
    })),
  };
});

if (projects.length < MIN_PROJECTS) problems.push(`only ${projects.length} projects (minimum ${MIN_PROJECTS})`);
if (services.length < MIN_SERVICES) problems.push(`only ${services.length} services (minimum ${MIN_SERVICES})`);
if (skillCategories.length < MIN_SKILL_CATEGORIES) {
  problems.push(`only ${skillCategories.length} skill categories (minimum ${MIN_SKILL_CATEGORIES})`);
}

for (const [name, items] of [["projects", projects], ["services", services]]) {
  const seen = new Set();
  for (const item of items) {
    const key = (item.id ?? item.title).toLowerCase();
    if (seen.has(key)) problems.push(`duplicate ${name} entry: ${key}`);
    seen.add(key);
  }
}

if (problems.length) {
  console.error("agent-knowledge.json was NOT written. Fix these first:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const feed = {
  schemaVersion: SCHEMA_VERSION,
  generatedAt: new Date().toISOString(),
  projects,
  services,
  skillCategories,
};

await mkdir(path.dirname(OUT_FILE), { recursive: true });
await writeFile(OUT_FILE, JSON.stringify(feed, null, 2) + "\n", "utf8");

console.log(
  `agent-knowledge.json written: ${projects.length} projects, ${services.length} services, ` +
    `${skillCategories.length} skill categories -> ${path.relative(ROOT, OUT_FILE)}`
);
