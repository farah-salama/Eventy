# Continuous integration (GitHub Actions)

This project includes [`.github/workflows/playwright-ci.yml`](../.github/workflows/playwright-ci.yml), which runs Playwright on **push** and **pull request** targeting branch **`main`**.

## What the workflow does

1. Starts **MongoDB 7** as a GitHub **service container** on `127.0.0.1:27017`.
2. Installs **backend** dependencies, creates `backend/uploads`, runs [`backend/scripts/createAdmin.js`](../backend/scripts/createAdmin.js) to ensure `admin@eventy.com` exists.
3. Starts the **Express** API on **`http://127.0.0.1:4000`** with `MONGO_URI`, `JWT_SECRET`, and `PORT` (must match `qa` API tests).
4. After the API responds, **logs in as admin** (`POST /api/auth/login`) and creates **two events** via `POST /api/events` (`CI Event One`, `CI Event Two`) so browse/search/book flows have seeded data.
5. **Registers** `new@eventy.com` via `/api/auth/register` (idempotent if registration was already run).
6. **Builds** the **React** app with `REACT_APP_API_URL=http://127.0.0.1:4000`, then serves the **`build/`** folder on port **3000** with `serve`.
7. Runs **`npx playwright test --project chromium`** from `qa/` (Chromium only by default to keep CI fast and stable).

On every run, the **Playwright HTML report** is uploaded as an **artifact** (`playwright-report`). If something fails, backend and frontend logs may be uploaded as artifacts.


## Troubleshooting

| Symptom | Thing to check |
|---------|----------------|
| Workflow never appears | Wrong branch name; Actions disabled; YAML not pushed. |
| Backend step fails | Open **backend-ci** artifact; confirm Mongo reachable; mongoose connection string. |
| Frontend step fails | **frontend-ci** log; `npm run build` often fails on ESLint warnings if `CI=true` treats warnings as errors in some setups — check CRA build output. |
| Playwright fails only in CI | Download **playwright-report**; compare timeouts; increase wait or retries in `qa/playwright.config.ts` (`retries` already bumps when `CI=true`). |
