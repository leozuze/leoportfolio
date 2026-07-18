import {
  SiPython,
  SiPandas,
  SiNumpy,
  SiScikitlearn,
  SiPlotly,
  SiReact,
  SiJavascript,
  SiHtml5,
  SiCss,
  SiTailwindcss,
  SiShadcnui,
  SiFramer,
  SiExpress,
  SiMongodb,
  SiJsonwebtokens,
  SiJson,
  SiGit,
  SiGithub,
  SiPycharm,
  SiVercel,
  SiRender,
  SiSupabase,
  SiFirebase,
  SiCloudinary,
} from "react-icons/si";
import { Brain, BarChart3, LineChart, Webhook, Code2, Rocket, Globe } from "lucide-react";

// Everything about a skill lives here once — name, icon, and the detail
// copy used on the full Skills page. The homepage preview and the
// Projects page filters both derive from this instead of keeping their
// own copies, so adding a skill here is the only edit needed anywhere.
export const skillCategories = [
  {
    title: "AI & Data Science",
    tagline: "The core of what I do",
    skills: [
      {
        name: "Python",
        icon: SiPython,
        detail: "Primary language for data pipelines, automation, and machine learning models.",
      },
      {
        name: "Pandas",
        icon: SiPandas,
        detail: "Cleaning, transforming, and analyzing structured data for fintech workflows.",
      },
      {
        name: "NumPy",
        icon: SiNumpy,
        detail: "Fast numerical computing underneath most of the data pipeline.",
      },
      {
        name: "Seaborn",
        icon: BarChart3,
        detail: "Statistical visualizations for exploring patterns in financial datasets.",
      },
      {
        name: "Matplotlib",
        icon: LineChart,
        detail: "Custom, low-level plotting when Seaborn's defaults aren't enough.",
      },
      {
        name: "Cufflinks",
        icon: SiPlotly,
        detail: "Interactive Plotly-powered charts generated straight from a DataFrame.",
      },
      {
        name: "Web Scraping",
        icon: Globe,
        detail: "Pulling raw data from live sites and APIs before it ever reaches Pandas.",
      },
      {
        name: "Scikit-learn",
        icon: SiScikitlearn,
        detail: "Building and evaluating classic machine learning models.",
      },
      {
        name: "Model Training",
        icon: Brain,
        detail: "Training, tuning, and validating models against real-world data.",
      },
    ],
  },
  {
    title: "Frontend & UI",
    tagline: "Turning ideas into usable interfaces",
    skills: [
      {
        name: "React",
        icon: SiReact,
        detail: "Component-based UIs for fast, maintainable frontends.",
      },
      {
        name: "JavaScript",
        icon: SiJavascript,
        detail: "Core language behind every interactive piece of the frontend.",
      },
      {
        name: "HTML",
        icon: SiHtml5,
        detail: "Semantic, accessible markup as the foundation of every page.",
      },
      {
        name: "CSS",
        icon: SiCss,
        detail: "Styling fundamentals underneath every Tailwind utility class.",
      },
      {
        name: "Tailwind CSS",
        icon: SiTailwindcss,
        detail: "Utility-first styling for consistent, fast UI development.",
      },
      {
        name: "shadcn/ui",
        icon: SiShadcnui,
        detail: "Accessible component primitives, adapted to fit any design system.",
      },
      {
        name: "Framer Motion",
        icon: SiFramer,
        detail: "Page transitions, hover states, and scroll-triggered animation.",
      },
    ],
  },
  {
    title: "Backend & APIs",
    tagline: "Connecting the frontend to real data",
    skills: [
      {
        name: "Express",
        icon: SiExpress,
        detail: "Lightweight Node.js framework for building REST APIs.",
      },
      {
        name: "MongoDB",
        icon: SiMongodb,
        detail: "Flexible document database for fast-moving app data.",
      },
      {
        name: "REST APIs",
        icon: Webhook,
        detail: "Designing and consuming endpoints that connect frontend to backend.",
      },
      {
        name: "JWT",
        icon: SiJsonwebtokens,
        detail: "Stateless authentication for securing API routes.",
      },
      {
        name: "JSON",
        icon: SiJson,
        detail: "The data format everything above ends up speaking.",
      },
    ],
  },
  {
    title: "Tools & Deployment",
    tagline: "Where the code actually ships",
    skills: [
      {
        name: "Git",
        icon: SiGit,
        detail: "Version control for every project, big or small.",
      },
      {
        name: "GitHub",
        icon: SiGithub,
        detail: "Hosting repos, tracking issues, and shipping through Actions.",
      },
      {
        name: "VS Code",
        icon: Code2,
        detail: "Daily driver editor for both Python and JavaScript work.",
      },
      {
        name: "PyCharm",
        icon: SiPycharm,
        detail: "Dedicated Python IDE for larger data science projects.",
      },
      {
        name: "Antigravity",
        icon: Rocket,
        detail: "Exploring Google's agentic coding environment.",
      },
      {
        name: "Vercel",
        icon: SiVercel,
        detail: "Deploying frontend projects with zero-config CI/CD.",
      },
      {
        name: "Render",
        icon: SiRender,
        detail: "Hosting backend services and APIs in production.",
      },
      {
        name: "Supabase",
        icon: SiSupabase,
        detail: "Postgres-backed backend-as-a-service for auth and data.",
      },
      {
        name: "Firebase",
        icon: SiFirebase,
        detail: "Realtime database and auth for quick full-stack builds.",
      },
      {
        name: "Cloudinary",
        icon: SiCloudinary,
        detail: "Image and media hosting, optimization, and delivery for client sites.",
      },
    ],
  },
];

// Flat name -> icon lookup, derived automatically so it can never drift
// out of sync with skillCategories above.
export const techIcons = Object.fromEntries(
  skillCategories.flatMap((category) => category.skills.map((s) => [s.name, s.icon]))
);

// Flat list of every skill name, for anything that just needs "all of them"
// (e.g. the Projects page tech filter).
export const allSkillNames = skillCategories.flatMap((category) =>
  category.skills.map((s) => s.name)
);