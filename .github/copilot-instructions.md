<!-- Copilot / AI agent guidance for the React-Business repo -->
# Copilot Instructions — React-Business

Purpose: give AI coding agents the concrete, local knowledge needed to be productive quickly.

- **Project type:** Next.js (App Router) TypeScript app using Node >= 18.17.0 (see `package.json`).
- **Where the app lives:** top-level repository (root `package.json`) with source in `src/` (app code under `src/app/`). There is also a `package/` folder with app artifacts; prefer the root `package.json` for scripts and env checks unless instructed otherwise.

Quick commands (run from repository root):

- Install: `npm install`
- Dev server: `npm run dev` (Next.js app on `http://localhost:3000`)
- Build: `npm run build`
- Start (production): `npm run start`
- Pre-deploy check: `npm run check-env` (runs `node scripts/check-env-local.js`)

Environment & secrets

- Template: `.env.local.example` — copy to `.env.local` for local work.
- Required env vars (used throughout APIs): `FACEBOOK_ACCESS_TOKEN`, `FACEBOOK_AD_ACCOUNT_ID`.
- Optional (present in code and checks): `GOOGLE_ADS_*`, `GOOGLE_SA_*`, `GOOGLE_SHEET_ID`, etc. See `scripts/check-env-local.js` and `src/app/api/check-env/route.ts` for the exact lists.
- Use `npm run check-env` or `GET /api/check-env` to validate current env variables.

Architecture & code patterns (concrete pointers)

- App Router: server & API routes use Next.js app directory. API endpoints follow the folder+`route.ts` pattern: `src/app/api/<name>/route.ts` (example: `src/app/api/check-env/route.ts`).
- API examples: Facebook-Ads endpoints under `src/app/api/facebook-ads*`, Google Ads under `src/app/api/google-ads/`, and Google Sheets integrations under `src/app/api/google-sheets-*`.
- Server-side integrations: `@supabase/supabase-js`, `pg` (Postgres), `facebook-nodejs-business-sdk`, `google-ads-api`, `googleapis`. See `package.json` dependencies.
- SQL and migration artifacts: `database-schema.sql`, `supabase-*.sql`, and many `create-*.sql` files at repo root. Use these when working with DB schema or data imports.

Developer conventions important for agents

- Prefer reading/using the existing helper files and endpoints instead of inventing new infra. Example: use `src/app/api/check-env/route.ts` as canonical env-check and `scripts/check-env-local.js` for predeploy checks.
- Tokens are masked in logs and API responses — avoid printing raw secrets. See `src/app/api/check-env/route.ts` for masking examples.
- Many deployment docs live at root (`VERCEL_ENV_SETUP.md`, `PRODUCTION_DEPLOYMENT.md`, `RAILWAY_*` files). Match the documented deploy steps when asked to create CI/CD changes.
- Windows PowerShell helper scripts are available (`*.ps1`) for common tasks and tests (e.g., `test-mobile.ps1`, `run-test.ps1`). Use PowerShell-compatible commands on developer machines.

Debugging & quick checks

- Validate env: `node scripts/check-env-local.js` or `curl http://localhost:3000/api/check-env`
- DB connection test script: `test-db-connection.js` (root) and other `test-*` scripts.
- Local mobile test: run `.\test-mobile.ps1` on PowerShell.

Files and locations to inspect first when modifying features

- High-level: `README.md` (root) — contains quick-start and feature list.
- API routes: `src/app/api/*` (many domain-specific endpoints live here)
- Env & checks: `scripts/check-env-local.js`, `.env.local.example`, `src/app/api/check-env/`
- Deployment: `vercel.json`, `Procfile`, `VERCEL_ENV_SETUP.md`, `PRODUCTION_DEPLOYMENT.md`.

When proposing code changes

- Run `npm run dev` locally and verify the affected API route or page.
- If changes touch secrets or deploy-time behavior, update `scripts/check-env-local.js` and `src/app/api/check-env/route.ts` so checks remain accurate.
- Reference existing patterns for API routes (`route.ts`), server-side data access, and token handling — avoid creating incompatible conventions.

If anything here is unclear or you need repo-specific examples added, tell me which area (env, API pattern, deployment, DB) and I will expand accordingly.
