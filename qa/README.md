# Eventy — QA (Playwright)

This directory contains automated **end-to-end (UI)** and **API** tests for the Eventy stack using [Playwright Test](https://playwright.dev/). Tests are written in TypeScript under `tests/`; the HTML reporter is enabled in `playwright.config.ts` for review after runs.

---

## Prerequisites

- **Node.js** and **npm** (versions compatible with `@playwright/test` in `package.json`).
- **Browsers** installed for Playwright (once per machine):

  ```bash
  npx playwright install
  ```

  On Linux CI agents, `npx playwright install --with-deps` is often used to pull OS dependencies.

---

## Setup

From the repository root:

```bash
cd qa
npm install
```

---

## Application under test

The suite does **not** start the Eventy servers for you. Both must be reachable or tests will fail (e.g. timeouts, `ECONNREFUSED`).

| Service | URL expected by tests | Notes |
|--------|----------------------|--------|
| **Frontend** | `http://localhost:3000` | Set in `playwright.config.ts` as `baseURL`. Start from `frontend/` (e.g. `npm start`; see [frontend/README.md](../frontend/README.md)). |
| **Backend API** | `http://localhost:4000/api` | Used by `tests/api/*.spec.ts` via `API_URL`. Ensure your Express app listens on **port 4000** or change `API_URL` in those files to match [`backend/.env`](../backend/.env) `PORT`. |

For local UI flows, point the frontend at the same backend the tests use (e.g. `REACT_APP_API_URL=http://localhost:4000` in `frontend/.env` when testing against a local API).

---

## Test data prerequisites (user accounts)

Several tests assume **existing users** in MongoDB **before** you run the suite. Credentials are fixed in code; if you use different users, update [tests/fixtures.ts](tests/fixtures.ts) and [tests/api/auth.api.spec.ts](tests/api/auth.api.spec.ts) / [tests/api/security.api.spec.ts](tests/api/security.api.spec.ts) accordingly.

| Role | Email | Password | Purpose |
|------|--------|----------|---------|
| Regular user | `new@eventy.com` | `newAcc123` | `authenticatedPage` fixture and many API tests (`USER_CREDENTIALS`). |
| Admin | `admin@eventy.com` | `admin123` | **Must have admin role** in the user model. Used by `adminPage`, admin UI specs, and API tests that authenticate with `ADMIN_CREDENTIALS`. |

If these accounts are missing or the admin user is not an admin, you may see failures such as staying on `/login` after submit or **401** on protected API calls. That is expected when data does not match test expectations.

---

## Running tests

Commands are run from the `qa/` directory. There are no npm `test` scripts in [package.json](package.json); use `npx` directly.

```bash
npx playwright test
```

Run a single file or pattern:

```bash
npx playwright test tests/login.spec.ts
npx playwright test tests/api/auth.api.spec.ts
```

Run one browser project only:

```bash
npx playwright test --project=chromium
```

Debug and listing:

```bash
npx playwright test --headed
npx playwright test --debug
npx playwright test --list
```

Open the last HTML report:

```bash
npx playwright show-report
```

A full run executes **348** test variants (roughly 116 logical tests × Chromium, Firefox, and WebKit), unless you narrow projects or files.

---

## Architecture overview

```
qa/
├── playwright.config.ts     # testDir, baseURL, reporters, browser projects
├── tests/
│   ├── fixtures.ts           # extended test with authenticatedPage, adminPage
│   ├── *.spec.ts             # E2E UI (smoke, login, register, events, booking, admin)
│   ├── api/
│   │   ├── auth.api.spec.ts
│   │   └── security.api.spec.ts
│   └── pages/                  # Page objects (LoginPage, RegisterPage, …)
```

- **Browsers:** Chromium, Firefox, WebKit (desktop) are defined as separate **projects** in `playwright.config.ts`.
- **`fullyParallel: false`:** test files are serialized per Playwright’s semantics; workers still parallelize where allowed. Some specs use `test.describe.configure({ mode: 'serial' })` for ordering-sensitive cases.
- **`baseURL`:** relative navigations like `page.goto('/login')` resolve against `http://localhost:3000`.

---

## GitHub Actions (CI)

Pushes and pull requests to **`main`** or **`master`** run [.github/workflows/playwright-ci.yml](.github/workflows/playwright-ci.yml): MongoDB, seeded users, backend on port **4000**, production build of the frontend on **3000**, then **`npx playwright test --project chromium`**.

---

## Related documentation

| Document | Purpose |
|----------|---------|
| [BUG_REPORT.md](BUG_REPORT.md) | Bugs found and fixes applied during QA work on this project. |
| [TEST_COVERAGE.md](TEST_COVERAGE.md) | What the suite covers, known gaps, and a snapshot of a full pass. |

---
