# TechCare Backend — Status & Next Steps

## Done (merged to main)
- Entities: Organization, User, Patient, VitalReading, Diagnostic, LabResult,
  EmergencyContact, RefreshToken, AuditLog
- Auth: login, refresh (with rotation), logout, httpOnly cookies, CSRF double-submit,
  role middleware. Verified manually end-to-end. Reuse-detection branch written but
  NOT verified against a simulated attack — do that before trusting it fully.
- organizationId auto-scoping via Prisma $extends + AsyncLocalStorage
  (src/lib/prisma.ts, src/lib/requestContext.ts). Reasoned through, not yet
  covered by an automated test — see Priority 1 below.
- CI (lint/format/typecheck/test/build against real Postgres) and CD (build +
  push image to GHCR) both proven working. Deploy step is still a placeholder,
  no hosting provider chosen yet.

## Priority 1 — tests, not features
- Automated test for the org-scoping extension: two orgs, two patients, assert
  cross-tenant reads/writes fail. This is the test that turns "reasoned through"
  into "verified."
- Automated tests for auth.service.ts / auth.controller.ts (currently ~3% coverage).
  Mock Prisma the way tests/health/health.test.ts already demonstrates.

## Priority 2 — first real feature on top of the scoped Patient model
- Patient CRUD endpoints (create/list/get/update/delete), following the
  modules/<feature>/{routes,controller,service,schema} pattern from auth.

## Priority 3
- User management endpoints — there's currently no way to create a staff user
  except prisma/seed.ts. Admin-provisioned account creation is the real gap.
- Pick a hosting provider and wire the CD deploy step to something real.