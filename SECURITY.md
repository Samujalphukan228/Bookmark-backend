# Security

> **Important:** This is a **learning project** built to practice web security concepts, not a hardened production system. Do not rely on it to protect real user data.

This document describes the security posture of the Bookmark Manager project: the protections that **are** implemented, the ones that are **not**, and what is required for those protections to actually work in production.

---

## What It IS

Protections currently implemented in the codebase.

### Authentication & Sessions

- Passwords are hashed with **bcrypt at cost 10** before storage; the raw password is never stored or returned (`src/handlers/auth.rs`).
- **JWT (HS256)** tokens carry `sub`, `exp`, `iat`, `aud`, and `iss` claims. Verification enforces audience, issuer, and the required claim set (`src/utils/jwt.rs`).
- Tokens are delivered in an **HttpOnly + Secure + SameSite=None** cookie with an explicit **7-day Max-Age**, reducing XSS-based token theft and keeping them out of JavaScript (`src/handlers/auth.rs`).
- Sessions expire server-verified via the JWT `exp` claim.

### Authorization

- Every authenticated route passes through the JWT cookie middleware; all `/api/*` routes except `/api/auth` and `/health` are protected (`src/main.rs`, `src/middleware/auth.rs`).
- **Ownership is enforced on every query**: bookmarks, collections, tags, and search are all scoped by `user_id`.
- A user cannot reference another user's collection — bookmark create/update validates that the target collection belongs to the authenticated user (`src/handlers/bookmark.rs`).
- Delete/get operations return 404 rather than revealing whether a resource exists or belongs to someone else.

### Account & Input Protections

- Emails are normalized (trimmed + lowercased) before storage and lookup, and a **unique email index** enforces one account per email (`src/handlers/auth.rs`, `src/db/mongo.rs`).
- Register failures return a generic message to avoid **account enumeration**; login failures return a uniform "Invalid credentials".
- Input validation via the `validator` crate: email format, password length, URL format, and required name/title fields.

### Abuse & Resource Limits

- **Rate limiting on auth endpoints** (register/login/logout): 2 requests/sec with a burst of 10 per IP via `tower-governor` (`src/main.rs`).
- **Request body limit** of 10 MB (global) and an explicit **10 MB cap on import uploads** (`src/main.rs`, `src/handlers/import.rs`).

### Transport & Headers

- **CORS restricted to an explicit allow-list** from `ALLOWED_ORIGINS`, with credentials enabled only for those origins (`src/main.rs`).
- Response security headers set: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

### Secrets & Hygiene

- `.env` is gitignored; `.env.example` ships a placeholder, not a real secret.
- All error paths log internally via `tracing`; internal errors return a generic message to the client (details stay server-side) (`src/errors/app_error.rs`).
- No `unwrap()`/`expect()` in request paths that can crash on user input.

---

## What It Is NOT

Known limitations and areas deliberately not covered. These are the gaps you must understand before production use.

- **No CSRF protection.** Cookies use `SameSite=None` (required for the separate frontend/API origins), so state-changing endpoints rely on the `SameSite`/CORS model rather than CSRF tokens. A malicious site could still attempt cross-site requests; there is no double-submit token or origin check beyond CORS.
- **No token revocation / refresh rotation.** JWTs are stateless and valid for 7 days; a stolen token cannot be invalidated server-side before expiry. There is no refresh-token flow or session blacklist.
- **No email verification.** Accounts are usable immediately with any (format-valid) email; there is no ownership verification or password reset flow.
- **No login lockout beyond rate limiting.** The in-memory limiter throttles, but there is no persistent failed-attempt lockout or account suspension.
- **Rate limiting is per-instance and in-memory.** It is not shared across replicas, and behind a reverse proxy the "peer IP" is the proxy IP (all users share one bucket) unless forwarded-IP handling is configured.
- **No audit log.** Auth events (login, register, logout, token failures) are not logged as structured events; `tracing` only surfaces errors.
- **No security monitoring, alerting, or detection** (SIEM, failed-login alerting, anomaly detection).
- **No HSTS header** and no TLS termination in-app. The `Secure` cookie and transport security depend on HTTPS being provided by a reverse proxy or edge.
- **Minimal password policy.** Minimum length 6, no complexity rules, no breached-password check.
- **No integration/pen tests.** Tests cover JWT, import parsing, and email normalization only; there are no automated security/penetration tests.
- **No dependency vulnerability scanning** wired into CI (`cargo audit` / `npm audit` are not part of the pipeline).
- **Index creation is best-effort** — if the unique email index fails to build (e.g. pre-existing duplicates), the server logs a warning and continues, weakening the uniqueness guarantee.
- **429 (rate-limit) responses** are the default governor response, not the JSON error envelope used elsewhere.

---

## Production Requirements

For the protections above to actually hold, deployment must provide:

- **HTTPS everywhere** — required for the `Secure` cookie to function. Terminate TLS at a reverse proxy or edge (e.g. nginx, Caddy, Cloudflare) and add **HSTS** there.
- A **strong, random `JWT_SECRET`**, kept out of source control and rotated periodically.
- A correctly configured **`ALLOWED_ORIGINS`** list; CORS silently limits nothing if it is wrong — it must include only your real frontend origin(s).
- MongoDB on a **private network with strong credentials**, never exposed to the public internet.
- Consider a **forwarded-IP-aware key extractor** and/or an external rate limiter (e.g. edge/CDN) so rate limiting works across instances.
- Regular **dependency audits** (`cargo audit`, `npm audit`) and dependency updates.

---

## Reporting a Vulnerability

This is a personal project. To report a security issue, open a private GitHub issue on the repository or contact the maintainer directly. Include the affected endpoint/version, a description, and steps to reproduce. Do not include live credentials or real user data.
