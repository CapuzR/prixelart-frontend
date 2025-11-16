# @prixpon/api

Express + TypeScript backend that now lives inside the monorepo. All commands are meant to be executed with `pnpm` from the repo root so Turbo can coordinate installs, builds, and caching.

## Setup

1. Install dependencies (from repo root):
	```bash
	pnpm install
	```
2. Copy `.env.example` to `.env` inside `apps/api` and fill the required secrets.
3. Start developing:
	```bash
	pnpm --filter @prixpon/api dev
	```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm --filter @prixpon/api dev` | Runs the API with `tsx watch`, reloading on changes. |
| `pnpm --filter @prixpon/api start` | Launches the API once (handy for production simulations). |
| `pnpm --filter @prixpon/api build` | Runs `tsc --noEmit` for type safety and ensures `apps/api/dist` exists for Turbo caches. |
| `pnpm --filter @prixpon/api lint` | Executes ESLint using the shared configuration. |
| `pnpm --filter @prixpon/api type-check` | Runs a strict `tsc --noEmit` pass. |
| `pnpm --filter @prixpon/api migrate:permissions` | Executes the permission migration helper. |

## Environment quick reference

| Variable | Purpose | Typical local value |
| --- | --- | --- |
| `FRONT_END_URL` / `ADMIN_FRONT_END_URL` | Base URLs used to derive the CORS allow-list. | `http://localhost:5173` / `http://localhost:4173` |
| `ALLOWED_ORIGINS` | Comma-separated extra origins appended to CORS (useful for staging domains). | `http://localhost:5173,http://localhost:4173` |
| `SESSION_KEYS` | Comma-separated secrets for `cookie-session`. Required in production. | `dev_session_key_primary,dev_session_key_secondary` |
| `SESSION_DOMAIN` | Cookie domain. Leave blank locally; set to `.prixelart.com` (or equivalent) in prod. | _empty_ |
| `SESSION_SECURE` / `SESSION_SAMESITE` | Override cookie flags. Defaults to `false + lax` locally and `true + none` when `NODE_ENV=production`. | `false` / `lax` |
| `ADMIN_COOKIE_DOMAIN` / `ADMIN_COOKIE_SECURE` / `ADMIN_COOKIE_SAMESITE` | Optional overrides specifically for the admin JWT cookie. Falls back to the session values above when omitted. | _empty_ |
| `TRUST_PROXY` | Value passed to `app.set('trust proxy', …)` when running behind a load balancer. | `0` |

> The server now auto-detects `NODE_ENV`. In development it relaxes cookies so logins work over plain HTTP/localhost; in production it forces `secure` + `sameSite="none"` and keeps the original `.prixelart.com` domain unless you override via env.

## Structure

```
apps/api
├── package.json
├── tsconfig.json
├── .env.example
├── server.ts
├── start.ts
└── src/
	├── mongo.ts
	├── user/
	├── product/
	├── ...
	└── scripts/
```

Add or adjust routes/services under `src/**`, then point `start.ts`/`server.ts` to them as usual.
