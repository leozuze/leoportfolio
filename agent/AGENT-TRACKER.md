# Portfolio agent tracker: JayZ on leozuze.com

Last updated: 11 Nov 2026 (v2: memory measured, step 1 cleanup)
Working rule: one step at a time. We only move to the next step after you approve the current one. Full files every time.

---

## 1. Goal and positioning

**What the bot is for:** it lives on a freelance portfolio. Its job is to help a visitor understand what Leo offers, trust the work, and start a conversation. It is a sales assistant first, a FAQ second.

**Audience:** non-technical business owners first, developers and recruiters second.

**Identity (must match the website tracker)**
- Name: Leo Zuze
- Title: AI Engineer & Full-Stack Developer
- Status: Freelance, available for new projects

**Voice rules**
- Professional, concise, third person ("Leo", "he").
- No student information anywhere: no university, GPA, scholarship, A-levels, age.
- No talk about his long-term career plans (running a company, leaving freelancing). It works against the freelance pitch.
- Services described in client language. Tech names only when asked or when listing skills.
- Never guess prices, links, availability or technologies. Unknown means "contact Leo" with the WhatsApp link or email.
- Every substantial answer ends with a clear next step (WhatsApp, email, or the relevant project link) when it fits naturally. No pushy closing on every message.

---

## 2. Hard constraints

| Constraint | Value | Consequence |
|---|---|---|
| RAM | Under 512 MB total (Render free) | Target 350 MB peak so there is headroom. One worker, no `--reload`, no Gradio anywhere |
| Disk | Ephemeral on Render free | Nothing written at runtime survives a restart. The index is rebuilt in memory on boot |
| Cold starts | Free instances sleep after about 15 min idle | Sync on startup, plus a keep-alive ping. Check current Render limits before relying on this |
| Groq free tier | 1000 requests/day, 8000 tokens/min (seen in your console) | Per-IP rate limit on the API, small tool schemas, capped history |
| Allowed origins | `https://leozuze.com`, `https://www.leozuze.com`, `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:4173` | Old `leozuzedev.vercel.app` stays only until launch cleanup (website tracker step 10) |
| Secrets | Only in env vars | `GROQ_API_KEY`, `GITHUB_TOKEN`, `ADMIN_TOKEN` |

---

## 3. Architecture decisions (proposed, not yet approved)

| Item | Proposal | Why |
|---|---|---|
| Source of truth for projects, services, skills | The frontend data files (`projects.js`, `services.js`, `skills.js`), exported at build time to `https://leozuze.com/agent-knowledge.json` | The bot can then never say something the website does not say. The md copies have already drifted (section 8) |
| Hand-written knowledge | `identity.md` and `faq-contact.md` stay in `agent/data`, rewritten to the voice rules | Bio and contact change rarely and do not live in the frontend files |
| Retrieval | In-memory, built at startup and after each sync. BM25 first, embeddings only if evals show BM25 is not enough | About 40 chunks. Embedding model, fastembed and ChromaDB are 196 MB of the 432 MB peak (section 4) for no gain at this size |
| Sync | Startup sync, background loop, stale check on request, content hash compare, atomic swap | See section 5 |
| Interval | `SYNC_INTERVAL_HOURS`, default 24, changeable at runtime (3 h, 6 h, ...) | Requirement from Leo |
| GitHub | Five async tools covering the user and all their public organizations | See section 6 |
| Rate limiting | In-memory per-IP sliding window on `/api/chat` and `/api/chat/stream` | Protects the Groq quota from scrapers |
| Framework | Keep LlamaIndex for now. Reconsider only if the measured memory is still too high after the swaps | Rewriting the agent loop is the last resort, not the first |
| Gradio | Removed entirely. The bot is only used through the portfolio chat widget, so `agent/ui/` is deleted | Nothing in production needs it |

---

## 4. Memory budget

**Measured 11 Nov 2026** with `python -m tests.measure_memory` (local Windows, Python process only, no uvicorn request load):

