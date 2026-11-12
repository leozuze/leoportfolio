# Portfolio agent tracker: JayZ on leozuze.com

Last updated: 12 Nov 2026 (v3: steps 3 to 5 built and tested, step 6 delivered)
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
- No student information anywhere: no university, GPA, scholarship, A-levels, age. Enforced in three places: the data files, the `FORBIDDEN_IN_CORPUS` build check, and the system prompt.
- No talk about his long-term career plans (running a company, leaving freelancing). It works against the freelance pitch.
- Services described in client language. Tech names only when asked or when listing skills.
- Never guess prices, links, availability or technologies about Leo. Unknown means "contact Leo" with the WhatsApp link or email.
- General knowledge is allowed for conceptual questions (what is an agent, what is RAG), introduced as general and never presented as a promise from Leo.
- Every substantial answer ends with a clear next step (WhatsApp, email, or the relevant project link) when it fits naturally. No pushy closing on every message.

---

## 2. Hard constraints

| Constraint | Value | Consequence |
|---|---|---|
| RAM | Under 512 MB total (Render free) | Target 350 MB peak. Measured 229 MB. One worker, no `--reload`, no Gradio anywhere |
| Disk | Ephemeral on Render free | Nothing written at runtime survives a restart. The index is rebuilt in memory on boot |
| Cold starts | Free instances sleep after about 15 min idle | Sync on startup, stale check on request, optional keep-alive ping. Check current Render limits before relying on this |
| Groq free tier | 1000 requests/day, 8000 tokens/min (seen in your console) | Per-IP rate limit on the API (step 7), small tool schemas, capped history. The eval runner paces itself |
| Allowed origins | `https://leozuze.com`, `https://www.leozuze.com`, `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:4173` | Still the old defaults in `api/main.py`. Replaced in step 7. `leozuzedev.vercel.app` stays only until launch cleanup (website tracker step 10) |
| Secrets | Only in env vars | `GROQ_API_KEY`, `GITHUB_TOKEN`, `ADMIN_TOKEN` |
| Python | Local venv may be 3.14, the uvicorn run used 3.12 | Pin one version on Render (3.12) in step 9 and confirm the local venv matches |

---

## 3. Architecture decisions (implemented)

| Item | Decision | Status |
|---|---|---|
| Source of truth for projects, services, skills | Frontend data files exported to `agent-knowledge.json` (`FEED_SOURCE`, a URL in production or a file path locally) | Built. 32 chunks load locally |
| Hand-written knowledge | `identity.md` and `faq-contact.md` in `agent/data`, split by heading | Built |
| Retrieval | In-memory BM25, hand-written (no new dependency). One chunk per project, service and skill category, plus self-contained overview chunks | Built and tested (step 3) |
| Query-rewriting LLM call | Removed. The agent searches again with different wording | Done |
| Sync | Startup sync, background loop, stale check on request, content hash, sanity minimums, atomic swap | Built (step 4), see section 5 |
| GitHub | Five async tools covering the user and organizations, with an owner allowlist and a hidden-repo list | Built (step 5), see section 6 |
| Rate limiting | In-memory per-IP sliding window on `/api/chat` and `/api/chat/stream` | Planned, step 7 |
| Framework | LlamaIndex kept. Measured memory is well under target, so no rewrite | Decided |
| Gradio | Removed entirely. `agent/ui/` deleted | Done |

---

## 4. Memory budget

**Measured 12 Nov 2026** with `python -m tests.measure_memory` (local Windows, Python process, includes three real questions):

| Stage | RSS | Delta |
|---|---|---|
| python + psutil | 28 MB | +28 |
| fastapi + uvicorn | 55 MB | +27 |
| llama-index-core | 134 MB | +79 |
| llama-index agent workflow | 135 MB | +1 |
| llama-index groq | 167 MB | +31 |
| app modules imported | 168 MB | +2 |
| knowledge index built (32 chunks) | 169 MB | +0 |
| agent built | 170 MB | +1 |
| after first question | 228 MB | +59 |
| after second question and GitHub question | 97 MB then 62 MB | Windows trimmed the working set, not real memory freed |

**Peak working set 229 MB.** Budget 512 MB, target under 350 MB. Roughly 280 MB of headroom, before Render's own process overhead.

