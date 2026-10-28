# WaterWise — Water Conservation Tracker

A beginner-friendly full-stack web app for recording estimated water use, reviewing daily and weekly totals, and building water-saving habits. It uses HTML, CSS, Vanilla JavaScript, Node.js, Express, and Supabase PostgreSQL.

## 1. Problem and objectives
Water is often wasted because people do not notice how much daily activities use. WaterWise makes estimated use visible, helps users compare daily use with a target, and keeps a simple history of activities.

## 2. Users and features
This MVP is a **shared demo tracker with no accounts**. Anyone with access to the running app can see, add, and delete records and change the shared daily target. Do not enter personal or sensitive information.
- Record date, activity, litres, and an optional note.
- Dashboard with today's total, last seven days, record count, progress against a configurable daily goal, and a seven-day chart.
- Search notes/activities, filter by activity, and delete an entry after confirmation.
- Server-side validation, JSON API, rate limiting, security headers, and PostgreSQL constraints/RLS.
- No fake demo records are inserted.

## 3. Technology and architecture
- Frontend: HTML5, CSS3, Vanilla JavaScript (`frontend/`)
- Backend: Node.js + Express (`backend/`)
- Database: Supabase PostgreSQL (`database/schema.sql`)
- The browser calls Express `/api/...`; Express uses the Supabase JS client with the project's publishable/anon key. The browser never talks to Supabase directly.
- RLS is enabled. Policies intentionally allow anonymous shared-demo access. These policies are **not suitable for private/production data**.

## 4. Folder structure
```text
water-conservation-tracker/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── routes/
│   │   ├── entries.js
│   │   ├── settings.js
│   │   └── summary.js
│   ├── middleware/
│   │   └── errors.js
│   ├── utils/
│   │   └── validation.js
│   ├── server.js
│   ├── supabase.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── .gitignore
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

## 5. Prerequisites
Install:
- [Node.js LTS (npm included)](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)
- [Visual Studio Code](https://code.visualstudio.com/)
- A free [Supabase](https://supabase.com/) account

Node.js 20 or newer is required.

## 6. Setup from an empty folder

### Step 1 — Open the project
Create/open `water-conservation-tracker` in VS Code. Create the folders/files in the tree above and paste in the provided source. The terminal should be at the root folder. In VS Code: **Terminal → New Terminal**.

Verify installations:
```bash
node --version
npm --version
git --version
```
Each command should print a version. If not, install the software and reopen the terminal.

### Step 2 — Create a Supabase project
1. Sign in to Supabase and create a new project.
2. Choose a project name and a strong database password; keep the password private.
3. Wait for the database to finish provisioning.
4. In **Project Settings → API** (wording can vary), copy the Project URL and the publishable key, or legacy anon key. Do not use a service-role/secret key.

### Step 3 — Create the tables
1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the complete contents of `database/schema.sql`.
3. Click **Run**.
4. Open **Table Editor** and verify `water_entries` and `app_settings` exist. `app_settings` should have one row with ID `1` and target `150`.

### Step 4 — Configure the environment
Open `backend/.env`. Replace the two placeholder values:
```dotenv
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```
Use your actual URL/key from your own Supabase project. `.env` is local and ignored by Git. `.env.example` documents the variable names and contains placeholders only. Never put database passwords or service-role keys in frontend files or commit secrets.

### Step 5 — Install packages
From the **backend** directory:
```bash
cd backend
npm install
npm run check
```
`npm install` downloads the required packages and creates `package-lock.json`. `npm run check` checks JavaScript syntax. Expected: no syntax errors.

### Step 6 — Start the app
Still in `backend`:
```bash
npm start
```
Expected terminal message: `WaterWise running at http://localhost:3000`. Open [http://localhost:3000](http://localhost:3000). Keep the terminal running while using the app. Stop the server with Ctrl+C.