| Stage | RSS | Delta |
|---|---|---|
| python + psutil | 28 MB | +28 |
| fastapi + uvicorn | 54 MB | +26 |
| llama-index-core | 132 MB | +77 |
| llama-index agent workflow | 133 MB | +1 |
| llama-index groq | 165 MB | +32 |
| chromadb import | 203 MB | +38 |
| fastembed import | 233 MB | +30 |
| embedding model loaded | 361 MB | +128 |
| agent + retriever built | 324 MB | -37 |
| after first question | 431 MB | +107 |
| after second question | 432 MB | +1 |

**Peak 432 MB. Budget 512 MB, target under 350 MB.** It fits, but with only 80 MB of headroom, and Render's own process overhead is not in this number.

**Where the memory goes**
- Removable by steps 3 (retrieval swap): chromadb 38 + fastembed 30 + embedding model 128 = about 196 MB, plus part of the 107 MB first-question jump (that jump is mostly the ONNX embedding runtime allocating for inference).
- Not removable without a rewrite: llama-index-core 77 + groq 32 + fastapi/uvicorn 26 + base 28 = about 163 MB.
- Projection after step 3: roughly 230 to 280 MB. This is an estimate until re-measured.

| Stage | RSS after boot | RSS after first chat | Notes |
|---|---|---|---|
| Current stack | 324 MB | 431 MB | Measured, peak 432 MB |
| Gradio removed | same | same | The measure script never imports Gradio, so the baseline already excludes it. Removal only saves install size |
| Chroma replaced by in-memory store | to measure | to measure | Step 3 |
| Embeddings replaced by BM25 (if needed) | to measure | to measure | Step 3 |
| Final on Render | to measure | to measure | Read from the Render metrics tab, step 9 |

Keep `tests/measure_memory.py` in the repo as a dev tool. It is how we re-measure after each step.

---

## 5. Sync design

**Flow**
1. On startup: fetch `agent-knowledge.json`, build the index, serve.
2. Background loop: sleep for the current interval (re-read every cycle so a change applies without restart), then sync.
3. Stale check: if a request arrives and the last successful sync is older than the interval, trigger a background sync. Never block the visitor.
4. A sync fetches the feed, validates it, hashes it, and stops if the hash is unchanged. Otherwise it builds a new index off the event loop and swaps it in with one reference assignment. The old index is garbage collected.
5. If the fetch fails, the JSON is malformed, or it has fewer projects or services than a sanity minimum, keep the old index and log. Never wipe data on a failed sync.

**Endpoints (all admin ones need `Authorization: Bearer ADMIN_TOKEN`)**
- `GET /api/sync/status`: last sync time, last result, content hash, chunk count, current interval
- `POST /api/sync`: force a sync now
- `PUT /api/sync/interval`: set hours (minimum 1). Held in memory, falls back to `SYNC_INTERVAL_HOURS` after a restart. Persisting it properly needs an external store (Supabase) and is a later option

**Why not only an in-process cron:** on Render free the process is asleep most of the time and a timer does not fire while it sleeps. The startup sync plus stale check covers that. An external pinger (cron-job.org or UptimeRobot hitting `/health`, or `POST /api/sync` with the token) also removes cold starts for visitors.

**Feed contract (`agent-knowledge.json`)**
- `projects[]`: title, category, subCategory, tagline, description, url, status, github (repo name), aliases, stack
- `services[]`: id, title, tagline, description, features, price, priceNote
- `skillCategories[]`: title, tagline, skills[] (name, detail)
- `generatedAt`, `schemaVersion`
- Icons, images, `rotate`, `featured` and `cta` are stripped by the export script

**Gap found in the frontend files (step 2):** `projects.js` has no `github`, `aliases` or `stack` fields, and no `status` (every entry is live by design, so the export can set `status: "live"`). The GitHub tools need the repo name to match a project (SkyScout is the repo `Flight-Finder`). Either add `github` and `aliases` to `projects.js`, or keep a small side map used only by the export script. Decide in step 2.

---

## 6. GitHub tools (spec)

Owner allowlist: the configured user, plus the user's public organizations (discovered and cached), plus `GITHUB_EXTRA_ORGS` for orgs whose membership is private. The model cannot query any other account.

