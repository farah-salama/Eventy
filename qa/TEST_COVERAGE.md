# Test Coverage — Eventy QA

**Scope:** Playwright tests under `qa/tests/`. Document describes **what automation exercises** and intentional **gaps**.

---

## What is exercised

### By test type

| Type | Location | Scope (summary) |
|------|-----------|----------------|
| Smoke / sanity | `smoke.spec.ts` | Core navigation, homepage, key routes load |
| E2E (UI) | `login.spec.ts`, `register.spec.ts`, `events.spec.ts`, `booking.spec.ts`, `admin.spec.ts` | Forms, authenticated flows, events list/search/filter, bookings, admin panel (serial where configured) |
| API (HTTP) | `api/auth.api.spec.ts` | Login, register, `/me`, validation, auth integration and security-related auth checks |
| API (security) | `api/security.api.spec.ts` | AuthZ, injection-style payloads, IDOR, validation, rate limiting, error disclosure, HTTP/content-type, file upload, tokens |

### By feature area (high level)

- **Authentication:** login, register, `/me`, tokens, negative paths, some security expectations on auth responses  
- **Events (UI):** listing, loading, details entry, search, category filter  
- **Bookings (UI):** guest vs logged-in behavior, book, list, cancel  
- **Admin (UI):** access control, event management actions (serial mode)  
- **Backend (API):** broad security and contract-style checks on REST endpoints used in tests  

### Browsers / projects

Configured in `qa/playwright.config.ts`:

- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **WebKit** (Desktop Safari)

Mobile projects (e.g. Pixel 5, iPhone 12) are not part of the default run.

### Support patterns

- **Page objects:** `qa/tests/pages/` (`LoginPage`, `RegisterPage`, `events`/`booking` pages)  
- **Fixtures:** `qa/tests/fixtures.ts` (`authenticatedPage`, `adminPage`)  
- **`baseURL`:** `http://localhost:3000` — app must be reachable for UI tests  

API tests target `localhost:4000`.

---

## What is **not** covered (identified gaps)

These are limits of the current suite, not judgments on the product:

| Gap | Notes |
|-----|--------|
| **Code coverage (statement/branch)** | Playwright counts **test cases**, not `%` of lines/branches executed. Not reported here by default. |
| **Mobile viewports / devices** | Commented out in config; defaults are desktop browsers only. |
| **Visual regression** | No screenshot baseline suite in-repo for full pages. |
| **Accessibility automation** | No dedicated a11y engine (e.g. axe) wired in. |
| **Performance / load** | No k6/JMeter/etc.; no SLA assertions on response times. |
| **Email / notifications** | Flows involving real email are not exercised. |
| **Password reset / account recovery** | Not present in described specs. |
| **CI as source of truth** | reproducibility depends on manual servers. |

---

## Test statistics — last recorded run

**Total enumerated variants (`--list`):** **348** across **8** spec files — one row per (**test**, **browser project**). Roughly **116** unique `test()` blocks × **three** browsers (Chromium, Firefox, WebKit).

| Metric | Value |
|--------|--------|
| **Date** | 2026-04-29 (local run) |
| **Command** | `npx playwright test` (from `qa/`) |
| **Passed** | **348** |
| **Failed** | **0** |
| **Skipped / did not run** | **0** |
| **Duration** | **~2.6m** |

Pass rate for this run: **100%** (348/348).

**Code coverage %**

- Not measured in this project for line/branch coverage. Playwright results are **functional** pass/fail counts.

---

## Files that define the suite

| File | Role |
|------|------|
| `qa/playwright.config.ts` | Projects, browsers, `baseURL`, reporters |
| `qa/tests/smoke.spec.ts` | Smoke |
| `qa/tests/login.spec.ts` | Login E2E |
| `qa/tests/register.spec.ts` | Registration E2E |
| `qa/tests/events.spec.ts` | Events UI |
| `qa/tests/booking.spec.ts` | Bookings UI |
| `qa/tests/admin.spec.ts` | Admin UI |
| `qa/tests/api/auth.api.spec.ts` | Auth API |
| `qa/tests/api/security.api.spec.ts` | Security-focused API |
