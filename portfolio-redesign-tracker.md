# Portfolio redesign tracker: leozuze.com

Last updated: 12 Nov 2026 (twelfth update)
Working rule: one step at a time. We only move to the next step after you approve the current one. Full files every time.

---

## 1. Goal and positioning

**Who the site is for:** non-technical business owners first, developers second. It must sell the work, not the tech stack.

**Identity**
- Name: Leo Zuze
- Title (proposed): AI Engineer & Full-Stack Developer
- Status line (proposed): Freelance · Available for new projects
- Hero headline (new): "Custom AI assistants and web apps for your business." (replaces "I build AI that takes work off your plate", which sounded vague and unsure)
- Hero trust row (edit to match what is true): One developer, start to finish / Live projects you can open / Clear scope agreed before work starts

**Services in client language**
1. AI chatbots and assistants
2. AI agents and automation
3. Knowledge assistants (RAG)
4. Data and workflow pipelines
5. Websites and web apps

**Rules for all copy**
- Freelancer voice. No student info anywhere on the site.
- No lists of tech terms in hero or service text. Tech names live only on the Skills page.
- Nothing that looks vibe coded or like a generic AI portfolio.

---

## 2. Design decisions (locked)

| Item | Decision |
|---|---|
| Base | Light cream page with ink-black bands for contrast |
| Palette | Cream #F5F0E6, surface #FFFDF8, border #E2DACA, text #16140F, muted #6A6458, red #C4322B (hover #A32A24), coral #FF7A6B on dark, ink #16140F |
| Font | Plus Jakarta Sans, one family |
| Navbar | Black pill, sliding hover pill, label roll, red active pill, coral "Zuze" (approved) |
| 3D | Only where it adds meaning, never decoration |
| Motion | Framer Motion reveals on view; animate transform and opacity only |

**Reveal rule (all sections and pages):** use `useScrollReveal`, `Reveal`, `WordReveal`, `SplitText`, `WordFade` or the `inView` props. Content shows when it is in view or above the viewport, and hides only while it is below the viewport. Never use `whileInView` with `once` for new work.

**Hard "never" list**
- No dots, no gradients, no glow, no grids, no floating chips
- No pill shapes outside the navbar (footer and hero use squared buttons)
- No scroll animations on border-radius, blur or box-shadow (they cause jank)

**Hero visual language:** solid red circle with the portrait rising above its top edge, sand-colored side panel with fine flowing curved lines, a drawn-in cluster of three red curved flicks beside the headline word, two small info cards. Flat shapes and thin lines only.

**Motion toolkit (`components/motion/`):** `SplitText` (letters or words slide up from a mask), `WordFade` (words fade up in sequence), `Magnetic` (button follows the cursor slightly). All use transform and opacity only and respect reduced motion. Reuse them in every section with the `inView` prop.

**Curve motif system (`components/ui/Curves.jsx`):** `Flicks` (three splayed curved strokes, used once in the hero and once in the marquee header) and `FlowLines` (parallel flowing lines, hero sand panel and marquee band). Both draw in with Framer Motion and respect reduced motion.

**Layout language:** full-bleed ink bands, flat solid shapes, thin rules that draw in, big confident headlines, one red word per headline.

---

## 3. Performance baseline

| Metric (mobile) | 6 Nov | 9 Nov | Goal |
|---|---|---|---|
| Performance score | 38 | 61 | 90+ |
| First Contentful Paint | 2.0 s | 0.9 s | under 1.5 s |
| Largest Contentful Paint | 5.5 s | 0.9 s | under 2.5 s |
| Total Blocking Time | 22,060 ms | 33,430 ms | under 300 ms |
| Speed Index | 23.1 s | 9.0 s | under 3.4 s |
| Cumulative Layout Shift | 0.02 | 0 | keep at 0 |
| Accessibility | 91 | 91 | 95+ |
| Best Practices / SEO | 100 / 100 | 100 / 100 | keep |
| Agentic Browsing | 1/4 | 1/4 | improve |

**Open issues:** render-blocking requests, forced reflow, network dependency tree, image delivery (~155 KiB), unused JavaScript (~235 KiB), main-thread work 41.9 s, 20 long tasks.

**Likely cause of the blocking time and jerky scrolling:** the 3D intro, the 3D portrait and the shader background all run on the main thread. The new hero removes the shader and the heavy scroll-linked effects.

---

## 4. Progress

