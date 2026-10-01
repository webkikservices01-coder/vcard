# Admin panel

A separate, secure admin backend for Aicardly. It has nothing in common with site users:
its own accounts (`admins` collection), its own sign-in, its own JWT secret and cookies, and its
own frontend bundle.

| Part | Where | Served at |
|---|---|---|
| Admin API | `BACKEND/routes/admin/`, `BACKEND/middleware/admin/`, `BACKEND/services/admin/` | `<backend>/api/admin/*` |
| Admin panel (React app) | `ADMIN/` → built into `BACKEND/admin-ui/` | `<backend>/admin` |

The panel is served by the backend on purpose. Its session cookies are `SameSite=Strict`, and a
browser only sends those to the same site. The API runs on Vercel, not on aicardly.com, so the panel
has to be served from the same origin as the API. For a nicer address, add a domain such as
`admin.aicardly.com` to the backend's Vercel project; the panel is then at
`https://admin.aicardly.com/admin`.

On Vercel, the panel's JS/CSS (`admin-ui/assets`) are served as static files (see
`BACKEND/vercel.json`). If they were included in the function, Vercel would compile them from ESM
to CommonJS and the panel would break in the browser. Only `admin-ui/index.html` goes through
Express, which adds the security headers.

The old admin screens inside the main site (`FRONTEND/src/pages/admin`, which used a site user with
`isAdmin`) are removed. `aicardly.com/admin` now forwards to the new panel.

## Set up

1. **Environment** (`BACKEND/.env` locally, and Vercel → backend project → Environment Variables):

   | Variable | Required | What |
   |---|---|---|
   | `ADMIN_ENABLED` | yes | `true` switches the panel and its API on. Anything else: both return 404. |
   | `ADMIN_JWT_SECRET` | yes | At least 32 characters, **different from `JWT_SECRET`** (otherwise the panel stays off). Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
   | `ADMIN_ENCRYPTION_KEY` | no | Encrypts admins' 2FA secrets. Default: derived from `ADMIN_JWT_SECRET`. If you set it later, admins must set up 2FA again. |
   | `ADMIN_ACCESS_TTL_MIN` | no | Access token lifetime, minutes (default 15). |
   | `ADMIN_REFRESH_TTL_HOURS` | no | How long a sign-in lasts without activity, hours (default 12). |
   | `ADMIN_IP_ALLOWLIST` | no | Comma-separated IPs allowed to open `/admin` and `/api/admin`. Empty: any IP. |
   | `ADMIN_ORIGINS` | no | Extra origins allowed to call `/api/admin` (only if the panel is ever hosted elsewhere). |
   | `ADMIN_TOTP_ISSUER` | no | Name shown in the authenticator app (default "Aicardly Admin"). |
   | `ADMIN_SEED_EMAIL`, `ADMIN_SEED_NAME`, `ADMIN_SEED_PASSWORD` | no | Only for creating the first admin (step 3). Remove them afterwards. |

2. **Database setup** (safe to run again): creates indexes, adds the website's plans to the
   `plans` collection, and builds plan history from past payments.

   ```bash
   cd BACKEND
   npm run admin:migrate
   ```

3. **First super admin.** Nothing is hardcoded. The password is typed in the terminal (or read from
   `ADMIN_SEED_PASSWORD`), at least 12 characters:

   ```bash
   npm run admin:create -- --email you@company.com --name "Your Name"
   ```

   The script refuses to run once a super admin exists; add more admins from the panel.

   **When the scripts can't reach the production database** (Vercel doesn't hand out secret env
   values): set `ADMIN_BOOTSTRAP_TOKEN` (32+ random characters) on Vercel, deploy, and call
   `POST /api/admin/auth/bootstrap` once with the header `X-Bootstrap-Token`, the CSRF header and
   `{ email, name, password }`. It creates the first super admin and runs the same setup as
   `admin:migrate`. It answers 404 unless the token matches and no admin exists yet. Remove
   `ADMIN_BOOTSTRAP_TOKEN` and redeploy afterwards. Production was set up this way on 2026-09-30.
   Locked out? `npm run admin:create -- --email you@company.com --reset` sets a new password,
   clears the lockout, switches that admin's 2FA off and ends their sessions.

