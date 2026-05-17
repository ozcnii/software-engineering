# Integration Acceptance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Провести финальную интеграцию frontend/backend и пройти приложение по `app/docs/CHECKLIST.md`.

**Architecture:** Этот этап не добавляет новые продуктовые функции. Он закрывает разрывы между уже реализованными backend/frontend блоками, фиксирует несовпадения с PRD и обновляет статус готовности.

**Tech Stack:** React + Vite + TypeScript, NestJS + TypeScript, Prisma + PostgreSQL, Docker Compose, REST JSON, npm.

---

## Scope

Входит:

- полный локальный запуск;
- проверка env и Docker;
- проверка API contracts;
- проверка browser flows;
- обновление `STATUS.md`;
- фиксация остаточных рисков.

Не входит:

- новые фичи вне PRD;
- изменения UML/report без отдельного запроса;
- automated tests, если пользователь отдельно не попросит.

## Preconditions

Before this plan starts:

- `01-project-scaffold` is Done;
- `02-backend-auth-db` is Done;
- `03-backend-labyrinths-algorithms` is Done;
- `04-frontend-auth-admin` is Done;
- `05-frontend-player` is Done.

## Acceptance Decisions

- Run acceptance from a clean local database: start Docker, apply migrations, run seed, then execute checks.
- Produce both `app/docs/plans/STATUS.md` updates and a dedicated `app/docs/plans/ACCEPTANCE_REPORT.md`.
- Record the exact curl commands used for API checks in the acceptance report.
- Run browser/UI checks manually by checklist without screenshot artifacts.
- If a bug is inside already approved scope, fix it during this plan. If the fix changes PRD/API behavior, stop and ask for approval first.

## Acceptance Run Commands

Use local commands:

```bash
cd app
npm install
npm run docker:up
npm run prisma:migrate
npm run seed
npm run dev:backend
npm run dev:frontend
```

In a separate check:

```bash
cd app
npm run typecheck
npm run build
```

## Manual Checklist Pass

Run and record status for:

- AUTH-01..AUTH-07;
- ADM-LIST-01..ADM-LIST-04;
- ADM-CREATE-01..ADM-CREATE-10;
- ADM-DELETE-01..ADM-DELETE-03;
- PLAYER-01..PLAYER-08;
- AUTO-01..AUTO-05;
- INFO-01..INFO-04;
- API-01..API-10;
- final acceptance section.

## Implementation Steps

- [ ] Confirm database container starts from `docker-compose.yml`.
- [ ] Confirm migrations apply cleanly on empty database.
- [ ] Confirm seed creates admin.
- [ ] Confirm backend starts without runtime errors.
- [ ] Confirm frontend starts without runtime errors.
- [ ] Run command verification: typecheck and build.
- [ ] Pass auth checklist items.
- [ ] Pass admin checklist items.
- [ ] Pass player checklist items.
- [ ] Pass auto-solve checklist items.
- [ ] Pass info screen checklist items.
- [ ] Pass API checklist items with curl/Postman.
- [ ] Document any failed or blocked checklist item in `STATUS.md`.
- [ ] Mark completed implementation areas as `Done` only when verified.

## Bug Handling During Acceptance

If a checklist item fails:

- record exact checklist ID;
- record expected vs actual behavior;
- identify owning plan area;
- fix only if the issue is within already approved implementation scope;
- if the fix changes PRD/API behavior, stop and ask for approval.

## Final Output

At the end of this plan, provide:

- list of checklist sections passed;
- list of failed or blocked checklist IDs;
- commands run and results;
- updated `app/docs/plans/STATUS.md`;
- `app/docs/plans/ACCEPTANCE_REPORT.md` with PASS/FAIL checklist status and API curl commands;
- recommendation for commit or follow-up fixes.

## Acceptance Criteria

- App can be started locally from documented commands.
- Backend and frontend build successfully.
- Seed admin can log in.
- Player registration works.
- Admin can create, search and delete labyrinths.
- Player can choose and pass a labyrinth manually.
- волновой алгоритм/метод правой руки auto-solve works through UI and API.
- `STATUS.md` accurately reflects implementation state.