| Tool | Purpose |
|---|---|
| `github_overview` | Profile, public organizations, top languages across repos, pinned or most recent repos |
| `list_github_repos(owner, query)` | Paginated public repos for the user or an org, optional keyword filter, forks flagged |
| `get_github_repo("owner/name")` | Description, languages, topics, latest release, last commits, README start (README treated as untrusted data) |
| `read_github_file("owner/name", path)` | One file, size capped (package.json, requirements, docs) |
| `github_recent_activity(owner)` | Recent public pushes and PRs |

Rules: async `httpx` with one shared client, bounded TTL cache (max entries and max bytes), token sent only to api.github.com, clear error text for 403/404/429. Known limit: organization memberships set to private on GitHub are invisible without `GITHUB_EXTRA_ORGS`.

---

## 7. Progress

| # | Step | Status |
|---|---|---|
| 0 | Measure RAM on the current stack | Done (peak 432 MB) |
| 1 | Clean the repo: remove Gradio from requirements, delete `ui/`, delete `apply_fixes*.py`, stop committing `storage/` and caches | In progress (commands below, waiting for your output) |
| 2 | Data contract: export script on the frontend, content conflicts resolved (section 8), identity and FAQ rewritten | Planned |
| 3 | In-memory retrieval replaces Chroma and fastembed. Re-measure RAM | Planned |
| 4 | Sync engine, status and admin endpoints, configurable interval | Planned |
| 5 | GitHub tools rewrite | Planned |
| 6 | System prompt rewrite (professional, freelancer) and eval update | Planned |
| 7 | API hardening: CORS for local and live, rate limit, health, logging | Planned |
| 8 | Frontend wiring: API base URL env for local and live, chat widget and markdown check | Planned |
| 9 | Render deployment: start command, env vars, keep-alive, production memory check | Planned |
| 10 | Optional: lead capture tool (visitor brief sent to Leo by Telegram or email) | Idea |

### Step 1 checklist

1. Search before deleting (nothing should import the files below):
   - `grep -rn "apply_fixes" . --include="*.py" --include="*.md" --include="*.txt" --include="*.toml" --include="*.json" --exclude-dir=.venv --exclude-dir=node_modules`
   - `grep -rniE "gradio|from ui|import ui" . --include="*.py" --include="*.txt" --include="*.md" --exclude-dir=.venv`
2. Delete: `git rm apply_fixes2.py apply_fixes3.py` and `git rm -r ui`
3. Check what is tracked: `git ls-files storage .cache .env`. Expected output is empty. If `storage/` files are listed, run `git rm -r --cached storage`
4. `.gitignore` must contain: `.env`, `storage/`, `.cache/`, `__pycache__/`, `.venv/`
5. `requirements.txt`: remove the `gradio` line (and `psutil` stays out of production, dev only)
6. `pip uninstall gradio -y`, then re-run `python -m tests.measure_memory` and confirm it still works
7. Commit: `chore: remove gradio, ui and one-off patch scripts`

---

## 8. Content conflicts

The three frontend data files (`projects.js`, `services.js`, `skills.js`) hold the current, correct content. The five older md files in `agent/data` are outdated and are replaced in steps 2 and 3.

