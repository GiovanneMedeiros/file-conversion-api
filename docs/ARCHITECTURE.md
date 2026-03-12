# Convertly API Architecture

## High-level Components

- API (Express): HTTP layer and module orchestration.
- Queue (BullMQ + Redis): asynchronous conversion jobs.
- Worker: consumes queue jobs and performs file conversion.
- Database (Prisma + PostgreSQL): users, files, and conversions.
- Storage: local folders `uploads/` and `converted/`.

## Source Layout

- `src/app/routes.js`: central route composition.
- `src/modules/*`: feature modules (auth, file, conversion, user).
- `src/shared/middlewares/*`: cross-cutting middleware.
- `src/shared/utils/*`: shared utility helpers.
- `src/queue/*`: queue connection and queue provider.
- `src/workers/*`: async processing workers.
- `src/database/*`: Prisma client and DB integration.

## Main Runtime Flow

1. Client authenticates via auth module.
2. Client uploads a file via file module.
3. Client requests conversion via conversion module.
4. API stores conversion as pending and enqueues a BullMQ job.
5. Worker processes job and writes output to `converted/`.
6. Client polls conversion status and downloads the result.
7. Client queries user conversion history.