| Stage | Peak | Notes |
|---|---|---|
| Original stack (Chroma, fastembed, embedding model) | 432 MB | Measured 11 Nov |
| BM25, sync engine, GitHub tools | 229 MB | Measured 12 Nov. The 200 MB removal estimate held |
| Final on Render | to measure | Read from the Render metrics tab, step 9 |

Windows trims idle working sets, so use the "Peak working set" line, not the later RSS readings. Keep `tests/measure_memory.py` as a dev tool; re-run it after each step.

---

## 5. Sync design (implemented)

**Flow**
1. On startup: fetch `agent-knowledge.json`, build the index, serve. If the feed is down the server still starts, answers say the knowledge is loading, and it retries every 60 seconds.
2. Background loop: checks every 30 seconds whether a sync is due. The interval is re-read each tick, so a change applies without restart.
3. Stale check: each chat request calls `touch()`. If the last good sync is older than the interval, a background sync starts. The visitor never waits.
4. A sync fetches the feed and the md files, hashes the content (ignoring `generatedAt`), and stops if the hash is unchanged. Otherwise it builds a new index off the event loop and swaps it in with one reference assignment.
5. If the fetch fails, the JSON is malformed, forbidden text is found, or the feed has fewer than 3 projects or 3 services (`SYNC_MIN_PROJECTS`, `SYNC_MIN_SERVICES`), the old index is kept and the failure is logged. Failed syncs retry every 60 seconds.

**Endpoints (admin ones need `Authorization: Bearer ADMIN_TOKEN`; without `ADMIN_TOKEN` they return 503)**
- `GET /api/sync/status`: ready, syncing, last attempt and success, last result, content hash, chunk count, interval
- `POST /api/sync`: force a sync now
- `PUT /api/sync/interval`: set hours (1 to 720). Held in memory, falls back to `SYNC_INTERVAL_HOURS` (default 24) after a restart. Persisting it needs an external store (Supabase), a later option
- `GET /health`: `status` and `knowledge_ready`

**Why not only an in-process cron:** on Render free the process is asleep most of the time and a timer does not fire while it sleeps. The startup sync plus stale check covers that. An external pinger (cron-job.org or UptimeRobot on `/health`) also removes cold starts for visitors.

**Feed contract (`agent-knowledge.json`)**
- `projects[]`: title, category, subCategory, tagline, description, url, status, github, aliases, stack (all optional except title; status defaults to live)
- `services[]`: id, title, tagline, description, features, price, priceNote
- `skillCategories[]`: title, tagline, skills[] (name, detail)
- `generatedAt`, `schemaVersion`
- Icons, images, `rotate`, `featured` and `cta` are stripped by the export script

---

## 6. GitHub tools (implemented)

Owner allowlist: the configured user (`GITHUB_USER`), the user's public organizations (discovered, cached one hour), and `GITHUB_EXTRA_ORGS`. The model cannot query any other account. Repositories in `GITHUB_HIDDEN_REPOS` (default `ATO-Shield`) are invisible to every tool, including activity.

| Tool | Purpose |
|---|---|
| `github_overview` | Profile, organizations, top languages, most recently updated repos |
| `list_github_repos(owner, query, page)` | Paginated public repos for the user or an org, keyword filter, forks and archived flagged |
| `get_github_repo(repo)` | Description, languages, topics, latest release, last commits, README start. A bare name is searched across all allowed owners |
| `read_github_file(repo, path)` | One file, size capped, or a folder listing. Blocks `.env`, keys, path traversal |
| `github_recent_activity(owner)` | Recent public pushes, PRs, releases and new repos, limited to allowed owners |

Rules: one shared async `httpx` client, token sent only to api.github.com, parallel calls capped at 4, bounded TTL cache (150 entries, 2 MB), README, file text and PR titles labelled untrusted. Known limit: private organization memberships are invisible without `GITHUB_EXTRA_ORGS`.

**Test run 12 Nov:** all tools, the blocked-owner, blocked-file, path-traversal and missing-repo checks behaved correctly. Findings: `Organizations: none` while activity shows `Team-DANN/DANN` and `Bevoya/bevoya` (private memberships, so extras are needed); `ATO-Shield` was visible (now hidden); `Flight-Finder` reports C++, Cython and C (a venv or compiled files are probably committed).

---

## 7. Progress

