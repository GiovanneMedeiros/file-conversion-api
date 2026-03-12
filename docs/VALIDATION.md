# Validation Guide

## Local Validation

Run full local validation:

```bash
npm run validate
```

This command attempts to:

1. Ensure Redis is available.
2. Apply Prisma migrations.
3. Start API and worker.
4. Wait for `/health`.
5. Run `scripts/smoke.ps1`.
6. Stop spawned processes.

## Smoke Validation Only

```bash
npm run smoke
```

Prerequisites:

- API is running on `http://localhost:3000`
- Worker is running
- Redis is reachable
- PostgreSQL is reachable

## CI Validation

Workflow path:

- `.github/workflows/ci.yml`

Pipeline runs smoke end-to-end with PostgreSQL and Redis services, then fails on any broken critical path.
