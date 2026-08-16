# TechCare API

Backend for TechCare — a multi-tenant clinical dashboard. Node.js, TypeScript, Express, Prisma, PostgreSQL.

## Stack & why

| Choice | Reason |
|---|---|
| TypeScript (strict) | Data model touches patient health data — the compiler catching a null vitals reading is cheaper than a runtime 500 in front of a doctor. |
| Prisma + PostgreSQL | Type-safe queries generated from the schema; migrations are code-reviewable, not manual SQL run by hand. |
| Feature-sliced modules | `src/modules/<feature>/` keeps a feature's routes/controller/service/schema together. No jumping across `controllers/`, `services/`, `routes/` to understand one feature. |
| Zod | Runtime validation for both env vars and request payloads — the compiler can't catch a malformed HTTP body. |
| Multi-tenant from day one | Every `User` and `Patient` is scoped to an `Organization`. Retrofitting tenant isolation after data exists is far more expensive than building it in now. |

## Architecture decisions worth knowing

- **Health data requires an audit trail.** Every model has a `recordedById` / `uploadedById`, and there's a dedicated `AuditLog` table. This isn't optional polish — "who touched this record and when" is the first question in any incident review.
- **Vitals are one table with a `type` enum**, not one column per vital sign. Adding a new vital type (SpO2, glucose) later is a data row, not a migration.
- **Soft deletes on `User` and `Patient`** (`deletedAt`) — health records referenced by history should never hard-delete.
- **Tenant isolation is currently convention-enforced** (every query must filter by `organizationId`). This is a known gap, tracked to be closed with a Prisma Client Extension once auth/session middleware exists — see `src/lib/prisma.ts` for where that hooks in.

## Local setup

```bash
cp .env.example .env          # fill in real secrets locally
docker compose up -d          # starts Postgres on :5432
npm install
npm run prisma:migrate:dev    # creates the DB schema
npm run dev                   # starts the API on :4000 with hot reload
```

Verify it's alive:

```bash
curl http://localhost:4000/health
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `test:watch` / `test:coverage` | Vitest |
| `npm run prisma:migrate:dev` | Create + apply a new migration locally |
| `npm run prisma:studio` | Visual DB browser |

## CI/CD

- **`.github/workflows/ci.yml`** — runs on every PR and push to `main`/`develop`. Lint → format check → typecheck → migrate a real ephemeral Postgres → test with coverage → build. Any failure blocks merge.
- **`.github/workflows/cd.yml`** — runs on push to `main`, only after CI passes on that commit. Builds and pushes a versioned Docker image to GHCR. **The actual deploy step is a placeholder** — it's not wired to a hosting provider yet. That's a decision for you to make (Render, Fly.io, ECS, Railway), not one to bake into scaffolding speculatively.

## Project structure

```
src/
  config/       env validation
  lib/          shared clients (prisma singleton)
  middleware/   error handler, 404 handler
  modules/
    health/     example module — routes, controller
    <feature>/  same shape: routes, controller, service, repository, schema
  utils/        AppError, asyncHandler, logger
prisma/
  schema.prisma
tests/
  <mirrors src/modules structure>
```

## What's next

Auth module — signup is disabled by design (staff accounts are provisioned by an admin, not self-registered, since this is a clinical tool, not a consumer app). JWT access + refresh tokens, bcrypt password hashing, role-based middleware (`ADMIN` / `DOCTOR` / `NURSE`), and the `organizationId` scoping extension mentioned above.