Check database connectivity at [http://localhost:3000/api/health](http://localhost:3000/api/health). Success response:
```json
{"status":"ok","database":"connected"}
```

## 7. API reference
All API responses use JSON. No authentication is implemented because this is a shared classroom demo; access is intentionally public.

| Method | Path | Purpose | Body / permissions | Success |
|---|---|---|---|---|
| GET | `/api/health` | Check app and DB | No body; public | `200 { "status":"ok","database":"connected" }` |
| GET | `/api/entries` | List up to 500 recent entries | Public | `200 { "data":[...] }` |
| POST | `/api/entries` | Add a water record | `activity`, `litres`, `entry_date`, optional `note`; public | `201 { "data":{...} }` |
| DELETE | `/api/entries/:id` | Delete an entry | UUID path; public | `200 { "data":{"id":"..."}}` |
| GET | `/api/summary` | Today's/7-day totals and chart series | Public | `200 { "data":{"todayLitres":0,"weekLitres":0,"totalEntries":0,"daily":[...]}}` |
| GET | `/api/settings` | Read shared daily goal | Public | `200 { "data":{"daily_goal_litres":150}}` |
| PUT | `/api/settings` | Update shared daily goal | `{"daily_goal_litres":150}`; public | `200 { "data":{"daily_goal_litres":150}}` |

Validation failures return `400` with `{ "error":"..." }`; missing records return `404`; database/server errors return a generic `500`/`503` message. The app applies a rate limit to `/api` requests.

### Example API requests
```bash
curl http://localhost:3000/api/entries
curl -X POST http://localhost:3000/api/entries -H "Content-Type: application/json" -d "{\"activity\":\"Shower\",\"litres\":35,\"entry_date\":\"2026-01-15\",\"note\":\"Quick shower\"}"
```
Use a date that is not in the future relative to your current date.

## 8. How to use
1. Open the app and set a daily target (litres) using **Save**.
2. Under **Log water use**, select an activity, enter estimated litres, choose a date, and optionally add a note.
3. Save. Dashboard totals and the chart update from database data.
4. Search or filter records in Water history. Delete only after confirming the prompt.

## 9. Testing checklist
- Open `/api/health`: expect `200` and `database: connected`.
- Add a valid activity: expect success message and a new history row.
- Refresh the browser: row remains because it is in PostgreSQL.
- Enter `0`, a negative value, or over `100000` litres: expect a validation error.
- Leave activity blank or enter an invalid date: expect an error.
- Try a future date: expect rejection.
- Set daily target to `0` or `100001`: expect rejection; valid target updates the progress display.
- Search for a note/activity and choose an activity filter: rows should narrow.
- Cancel delete confirmation: record remains. Confirm delete: record disappears.
- Clear all entries in Supabase: dashboard shows zero totals and history shows an empty state.
- Resize browser to phone width: layout should become single-column and remain usable.
- Stop Supabase connectivity or temporarily use a wrong key: API should show a friendly error; restore credentials afterward.

Run syntax checks from `backend/`:
```bash
npm run check
```
This is a syntax check, not a live integration test. The database and browser flow must be tested with your own Supabase project.

## 10. Security and limitations
- This is a **public shared classroom MVP**, not a private multi-user product. Anyone who can reach it can view/delete entries and change the goal. Do not publish it as-is with private data.
- RLS is enabled, but anonymous policies intentionally permit demo access. For a production version, add Supabase Auth, ownership columns, policies tied to `auth.uid()`, verified access tokens, and authorization tests.
- Use only the Supabase publishable/anon key in this version. It is designed for public client access and is still constrained by RLS. Never use a service-role key in this project.
- Water values are estimates, not measured consumption. No smart-meter integration, user accounts, private dashboards, exports, or automated reminders are included.

## 11. Troubleshooting
- **Server says credentials missing:** replace placeholders in `backend/.env`; restart the server.
- **`Invalid API key` or health check returns 503:** verify the Project URL and publishable/anon key belong to the same project.
- **Table not found / settings error:** run `database/schema.sql` in the correct Supabase project's SQL Editor.
- **`npm` or `node` not recognized:** install Node.js LTS and reopen VS Code/terminal.
- **Port in use:** change `PORT=3001` in `.env`, restart, and open `http://localhost:3001`.
- **No CSS or JS:** make sure files are under `frontend/` with exact filenames; reload with Ctrl+F5.
- **Changes do not appear:** check the terminal for errors and the browser DevTools Console/Network tabs.
- **SQL policy error:** run the entire schema as a Supabase project owner using SQL Editor.

## 12. GitHub upload
From the **root** project directory:
```bash
git init
git status
git add .
git status
git commit -m "Build project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```
Create an empty repository on GitHub first, then replace `YOUR_GITHUB_REPOSITORY_URL` with its actual HTTPS or SSH URL. If Git asks for identity, configure it with your own name/email:
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```
Before committing, inspect `git status` and confirm `backend/.env`, `node_modules/`, personal information, and database exports are not staged. `.env.example` should be staged. If a secret was ever committed, `.gitignore` does not erase it: rotate the credential immediately and clean repository history as needed.

## 13. Learning map
- HTML defines the sections and forms.
- CSS creates the layout, colors, responsive behavior, and charts.
- Browser JavaScript uses `fetch()` to call the API and safely renders data.
- Express validates requests and exposes REST endpoints.
- Supabase PostgreSQL stores records persistently and enforces constraints/RLS.
- Git records project history; GitHub hosts the repository.
