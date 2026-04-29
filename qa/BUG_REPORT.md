# Bug Report: Eventy

**Period:** April 2026  
**Scope:** Automated E2E and API regression (Playwright, TypeScript) against the Eventy frontend and REST API.

---

## Executive Summary

Issues found clustered around **input validation**, **consistent HTTP statuses**, **information leakage on errors**, and **display of user-supplied strings**. Critical and high‑severity defects were corrected in `backend/` and stabilized in `qa/tests/` (page objects, waits for async UI). All seven items below are **resolved**.

**Counts**

| Metric | Value |
|--------|------|
| Issues documented below | **7** |
| Fixed | **7** |
| Open | **0** |

**Severity distribution:** Critical **1**, High **4**, Medium **1**, Low **1**.

---

## Summary Table

| ID | Title | Severity | Status | Found by |
|----|--------|----------|--------|----------|
| BUG-001 | Event create/update rejected invalid numeric input with 500 | Critical | Fixed | `api/security.api.spec.ts` |
| BUG-002 | Name field HTML-escape corrupted display; XSS handling | High | Fixed | `register.spec.ts` |
| BUG-003 | Login returned 500 when validator failed (no `validationResult`) | High | Fixed | `api/auth.api.spec.ts` |
| BUG-004 | Duplicate registration returned 400 instead of 409 Conflict | High | Fixed | `api/auth.api.spec.ts` |
| BUG-005 | Unknown routes exposed default Express/HTML 404 payload | High | Fixed | `api/security.api.spec.ts` |
| BUG-006 | Events listing test asserted before loading finished | Medium | Fixed | `events.spec.ts` / `EventsPage.ts` |
| BUG-007 | Default browser title "React App" instead of product name | Low | Fixed | `smoke.spec.ts` |

---

## Resolved Issues (Brief)

### BUG-001 (Critical): Invalid event payload caused 500

Invalid values (e.g. negative price) could surface as internal server errors instead of client‑side validation failures.

**Fix:** Added `express-validator` middleware on event create/update in `backend/routes/eventRoutes.js` (e.g. non‑negative price via `body('price').isFloat({ min: 0 })`). Controllers continue to check `validationResult(req)` before persisting data.

---

### BUG-002 (High): Apostrophes and markup in stored names

`.escape()` on the registration `name` field stored HTML entities, so labels showed encoded text instead of readable names.

**Fix:** Removed input escaping for `name`; added a restrictive pattern in `backend/routes/authRoutes.js` (letters, numbers, spaces, `'`, `.`, `-`) so common names remain valid while scripting characters are rejected. React renders `{name}` safely without `dangerouslySetInnerHTML`.

---

### BUG-003 (High): Login omitted validation outcome

Validators were registered for login but the handler did not read `validationResult(req)`, yielding 500 paths for malformed bodies.

**Fix:** Guard at top of login in `backend/controllers/authController.js` returning `400` plus `errors.array()` when validation fails.

---

### BUG-004 (High): Duplicate email not 409

Duplicate registration used `400`, so clients could not separate validation errors from conflicts.

**Fix:** Return `409` with `"User already exists"` when email already registered (`authController.js`).

---

### BUG-005 (High): Generic JSON for unknown URLs

Unhandled routes returned Express’s default HTML 404 (“Cannot GET …”), which is noisy for API clients.

**Fix:** Catch‑all `404` responder in `backend/server.js` returning JSON `{ message: 'Not found' }` before the global error middleware.

---

### BUG-006 (Medium): Flaky assertion on `/events`

The test asserted “cards or empty state” before the list finished loading.

**Fix:** Wait for settle (e.g. `waitForLoadState('networkidle')`) in `EventsPage.expectEventCardsVisible()` before asserting.

---

### BUG-007 (Low): Default browser title

CRA default tab title was `"React App"`.

**Fix:** Set document title in `frontend/public/index.html` (e.g. `<title>Eventy - Discover and Book Events</title>`).

---

## Methodology

- Playwright runs E2E (Chromium, Firefox, WebKit) and hits the API layer with `APIRequestContext`.  
- Page Object helpers live under `qa/tests/pages/`; login fixtures in `qa/tests/fixtures.ts`.  
- Automated count is large (hundreds of cases); totals change as suites grow.

---

## Follow‑Up Testing

| Priority | Suggestion |
|----------|------------|
| High | Automated security scanning (dependency + DAST tooling) aligned with CI |
| Medium | Database seed/fixture scripts so admin and demo data are reproducible |
| Medium | Accessibility and performance budgets on critical paths |
| Low | Visual regression on key layouts |

---

## Conclusion

Automated regression **surfaced seven trackable defects**; all seven are **resolved** in application code or tests as described above.

---

**Version:** 1.2 · **April 2026**