| # | Step | Status |
|---|---|---|
| 0 | Measure RAM on the current stack | Done (peak 432 MB) |
| 1 | Clean the repo: remove Gradio, delete `ui/`, delete `apply_fixes*.py`, stop committing `storage/` and caches | Done locally (Gradio is not imported). Confirm `requirements.txt` is trimmed and `storage/` is untracked |
| 2 | Data contract: export script on the frontend, content conflicts resolved, identity and FAQ rewritten | Done (feed loads, 32 chunks). Confirm the `github` field for SkyScout is in the feed |
| 3 | In-memory BM25 replaces Chroma and fastembed | Done and tested in the widget. Peak 229 MB |
| 4 | Sync engine, status and admin endpoints, configurable interval | Built. Run the step 4 tests (live update, broken feed keeps old data, interval) and confirm |
| 5 | GitHub tools rewrite | Done. Follow-up fixes delivered (hidden repos, activity filter) |
| 6 | System prompt rewrite (professional, freelancer) and eval update | Delivered, waiting for the `run_eval` results |
| 7 | API hardening: CORS for local and live, rate limit, health, logging | Planned |
| 8 | Frontend wiring: API base URL env for local and live, chat widget and markdown check, friendly labels for the five GitHub tool names | Planned |
| 9 | Render deployment: start command, env vars, Python version pin, keep-alive, production memory check | Planned |
| 10 | Optional: lead capture tool (visitor brief sent to Leo by Telegram or email) | Idea |

### Step 6 checklist

1. Replace `app/config.py` and `app/tools/github.py`, add `GITHUB_EXTRA_ORGS` and `GITHUB_HIDDEN_REPOS` to `.env`.
2. Replace `app/prompts.py`.
3. Replace `tests/eval_questions.json` and `tests/run_eval.py`.
4. Clear `__pycache__`, run `python -m tests.try_github`, then `python -m tests.run_eval` (about 4 minutes).
5. Fix every failure by changing the prompt or the data, not the test, unless the test is wrong.

---

## 8. Content conflicts (resolved)

The three frontend data files (`projects.js`, `services.js`, `skills.js`) hold the current, correct content. The old agent md files for skills, services and projects are deleted.

| Topic | Old agent data | Frontend (truth) | Resolution |
|---|---|---|---|
| Services | 4 areas: Frontend $100, Full-Stack $150, Data & Dashboards $170, AI flexible | 5 services: Chatbots from $150, Agents from $250, Knowledge Assistants from $250, Data & Workflow Automation from $120, Websites & Web Apps from $100 | Use frontend |
| Price wording | "Open to negotiation" | "Fixed quote after a short chat. No surprises." | Use frontend |
| Nexus Lending | Concept, not deployed, no link | Live Vercel URL (`nexus-lending-business.vercel.app`) | Use frontend: live |
| DANN | Not yet public | Live URL (`dannbusiness.vercel.app`) | Use frontend: live, built with a small team |
| SkyScout | "NevuX (SkyScout)", repo Flight-Finder | "SkyScout" only | Public name SkyScout. Repo name `Flight-Finder` is a GitHub mapping only |
| ATO Shield | Listed, in development | Not listed | Leave out of the knowledge feed and hide the repo from the GitHub tools |
| Portfolio URL | `leozuzedev.vercel.app` | `leozuze.com` | Use `leozuze.com` |
| Forbidden-link guard | Blocked `nexus-lending.vercel.app` | The real URL is `nexus-lending-business.vercel.app` | Guard kept for the old URL and the old portfolio URL, checked at every sync |
| Student and career content | Age, university, GPA, scholarship, A-levels, "run his own company" | Not allowed by the voice rules | Deleted from `identity.md`, blocked by the corpus check and the prompt |
| Skills | Pandas, MongoDB, Express, JWT, i18next, Cloudinary, etc. | Smaller list of 19 skills in three categories | Use frontend list only. Add anything missing to `skills.js` first, never only to the bot |
| Projects | Talitha Cumi, Jamco, Ritz Marketing not all listed in old md | 6 live projects: DANN, SkyScout, Jamco Builders, Talitha Cumi Accessories, Ritz Marketing, Nexus Lending | Use frontend |
| Services overview text | Thin overview made the model write "not listed in detail" | Overview chunk now carries each tagline and price | Fixed in step 3 follow-up, plus a prompt rule against placeholder text |

