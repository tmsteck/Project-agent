# ⚛ Research OS

A personal research project tracker with an AI agent for PhD students.
Built with React + Vite, stores data in Supabase, deploys to GitHub Pages.

The agent can now generate full project entries from semi-formal descriptions and can edit existing project/task text directly through structured mutations.

---

## Stack

- **Frontend**: React 18 + Vite (no TypeScript, keep it simple)
- **Storage**: Supabase (Postgres) — your data lives in a private table
- **AI Agent**: Anthropic API (Claude Sonnet), browser mode is disabled by default
- **Hosting**: GitHub Pages via GitHub Actions

---

## Setup (one-time, ~15 minutes)

### 1. Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account + new project.
2. Once your project is ready, open the **SQL Editor** and run this:

```sql
create table store (
  key  text primary key,
  value jsonb not null
);

alter table store enable row level security;

-- Minimal hardening: only allow the one app key we actually use.
create policy "read projects only" on store
  for select using (key = 'projects');

create policy "insert projects only" on store
  for insert with check (key = 'projects');

create policy "update projects only" on store
  for update using (key = 'projects') with check (key = 'projects');
```

3. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public key** (long JWT string)

### 2. Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key. Give it a name like "research-os".
3. Copy it — you only see it once.

> **Cost note**: Claude Sonnet is ~$3/$15 per million tokens in/out.
> A typical check-in uses ~1–2k tokens. At a few check-ins/day you're
> looking at well under $1/month.

### 3. GitHub repo

```bash
# Clone or fork this repo, then:
git init
git add .
git commit -m "initial commit"
git remote add origin git@github.com:YOUR_USERNAME/research-os.git
git push -u origin main
```

### 4. GitHub Secrets (keeps keys out of the repo)

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret name              | Value                        |
|--------------------------|------------------------------|
| `VITE_SUPABASE_URL`      | Your Supabase project URL    |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key       |
| `VITE_ENABLE_INSECURE_BROWSER_AGENT` | `false` (recommended) or `true` (private/testing only) |
| `VITE_ANTHROPIC_API_KEY` | Your Anthropic API key (only if browser agent mode is enabled) |

### 5. Enable GitHub Pages

In your repo: **Settings → Pages**
- Source: **GitHub Actions**
- Save

### 6. Deploy

Push any commit to `main` and the GitHub Action will build + deploy automatically.
First deploy takes ~2 minutes. After that, check:

```
https://YOUR_USERNAME.github.io/research-os/
```

Or your custom domain if you've set that up in Pages settings.

---

## Custom domain

If you have a custom domain set up on GitHub Pages already:
1. In GitHub: Settings → Pages → Custom domain → enter your domain
2. In `vite.config.js`, make sure `base` is `'/'`
3. Push to trigger a redeploy

---

## Local development

```bash
# Install dependencies
npm install

# Copy env template and fill in your values
cp .env.example .env.local
# Edit .env.local with your Supabase URL + anon key.
# Keep browser agent disabled (`VITE_ENABLE_INSECURE_BROWSER_AGENT=false`) for public deployments.
# Only set `VITE_ANTHROPIC_API_KEY` if you intentionally enable insecure browser mode.

# Start dev server
npm run dev
```

### Direct editing + flexible agent updates

- In the **Tasks** view, you can directly:
  - edit project name/summary text
  - edit task text inline
  - add activity log notes
- In **All Projects Agent** mode, you can ask for semi-formal planning input to be turned into:
  - new projects
  - new tasks
  - rewritten existing project/task text

---

## Security notes

- **Password gate**: Set `VITE_APP_PASSWORD` in your GitHub Actions secrets (and
  local `.env`) to enable a password prompt at startup. The session is remembered
  for the current browser tab (via `sessionStorage`) so you won't be asked again
  until you open a new tab or restart the browser. Leave the variable blank to
  disable auth entirely (useful during local development).
  > **Note**: because this is a Vite/React SPA, the password is baked into the
  > built JS bundle. A determined person who downloads your GitHub Pages files
  > can read it. For a personal-use app this is fine; don't reuse a sensitive
  > password here.
- The Supabase **anon key** is safe to expose — it's designed to be public.
  Row-level security controls what it can do. The SQL above only allows access
  to the `projects` key instead of full-table access.
- Browser agent mode is now **disabled by default**. This avoids shipping your
  Anthropic API key to every visitor.
- If you set `VITE_ENABLE_INSECURE_BROWSER_AGENT=true`, your Anthropic API key
  will be bundled into client JS and can be extracted by anyone. Only do this
  for private/testing deployments.
- For a public site, call Anthropic from a backend/edge proxy instead.
- The GitHub Actions secrets are **never** in the repo — they're injected at
  build time only.

---

## File structure

```
research-os/
├── .github/workflows/deploy.yml   # Auto-deploy on push to main
├── src/
│   ├── lib/
│   │   ├── supabase.js            # DB client + load/save helpers
│   │   ├── agent.js               # Anthropic API caller + mutation logic
│   │   └── utils.js               # Shared constants and helpers
│   ├── components/
│   │   ├── Sidebar.jsx            # Project list + navigation
│   │   ├── ProjectPanel.jsx       # Tasks, summary, activity log
│   │   ├── AgentChat.jsx          # Check-in chat interface
│   │   ├── StatusBadge.jsx        # Active/Stalled/Blocked/Done pill
│   │   └── TodoItem.jsx           # Individual task row
│   ├── App.jsx                    # Root component, state, routing
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles + animations
├── index.html
├── vite.config.js
├── package.json
└── .env.example                   # Template — copy to .env.local
```