| # | Step | Status |
|---|---|---|
| 1 | Fonts and colors | Done |
| 2 | Navbar and mobile menu | Done (approved) |
| 3 | Footer | Done: full-bleed ink band, squared buttons, no dots |
| 3b | Smooth scrolling fix (Lenis config and CSS) | Delivered; re-check scroll feel after the hero is in |
| 3c | Footer back-to-top and phone sideways-scroll fix | Delivered again with the hero v2. Awaiting check on a real phone |
| 4 | Hero (lives in `components/home`; photo now comes from `src/lib/heroImage.js`) | Done, pending a phone check: v4 delivered with letter and word text reveals, magnetic button, staggered trust row, scroll-reactive marquee, stronger flow lines with one red accent line. Needs a transparent-background photo for the pop-out effect |
| 5 | Drone removed. Truck intro restyled (3D on desktop only, short name reveal on phones). PageBackground and chat rethemed | Done, pending a check |
| 5b | Home sections: ServicesCarousel, FeaturedProjects (stacked cards, no link shown), SkillsPreview (tabs from `data/skills.js`), CTASection (4-step process plus contact options). Approved 11 Nov, then enriched (v2) with more content and motion | v2 delivered, awaiting check |
| 6 | Home polish pass: `PageSlide` simplified to a plain wrapper (its scale and radius animation caused the scroll drag). Remaining: check spacing between sections | Code delivered, awaiting check |
| 7 | Other pages, polished one by one: Projects (never print the link on a card), Services, Skills, About (no student info), Contact, 404 | Planned |
| 8 | Performance pass: uninstall `three`, `@react-three/fiber`, `@react-three/drei` and `@paper-design/shaders-react` once nothing imports them, remove other unused JS, render-blocking, forced reflow, images | Planned |
| 9 | Accessibility and QA: contrast, ARIA, SVG alt text, reduced motion, responsive, re-run PageSpeed | Planned |
| 9b | `index.html` rebuilt: freelancer title and description, new theme color, new social image (`og-image.jpg`), new favicon and touch icon, real social links in the structured data, no student info | Code delivered |
| 9c | Scroll-aware reveal system (`useScrollReveal`): content animates in going down, resets when you scroll back up past it, content above you stays visible. Applied to home sections, footer and the shared `Reveal`/`WordReveal` | Code delivered, awaiting check |
| 10 | Launch cleanup: remove old vercel domain, sitemap, Search Console | Planned |

**File cleanup (from the hero move)**
- Move `sections/HeroPortrait.jsx` to `home/HeroPortrait.jsx` (rewritten: circle layout, optional cutout, no 3D, no orbit dot)
- Delete `sections/HeroShader.jsx` (only the old hero used it)
- Delete `sections/AvailabilityCard.jsx` only if a project-wide search shows nothing else imports it
- Keep for now, replace at the home backgrounds step: `HomeBackdrop.jsx`, `HomeShader.jsx`, `ReactiveGrain.jsx`, `motifs.jsx` (orange gradients and glow, against the new rules)
- Later: `npm uninstall @paper-design/shaders-react` once `ReactiveGrain` is gone

**Files still needed from you**
- `ChatMarkdown.jsx` (to check it reads well on the light chat panel)
- For step 7, one page at a time: Projects, Services, Skills, About, Contact (and their section components)

**Safe to delete** (search the project first; delete only if nothing else imports it)
- `components/3d/HomeScene.jsx`, `sections/HomeBackdrop.jsx`, `layout/PageShader.jsx`, `ui/Wireframes.jsx`
- `sections/HeroShader.jsx`, `sections/HeroPortrait.jsx` (old), `sections/ReactiveGrain.jsx`, `sections/HomeShader.jsx`, `sections/AvailabilityCard.jsx`
- The old motif files (`sections/motifs.jsx`, the file with `ServicesMotif`/`CtaMotif`), `sections/DeveloperUniverse.jsx`, `ui/Drift.jsx`, `ui/Glow.jsx`
- `sections/ServicesSection.jsx` (old static grid) if the Services page does not use it
- `hooks/useAmbient` if nothing else uses it
- Then run `npm uninstall @paper-design/shaders-react`

**Keep:** `three`, `@react-three/fiber`, `@react-three/drei` (the truck intro, desktop only). `SpinBadge` and `SocialRail` already use the theme tokens.

---

## 5. Open decisions

- [ ] Confirm the title and tagline in section 1
- [x] Drone: removed for good (decided 10 Nov)
- [x] Truck and laptop intro: keep, but professional (cream stage, welcome screen on the laptop). Large screens: truck only (curtain only if the device cannot run 3D). Phones: truck on the first 3 visits, then the 1.9 s name reveal. `MOBILE_TRUCK_VISITS` in `Intro.jsx` sets the number (0 = never on phones)
- [x] 3D portrait dropped: the portrait is now a flat circle layout
- [x] Transparent hero photo: `profile1.jpeg` was already transparent (a PNG with a .jpeg name, 26 MB). Exported as `hero-cutout.webp` (150 KB) and `hero-avatar.webp` (5 KB) in `src/assets/images/`. Do not put the original 26 MB file in the project
- [ ] Square the navbar to match the footer and hero, or keep the pill