| Topic | Old agent data | Frontend (truth) | Resolution |
|---|---|---|---|
| Services | 4 areas: Frontend $100, Full-Stack $150, Data & Dashboards $170, AI flexible | 5 services: Chatbots from $150, Agents from $250, Knowledge Assistants from $250, Data & Workflow Automation from $120, Websites & Web Apps from $100 | Use frontend |
| Price wording | "Open to negotiation" | "Fixed quote after a short chat. No surprises." | Use frontend |
| Nexus Lending | Concept, not deployed, no link | Live Vercel URL (`nexus-lending-business.vercel.app`) | Use frontend: live |
| DANN | Not yet public | Live URL (`dannbusiness.vercel.app`) | Use frontend: live, built with a small team |
| SkyScout | "NevuX (SkyScout)", repo Flight-Finder | "SkyScout" only | Public name SkyScout. Keep the repo name `Flight-Finder` as a GitHub mapping only |
| ATO Shield | Listed, in development | Not listed | Leave out (frontend lists only live projects) |
| Portfolio URL | `leozuzedev.vercel.app` | `leozuze.com` | Use `leozuze.com` |
| Forbidden-link guard | `config.FORBIDDEN_IN_CORPUS` blocks `nexus-lending.vercel.app` | The real URL is `nexus-lending-business.vercel.app` | Remove the guard or replace it with the old Vercel portfolio URL |
| Student and career content | Age, university, GPA, scholarship, A-levels, "run his own company" | Not allowed by the voice rules | Delete from `identity.md` |
| Skills | Pandas, MongoDB, Express, JWT, i18next, Cloudinary, etc. | Smaller list of 19 skills in three categories | Use frontend list only. Add anything missing to `skills.js` first, never only to the bot |
| Projects | Talitha Cumi, Jamco, Ritz Marketing not all listed in old md | 6 live projects: DANN, SkyScout, Jamco Builders, Talitha Cumi Accessories, Ritz Marketing, Nexus Lending | Use frontend |

---

## 9. Open decisions

- [x] Is Nexus Lending live or a concept? Is DANN public? Both live (frontend)
- [x] Public name: SkyScout
- [x] Mention ATO Shield: leave out
- [x] Remove age from the bot entirely
- [x] Pricing wording: fixed quote after a short chat
- [x] Gradio: removed entirely
- [ ] Is the portfolio repo public? (decides how the feed is built and served)
- [ ] Retrieval: BM25 first, embeddings only if evals demand it (recommended, still needs your approval at step 3)
- [ ] Keep-alive ping on Render: yes or no
- [ ] Lead capture tool: yes or no
- [ ] Projects feed: add `github` and `aliases` to `projects.js`, or use a side map in the export script

---

## 10. Files

**Received**
- Frontend: `skills.js`, `services.js`, `projects.js`
- Agent: `api/main.py`, `app/agent.py`, `app/config.py`, `app/llm.py`, `app/prompts.py`, `app/retriever.py`, `app/ingest.py`, `app/tools/github.py`, `app/tools/knowledge.py`, the five md files in `agent/data`
- Agent: `tests/measure_memory.py` output

**Still needed from you**
- `agent/requirements.txt` and `agent/.gitignore` (step 1, to return full corrected files)
- `agent/.env.example`
- `agent/tests/run_eval.py` and the shape of `eval_questions.json` (to update the evals with the new data)
- Frontend: the chat widget component, the file that holds the API base URL, `ChatMarkdown.jsx`, `vite.config.js`, `package.json`
- Whether `leozuze.com` deploys from the portfolio repo on Vercel, and whether that repo is public

**Delete in step 1** (after the grep check passes)
- `apply_fixes2.py`, `apply_fixes3.py`
- `ui/` folder
- `gradio` from `requirements.txt`

**Delete in step 3, once the feed replaces them**
- `agent/data/03-projects.md`, `04-services-pricing.md`, `02-skills-expertise.md`
- `storage/chroma` and the Chroma code in `ingest.py` and `retriever.py`

**Keep**
- `tests/` (evals are how we know a change did not break answers), including `measure_memory.py`
- `app/config.py`, `llm.py`, `prompts.py`, `agent.py`, `api/main.py` (all rewritten in later steps, not deleted)
- `.env.example`, `README.md` (updated at step 9)

**Never ingest into the bot:** the website redesign tracker. It holds internal performance numbers and unfinished decisions.

---

## 11. Changelog

- 11 Nov 2026: Agent tracker created. Goals: Render free tier under 512 MB, local and live origins, automatic sync of projects, skills and services with a configurable interval, professional freelancer voice, stronger GitHub tools covering organizations.
- 11 Nov 2026 (v2): Memory measured (peak 432 MB, 196 MB removable). Frontend files confirmed as source of truth, which resolved six open decisions. Gradio and `ui/` dropped. Step 1 checklist added.