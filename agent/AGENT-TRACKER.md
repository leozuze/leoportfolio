# JayZ Portfolio Assistant: Project Tracker

**Last updated:** Thursday, 12 November 2026
**Backend:** `https://jayz-agent.onrender.com` (live)
**Status:** Backend deployed, frontend wired, chat working locally and in production.

---

## Done

### Backend (`agent/`)
- FastAPI app with JSON chat (`/api/chat`) and NDJSON streaming chat (`/api/chat/stream`)
- Rate limiting in `app/ratelimit.py`: per client (per minute, per hour) and global (per minute, per day)
- Concurrent chat slots with a queue timeout
- `Retry-After` header on 429 and busy 503 responses
- Request logging (path, status, timing, hashed client ID; never message content)
- Root route `/` and `/health`
- Admin routes protected by `ADMIN_TOKEN`: `/api/sync`, `/api/sync/status`, `/api/sync/interval`, `/api/debug/ip`
- CORS limited to `FRONTEND_ORIGINS`
- Streaming `answer` events throttled; the `final` event always carries the full text

### Deployment
- Deployed on Render
- `render.yaml` needs no change
- Proxy IP handling verified: `client_used_for_limits` returned my real public IP, so first-entry `X-Forwarded-For` logic is correct

### Quality checks
- **Spacing probe:** 8/8 exact (4 streaming, 4 non-streaming). The backend is not dropping spaces.
- **Eval:** full `run_eval` results skipped by decision (output too long, results acceptable)

### Frontend
- Step 8 complete: `src/lib/chatApi.js` plus `VITE_AGENT_URL` pointing at Render
- Chat widget works locally and in production
- `PortfolioChat.jsx`, `ChatMarkdown.jsx`, `vite.config.js` and `package.json` unchanged

### Decisions made
- `Linguacart`, `stock-trading-news-alert` and `leoportfolio` stay visible

### Test results so far
| Test | Result |
|---|---|
| 8-call loop (local) | `200 200 200 200 200 200 429 429` (pass) |
| `/` returns JSON | Pass |
| Streaming | One `status`, throttled `answer` events, one full `final` (pass) |
| Render `/api/debug/ip` | Real public IP (pass) |

---

## Still open

| # | Item | Notes |
|---|---|---|
| 1 | Decide `Team-DANN` and `Bevoya` in `GITHUB_EXTRA_ORGS` | Private memberships. Only shown if listed in the Render dashboard, comma separated. |
| 2 | Rotate `ADMIN_TOKEN` | The token appeared in terminal output. Change it in Render and redeploy. |
| 3 | Run the 8-call loop against Render | Confirms limits hold in production. Expect `200 x6, 429 x2`. |
| 4 | Confirm `Retry-After` on a 429 | Run the loop, then immediately `curl -i` once more. |
| 5 | Browser checks | Stop button, offline message, rate-limit message in chat, phone-sized viewport. |
| 6 | Production build check | `npm run build && npm run preview`, then test once more. |
| 7 | Confirm `VITE_AGENT_URL` on the frontend host | Likely done since production works. |
| 8 | CORS check from the live site | Confirm no CORS errors on `https://leozuze.com` and `https://www.leozuze.com`. |

---

## Next steps (in order)

1. Rotate `ADMIN_TOKEN` on Render.
2. Decide on `Team-DANN` and `Bevoya`; if yes, set `GITHUB_EXTRA_ORGS=Team-DANN,Bevoya` in Render.
3. Run the 8-call loop against Render.
4. Run the browser checks (item 5) and the production build check (item 6).
5. Optional: set up an uptime pinger and tune limits (below).

---

## Testing steps (reference)

Clear `__pycache__` first, run from `agent` with the venv active.

### 1. Local backend
```bash
python -m uvicorn api.main:app --port 8000
URL=http://localhost:8000
for i in 1 2 3 4 5 6 7 8; do curl -s -o /dev/null -w "%{http_code} " -X POST $URL/api/chat -H "Content-Type: application/json" -d '{"message":"hi"}'; done; echo
```
- Expect `200 x6, 429 x2`; about 60 seconds later one call works again.
- `curl -i` on a 429 shows `Retry-After`.
- `curl -i $URL/` returns 200 JSON.
- Log shows `POST /api/chat -> 200 in X.XXs client=xxxxxxxx` and `Rate limited (client_minute)`.

### 2. Streaming
```bash
curl -N -X POST $URL/api/chat/stream -H "Content-Type: application/json" -d '{"message":"hi"}'
```
Few `answer` lines and one full `final` line.

### 3. Render
```bash
URL=https://jayz-agent.onrender.com
curl -s $URL/api/debug/ip -H "Authorization: Bearer YOUR_TOKEN"
```
`client_used_for_limits` should be your public IP, not `10.x.x.x`. Then repeat the 8-call loop against Render.

### 4. CORS
From the browser console on `http://localhost:5173` (and on the live site):
```js
fetch("https://jayz-agent.onrender.com/health").then(r => r.json()).then(console.log)
```
Should return `{status: "ok", ...}`. If blocked, check `FRONTEND_ORIGINS` in Render.

### 5. Frontend
- Open the chat, click a suggestion, and confirm the status changes, the tool chip appears, text streams in and the final answer has correct spacing.
- Click Stop mid-answer: "Response stopped" and a working "Try again".
- Send 7 messages in under a minute: the rate-limit message appears in the chat.
- Switch off the network, send a message: "Couldn't reach JayZ".
- Repeat on a phone-sized viewport.
- `npm run build && npm run preview` and test again, since the production build uses the baked-in env var.

---

## Config reference (Render dashboard, all optional)

| Variable | Default | Purpose |
|---|---|---|
| `RATE_LIMIT_PER_MINUTE` | 6 | Per visitor, per minute |
| `RATE_LIMIT_PER_HOUR` | 40 | Per visitor, per hour |
| `GLOBAL_PER_MINUTE` | 12 | All visitors, per minute |
| `GLOBAL_PER_DAY` | 250 | All visitors, per day (protects the Groq free tier) |
| `MAX_CONCURRENT_CHATS` | 2 | Simultaneous chats |
| `FRONTEND_ORIGINS` | leozuze.com, www, localhost | Allowed browser origins |
| `ADMIN_TOKEN` | none | Enables admin routes |
| `GITHUB_EXTRA_ORGS` | none | Private-membership orgs to include |
| `GITHUB_HIDDEN_REPOS` | `ATO-Shield` | Repos the bot never shows |

---

## Optional later
- Free uptime pinger hitting `/health` every 10 minutes to avoid Render's 30-60 second cold start (uses more free instance hours).
- Tune rate limits once real traffic shows up.
- If you ever see missing spaces in the UI, look at the client: stream decoding is the likely cause, and the current `chatApi.js` handles it correctly.