4. **Build the panel** whenever `ADMIN/` changes. The build goes into `BACKEND/admin-ui/`, which is
   deployed with the backend:

   ```bash
   cd ADMIN
   npm install
   npm run build
   ```

5. Deploy the backend, open `<backend>/admin`, sign in, and switch on 2FA under **My account**.

**Local development:** run the backend (`cd BACKEND && npm run dev`, port 5000), then
`cd ADMIN && npm run dev` and open http://localhost:5174/admin/. The dev server sends `/api` to the backend.

## Roles

| | support | admin | super_admin |
|---|:-:|:-:|:-:|
| See dashboard, users, cards, payments, plans, support tickets | ✓ | ✓ | ✓ |
| Resend / regenerate payment link, resend card, update tickets | ✓ | ✓ | ✓ |
| Email a user a password-reset / verification link | ✓ | ✓ | ✓ |
| Block / unblock, remove / restore users | | ✓ | ✓ |
| Grant, extend, change, revoke plans; free card credits | | ✓ | ✓ |
| Edit a user's name / email / phone / verified, set their password, sign them out everywhere | | ✓ | ✓ |
| Sign in as a user (opens their dashboard for 2 hours, audited) | | ✓ | ✓ |
| Create / edit / disable plans, CSV exports, app logs, audit log | | ✓ | ✓ |
| Delete users permanently, manage admins | | | ✓ |

Permissions are in `BACKEND/constants/adminPermissions.js`, and every API route checks them. The
panel only hides buttons.

## Security

- **Separate accounts.** Admins sign in against `admins`, never `users`. A site user's token is
  rejected on `/api/admin` (wrong secret, audience and type), and an admin token is rejected on
  user routes.
- **Sessions.**
  - The access JWT lasts 15 minutes. The refresh token is random, stored only as a SHA-256 hash, and
    rotated on every refresh. If an already-used refresh token comes back, all of that admin's
    sessions end.
  - Both live in `httpOnly; Secure; SameSite=Strict` cookies. Nothing is kept in localStorage.
  - A password change, password reset, role change or deactivation signs the admin out everywhere
    (`tokenVersion`).
- **Sign-in protection.**
  - Passwords are hashed with bcrypt (cost 12), at least 12 characters.
  - Each IP gets 10 failed attempts per 15 minutes.
  - After 5 wrong passwords or 2FA codes, the account locks for 15 minutes.
  - Unknown emails get the same reply, in the same time, as wrong passwords.
- **2FA.** TOTP (RFC 6238), optional per admin. Secrets are encrypted with AES-256-GCM.
- **CSRF.** Every changing request must pass three checks:
  - the `Origin` header matches the panel's origin;
  - the `X-CSRF-Token` header equals the CSRF cookie (double submit);
  - the session cookies are `SameSite=Strict`.
- **Headers and CORS.** Helmet sets a strict CSP (`frame-ancestors 'none'`, scripts from self
  only), HSTS and `no-referrer`. Every admin API response is `Cache-Control: no-store`. The admin API
  has its own CORS: same origin plus `ADMIN_ORIGINS`. The site-wide `CORS_ORIGINS` does not apply to it.
- **Validation.**
  - Every admin input goes through a zod schema.
  - ids must be ObjectIds.
  - Search text is regex-escaped.
  - Express 5's query parser never builds objects, so Mongo operators can't be injected.
- **No secrets in responses.** Password hashes, reset/verification token hashes, 2FA secrets,
  refresh tokens and Cashfree payment session ids are never returned.
- **Audit log** (`adminauditlogs`). Every action and every sign-in attempt is recorded, successful
  or not: admin, action, target, summary, reason, IP, user agent and time. It is kept permanently.