---

## 9. Open decisions

- [x] Is Nexus Lending live or a concept? Is DANN public? Both live (frontend)
- [x] Public name: SkyScout
- [x] Mention ATO Shield: leave out (knowledge feed and GitHub tools)
- [x] Remove age from the bot entirely
- [x] Pricing wording: fixed quote after a short chat
- [x] Gradio: removed entirely
- [x] Retrieval: BM25 (built, tested, no embeddings needed)
- [x] Is the portfolio repo public? Yes, `leozuze/leoportfolio` is public (seen in the GitHub tools)
- [x] Projects feed: github and aliases handled in the feed or by the bare-name resolver
- [ ] Bevoya: add to `GITHUB_EXTRA_ORGS` so the bot can describe it, or leave it invisible? It is not in the portfolio projects
- [ ] `Team-DANN`: add to `GITHUB_EXTRA_ORGS` (recommended, it holds the live DANN project)
- [ ] Other public repos not in the feed (`Linguacart`, `stock-trading-news-alert`, `leoportfolio`): keep visible or add to `GITHUB_HIDDEN_REPOS`?
- [ ] `Flight-Finder` repo: remove the committed venv or compiled files (`git rm -r --cached server/venv`, add to `.gitignore`) so the bot does not report C++ and Cython
- [ ] Keep-alive ping on Render: yes or no
- [ ] Lead capture tool: yes or no
- [ ] Python version: confirm the local venv, pin 3.12 on Render

---

## 10. Files

**Received and replaced so far**
- Agent: `api/main.py`, `app/agent.py`, `app/config.py`, `app/llm.py`, `app/prompts.py`, `app/retriever.py`, `app/ingest.py`, `app/sync.py` (new), `app/tools/github.py`, `app/tools/knowledge.py`
- Agent tests: `tests/measure_memory.py`, `tests/try_github.py` (new), `tests/run_eval.py` and `tests/eval_questions.json` (new, replace the old ones)
- Frontend: `skills.js`, `services.js`, `projects.js`
- Data: `agent/data/identity.md`, `agent/data/faq-contact.md`

**Still needed from you**
- `agent/requirements.txt` and `agent/.gitignore` (step 1 check, to return full corrected files)
- `agent/.env.example` (to add `ADMIN_TOKEN`, `SYNC_INTERVAL_HOURS`, `GITHUB_EXTRA_ORGS`, `GITHUB_HIDDEN_REPOS`)
- Any old eval questions worth keeping (to merge into `eval_questions.json`)
- Frontend (step 8): the chat widget component, the file that holds the API base URL, `ChatMarkdown.jsx`, `vite.config.js`, `package.json`
- Whether `leozuze.com` deploys from the portfolio repo on Vercel, and the URL the feed will be served from

**Delete or remove**
- `requirements.txt`: `chromadb`, `fastembed`, `llama-index-vector-stores-chroma`, any `llama-index-embeddings-*`, `gradio`; `psutil` stays dev only
- `storage/chroma` and any embedding model cache

**Keep**
- `tests/` (evals are how we know a change did not break answers), including `measure_memory.py` and `try_github.py`
- `.env.example`, `README.md` (updated at step 9)

**Never ingest into the bot:** the website redesign tracker. It holds internal performance numbers and unfinished decisions.

---

## 11. Changelog

- 11 Nov 2026: Agent tracker created. Goals: Render free tier under 512 MB, local and live origins, automatic sync of projects, skills and services with a configurable interval, professional freelancer voice, stronger GitHub tools covering organizations.
- 11 Nov 2026 (v2): Memory measured (peak 432 MB, 196 MB removable). Frontend files confirmed as source of truth, which resolved six open decisions. Gradio and `ui/` dropped. Step 1 checklist added.
- 12 Nov 2026 (v3): BM25 retrieval replaced Chroma and fastembed (peak 229 MB). Overview chunks made self-contained and the prompt told to use general knowledge and never write placeholder text. Sync engine built with admin endpoints. GitHub tools rewritten (five tools, allowlist, cache, hidden repos). Step 5 test run found private org memberships, a visible ATO-Shield repo and a Flight-Finder repo with compiled files. Step 6 prompt, eval questions and eval runner delivered.