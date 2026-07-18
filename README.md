# Leo Zuze AI Fintech Dev & Full Stack Engineer

A modern portfolio showcasing **AI, fintech development, and full-stack engineering** work. Built with React, Vite, and Tailwind CSS, featuring smooth animations, responsive design, and seamless project browsing.

**Live:** [leozuzedev.vercel.app](https://leozuzedev.vercel.app)

---

## What This Is

Leo's professional portfolio — an AI and fintech-focused developer based in Pune, India, specializing in machine learning pipelines, data science, and production-ready web development. The site showcases featured projects, technical skills across AI/data science and full-stack development, and a fast way to get in touch.

### Stack

- **Language(s):** JavaScript (96.9%), HTML (2.5%), CSS (0.6%)
- **Framework / runtime:** React 19 + Vite 8.1 + Tailwind CSS 4.3
- **Notable libraries:**
  - **Framer Motion** — page transitions, scroll animations, staggered layouts
  - **React Router v7** — multi-page navigation (Home, About, Projects, Skills, Contact)
  - **react-icons** — 30+ tech skill icons via SimpleIcons and Lucide
  - **Tailwind CSS (Vite plugin)** — zero-config utility styling with custom theme

---

## How It's Organized

```
leoportfolio/
├── index.html                  # Entry HTML, links to /src/main.jsx
├── vite.config.js              # Vite bundler setup (React + Tailwind plugins)
├── eslint.config.js            # Linter config (ESLint 10.6)
├── package.json                # Dependencies, dev scripts
│
├── public/
│   └── logo.svg                # Favicon & branding
│
└── src/
    ├── main.jsx                # React DOM bootstrap, Router setup
    ├── App.jsx                 # Route definitions (5 pages + shared Layout)
    ├── index.css               # Global styles, Tailwind import, custom theme variables
    │
    ├── assets/                 # Images, media
    │   ├── hero.png & hero.jpeg
    │   ├── logo.png
    │   └── images/
    │       ├── projects/
    │       │   ├── jamco.jpeg           # Jamco Builders project screenshot
    │       │   └── talitha.jpg          # Talitha Cumi Accessories project screenshot
    │       └── heroimg.jpeg             # Leo's portrait (used on Home & About)
    │
    ├── data/                   # Static data, no API calls
    │   ├── projects.js         # Featured & full project list, tech tags
    │   └── skills.js           # Skill categories with icons & descriptions
    │
    ├── hooks/
    │   └── useScrollPosition.js # Custom hook: detects scroll for sticky nav styling
    │
    ├── lib/
    │   └── utils.js            # Reserved for utility functions (currently empty)
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.jsx       # Main route wrapper: Nav + main outlet + Footer
    │   │   ├── Nav.jsx          # Sticky header: logo, nav links, CTA, mobile toggle
    │   │   ├── MobileMenu.jsx   # Slide-out mobile nav (screens < md)
    │   │   └── Footer.jsx       # Footer with social links
    │   │
    │   ├── sections/            # Page-specific sections (Home only)
    │   │   ├── Hero.jsx         # Large intro with staggered animations, CTA buttons
    │   │   ├── FeaturedProjects.jsx # 2 featured projects from data/projects.js
    │   │   ├── SkillsPreview.jsx    # Homepage skill showcase (subset of all skills)
    │   │   ├── CTASection.jsx       # Bottom CTA: "Let's build something"
    │   │   └── SocialRail.jsx       # Sticky social links sidebar
    │   │
    │   └── ui/                  # Reusable, leaf components
    │       ├── Logo.jsx         # Custom SVG logo (rotated square + petals)
    │       ├── Button.jsx        # Reserved (empty)
    │       ├── ProjectCard.jsx   # Reserved (empty)
    │       ├── SectionHeading.jsx # Reserved (empty)
    │       └── Tag.jsx           # Reserved (empty)
    │
    └── pages/                   # Full page components (route destinations)
        ├── Home.jsx             # Landing: Hero + Featured Projects + Skills + CTA + Socials
        ├── About.jsx            # Bio, education, focus areas, portrait, quick facts
        ├── Projects.jsx         # Full project grid, tech filter, rotate animations
        ├── Skills.jsx           # 4 skill categories: AI/Data, Frontend, Backend, Tools
        └── Contact.jsx          # Contact form, email, WhatsApp, social links
```

### How It Fits Together

1. **Route flow:** `main.jsx` → `<BrowserRouter>` → `App.jsx` (routes) → `<Layout>` (Nav + Outlet + Footer)
2. **Page entry:** Each page (Home, About, Projects, Skills, Contact) is a route destination; sections like `<Hero>` and `<FeaturedProjects>` compose into pages via staggered animations.
3. **Data:** Projects and skills live in `src/data/`; components read from these, not from APIs, so adding a project or skill requires only a one-line edit to the data file.
4. **Styling:** Tailwind utility classes + custom CSS variables defined in `src/index.css` (dark theme: `#141416` bg, `#F2621B` orange accent, `#FFC542` yellow accent).
5. **Motion:** Framer Motion wraps sections for entrance animations, scroll-triggered reveals, and hover effects; `useReducedMotion()` respects user accessibility preferences.

---

## How to Run It

### Install & Development

```bash
# Install dependencies
npm install

# Start dev server (hot module reload on save)
npm run dev

# Navigate to http://localhost:5173 in your browser
```

### Build for Production

```bash
# Optimize and bundle
npm run build

# Output: dist/ directory (ready for Vercel deployment)

# Preview production build locally
npm run preview
```

### Linting

```bash
# Check code against ESLint rules
npm run lint
```

### Environment

No secrets or env vars required — this is a static portfolio. Images are self-hosted in `src/assets/` or served from Cloudinary URLs.

---

## Key Features

### 📄 Pages

| Page | Purpose | Key Components |
|------|---------|----------------|
| **Home** | Landing, teaser of projects & skills | Hero, FeaturedProjects, SkillsPreview, CTA, SocialRail |
| **About** | Bio, education, focus areas | Portrait, quick facts, education card, focus area cards |
| **Projects** | Full project grid, filterable by tech | All projects from data/projects.js, tech filter, rotate transforms |
| **Skills** | Categorized skills with details | 4 categories (AI/Data, Frontend, Backend, Tools), 25+ skills |
| **Contact** | Email, WhatsApp, social links | Accessible contact options, icon links |

### 🎨 Design System

- **Colors:** Dark theme with orange (`#F2621B`) and yellow (`#FFC542`) accents
- **Typography:** Inter (body), Geist (headings), Geist Mono (code), Instrument Serif (logo)
- **Spacing:** Tailwind 4.3 defaults (4px base unit)
- **Animations:** Framer Motion staggered slides, hover lifts, scroll-triggered reveals

### ♿ Accessibility

- Semantic HTML markup
- `useReducedMotion()` support (respects `prefers-reduced-motion`)
- Keyboard navigation via React Router NavLink
- Focus-visible rings on interactive elements
- Alt text on images

---

## How to Customize

### ➕ Add a New Project

Edit `src/data/projects.js`:

```javascript
{
  title: "My New Project",
  category: "Category Name",
  tagline: "Short description",
  description: "Longer explanation...",
  image: myProjectImg,  // import at top
  url: "https://...",
  rotate: "-rotate-2",  // or "rotate-2"
  featured: true,       // show on homepage
  tech: ["React", "Tailwind CSS", "..."],  // must match names in skills.js
}
```

The project will appear on `/projects` automatically. If `featured: true`, it also shows on the homepage.

### 🎨 Add a Skill

Edit `src/data/skills.js`:

```javascript
{
  name: "My Skill",
  icon: SiMyIcon,  // import react-icons SimpleIcon
  detail: "What this skill means to me...",
}
```

Add it to the appropriate `skillCategories` object. Any project with this skill in its `tech` array will now show its icon in the Projects page filter.

### 🎭 Update Theme Colors

Edit `src/index.css`:

```css
@theme {
  --color-bg: #141416;
  --color-accent: #F2621B;
  --color-accent-2: #FFC542;
  /* ... other colors ... */
}
```

All Tailwind utility classes dynamically pick these up (e.g., `bg-bg`, `text-accent`).

### 📱 Mobile Menu

`src/components/layout/MobileMenu.jsx` handles responsive navigation. Toggle is in `Nav.jsx`.

---

## Deployment

**Currently deployed on Vercel** (zero-config):

```bash
# Push to GitHub, and Vercel auto-builds & deploys
git push origin main
```

For self-hosting, run `npm run build` and serve `dist/` with any static host.

---

## Try Asking

- **How do I add a new page?** — Create a new `.jsx` file in `src/pages/`, add a `<Route>` entry in `src/App.jsx`, and link it from the Nav.
- **Where are the project images?** — In `src/assets/images/projects/`. Update paths in `src/data/projects.js` if adding new projects.
- **Can I change the animations?** — Yes, edit Framer Motion `variants` in `src/components/sections/*.jsx`. Set `shouldReduceMotion` to `true` to disable all motion on first load.

---

## License

Personal portfolio. © 2026 Leo Zuze.

---

## Contact

- **Email:** Reach out via the Contact page
- **WhatsApp:** [wa.me/919764506058](https://wa.me/919764506058?text=Hi%20Leo%2C%20I%27d%20like%20to%20start%20a%20project.)
- **GitHub:** [leozuze](https://github.com/leozuze)