- **Blocked / removed users.** `middleware/auth.js` checks every signed-in request, so a block also
  stops tokens that were already issued. The status is cached for 30 seconds per server instance.
  - A blocked user can't sign in, create cards or order.
  - A removed user (soft delete) is treated as if the account doesn't exist, and their public card
    and its AI chat are hidden.
  - A permanent delete (super admin, confirmed by typing the user's email) deletes the user, their
    cards and everything on the cards. Card orders and plan payments are kept for accounting.

## Plans

- `plans` is seeded from `constants/plans.js`: yearly and monthly of each tier.
- A plan's **tier** is the feature set it unlocks (DIGITAL CARD / SMART AI CARD / AI AGENT PRO),
  because the app's feature checks use those three names. A custom plan such as "Diwali Offer"
  sets `users.plan` to its tier and keeps its own name in the plan history.
- Online checkout prices still come from `constants/plans.js` (the pricing page is static). Admin
  plans are what admins grant.
- **Plan history** (`userplans`) records every purchase and grant: start, end, source (bought online,
  admin grant, complimentary, older records), who granted it and why. Online payments add a row
  automatically.
- **Free card credits** (`users.freeCardCredits`): each credit makes the user's next "Get my card"
  order free. The order is marked paid for ₹0 and the card is delivered on WhatsApp and email with no
  payment link.

## API routes

All routes are under `/api/admin`. `GET` routes need a signed-in admin. Changing routes also need
the CSRF header.

| Method & path | Permission |
|---|---|
| `GET /auth/csrf` · `POST /auth/login` · `POST /auth/login/2fa` · `POST /auth/refresh` · `POST /auth/logout` | – |
| `GET /auth/me` · `POST /auth/password` · `POST /auth/2fa/setup` · `POST /auth/2fa/enable` · `POST /auth/2fa/disable` | signed in |
| `GET /dashboard` | dashboard.view |
| `GET /users` (q, status, plan, from, to, sort, order, page, limit) · `GET /users/:id` | users.view |
| `GET /users/export` | export.csv |
| `POST /users/:id/block` · `POST /users/:id/unblock` | users.block |
| `POST /users/:id/remove` · `POST /users/:id/restore` | users.delete |
| `DELETE /users/:id` (body `confirmEmail`) | users.purge |
| `POST /users/:id/plan/grant` · `…/plan/extend` · `…/plan/change` · `…/plan/revoke` | users.plan |
| `POST /users/:id/credits` | users.credits |
| `POST /users` (name, email, phone?, password?, emailVerified) — new account; no password = a set-password link is emailed | users.create |
| `POST /users/:id/profile` (name, email, phone, emailVerified, reason) | users.edit |
| `POST /users/:id/password` (password, signOut, reason) · `POST /users/:id/signout` | users.password |
| `POST /users/:id/email-link` (kind: reset / verify) | users.reset_link |
| `POST /users/:id/impersonate` (reason) → one-time link `SITE/impersonate#code=…` (60 s, single use, stored hashed); the site swaps it at `POST /api/auth/impersonate` for a 2-hour user token marked `imp` and shows an "Admin view" banner | users.impersonate |
| `GET /cards` (q, payment, delivered, from, to) | cards.view |
| `GET /cards/export` | export.csv |
| `GET /payments/card-orders` · `GET /payments/transactions` | payments.view |
| `GET /payments/card-orders/export` · `GET /payments/transactions/export` | export.csv |
| `POST /payments/card-orders/:id/resend-link` · `…/regenerate` · `…/resend-card` | payments.resend |
| `GET /plans` · `GET /plans/subscriptions` | plans.view |
| `POST /plans` · `PUT /plans/:id` · `POST /plans/:id/enable` · `POST /plans/:id/disable` | plans.manage |
| `GET /admins` · `POST /admins` · `PATCH /admins/:id` · `POST /admins/:id/reset-password` · `POST /admins/:id/unlock` | admins.manage |
| `GET /audit` | audit.view |
| `GET /support` · `PUT /support/:id` | support.view / support.update |
| `GET /logs` · `GET /ai-usage` | logs.view |
| `GET /ai-usage/export` | export.csv |

## Tests

```bash
cd BACKEND
npm test
```

`tests/admin.auth.test.js` needs no database. It checks that:

- user tokens are rejected on admin routes, and admin tokens on user routes;
- forged, expired and outdated tokens are rejected, as are deactivated admins;
- each role can only do what its permissions allow;
- CSRF and origin checks refuse bad requests;
- blocked users are refused;
- the panel is off when the env flag is off;
- TOTP matches the RFC test vectors, and CSV output can't run formulas.

## Signing users out

`users.tokensValidAfter`: user tokens issued before it stop working (checked with the 30 s
account-status cache in `utils/accountStatus.js`). It is set when an admin sets a password (unless
"sign out on other devices" is unticked), on "Sign out everywhere", and when the user resets their
own password with the emailed link.