---

## 6. Changelog

- 9 Nov 2026: Redesign started. Dark navy palette replaced by light cream, ink and red. Fonts switched to Plus Jakarta Sans. Navbar approved.
- 9 Nov 2026: Footer rebuilt as a full-width ink band with squared buttons and no dots. Lenis smooth scroll reconfigured. New hero delivered: flat layout, text reveal, offset frame portrait, services marquee.

- 9 Nov 2026: Hero moved to `components/home`. HeroPortrait rewritten as a plain image with a light mouse-depth effect. Footer back-to-top moved to the left, away from the chat button, and made more robust. Layout wrapper now clips horizontal overflow to stop sideways dragging on phones.
- 9 Nov 2026: Hero v2: trust-focused headline and a trust row, red circle portrait with optional pop-out cutout, sand side panel, outlined ring and diamond, info cards. Marquee rebuilt as two opposing rows (solid and outlined type) on an ink band with flat shapes. Footer back-to-top made robust and given room above the chat button. Layout wrapper clips horizontal overflow.
- 9 Nov 2026: Hero v3: added `Curves.jsx` with Flicks and FlowLines. Flicks sit beside the red headline word; flow lines run across the sand panel. Marquee gets a header row (rule, label, flicks), faint flow lines and one red circle. Old outlined ring and diamond removed from the hero.
- 10 Nov 2026: Hero v4: added `SplitText`, `WordFade` and `Magnetic` in `components/motion/`. Headline reveals letter by letter and word by word, paragraph fades in by word, trust row draws its rules then rises. Marquee now moves with scroll speed, reverses when scrolling up, pauses on hover and only runs while visible. Flow lines are stronger with one red accent line. The two marquee keyframes in `index.css` are no longer used and can be deleted.
- 10 Nov 2026: Marquee ref-in-render error fixed (ref now updated in an effect). Decision: the drone and the 3D intro are removed for good.
- 10 Nov 2026: Drone and HomeBackdrop removed from Home. Intro rebuilt: truck scene restyled in the cream, ink and red palette with a welcome screen on the laptop (desktop only), 1.9 s name reveal on phones. PageBackground replaced with flat sand panels and flow lines. Chat widget rethemed (ink header, cream panel, no gradients). Home SEO copy updated to freelancer wording.
- 10 Nov 2026: Home sections rebuilt in the new design system. Services: horizontal scroll with a live service counter, flat cards and a closing 'not sure what you need?' card. Projects: stacked sticky cards, all live projects, featured first, no link or host shown on the card. Skills: tabbed panel built from `data/skills.js` (the old chip names no longer matched). CTA: replaced the duplicate footer CTA with a 4-step 'how it works' plus WhatsApp, email and form options.
- 11 Nov 2026: Home sections v2 (nothing removed, more added). Services: cards scale and gain an ink outline as they pass the centre, entrance reveals, mouse tilt, price count-up, clickable service index that jumps to a card. Projects: image parallax, depth shading on stacked cards, staggered detail reveals, Design/Build/Launch tags, progress rail on wide screens. Skills: auto-advancing tabs with a progress line (stops when you interact), skill counts, ghost numeral, hover shifts. How it works: rules fill as you scroll, outlined numerals fill in, and a Common questions accordion. `lib/lenis.js` gained `scrollToY`.
- 11 Nov 2026: PageSlide is now a plain wrapper (was scaling and rounding a huge element, which made scrolling drag between the marquee and Services). Intro rule changed: large screens always get the truck, phones get it for their first 3 visits. HeroPortrait gets a tunable `PERSON_W` and headroom for the pop-out. PageBackground kept for inner pages.
- 11 Nov 2026: Hero photo redone. Cutout exported from `profile1.jpeg`, new `src/lib/heroImage.js` (cutout, avatar, fallback), `HeroPortrait` uses `PERSON_W = 72` so the head rises about 10% above the red circle, and the intro's laptop screen uses the small avatar.
- 12 Nov 2026: `index.html` matched to the new design (new title and description, `theme-color`, social image 1200x630, favicon, apple touch icon, real sameAs links, no student info). New `useScrollReveal` hook; `Reveal`, `WordReveal`, `SplitText`, `WordFade`, `Flicks`, `FlowLines`, the footer and all home sections now reveal on the way down and reset on the way up. Project images get a wipe reveal. Services cards reveal from their horizontal position.