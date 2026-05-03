# Implementation Status

Этот файл показывает, что уже спланировано, что реализовано и что ещё не начато по приложению «Лабиринт».

Источник требований:

- `app/docs/PRD.md`
- `app/docs/CHECKLIST.md`
- `sandbox/index.html`

## Stack Decision

Стек зафиксирован для всех дальнейших планов:

- Frontend: React + Vite + TypeScript
- Backend: NestJS + TypeScript
- API: REST JSON
- Database: PostgreSQL
- ORM: Prisma
- Infrastructure: Docker Compose for PostgreSQL
- Package manager: npm
- Auth: JWT in httpOnly cookie

## Plan Status

| Plan | File | Status | Notes |
|---|---|---|---|
| Roadmap | `00-implementation-roadmap.md` | Planned | Общая декомпозиция PRD на этапы реализации |
| Project scaffold | `01-project-scaffold.md` | Done | Scaffold created; `typecheck`, `build`, `prisma:generate` pass; Docker verification accepted by user |
| Backend auth and DB | `02-backend-auth-db.md` | Done | DB-backed auth smoke checks pass: seed admin login, register player, duplicate/mismatch validation, `/me`, logout |
| Backend labyrinths and algorithms | `03-backend-labyrinths-algorithms.md` | Done | DB-backed labyrinth smoke checks pass: list/search, generate auto/manual, create/detail/delete, BFS/DFS, role errors |
| Frontend auth and admin | `04-frontend-auth-admin.md` | Done | Auth/admin frontend implemented; `typecheck`, `build`, Docker/migrate/seed, API smoke checks, and headless browser smoke checks pass |
| Frontend player | `05-frontend-player.md` | Done | Player screen, manual movement, themes, auto-solve UI verified with command, API, and headless browser checks |
| Frontend refactor | `07-frontend-refactor.md` | Done | Soft feature-sliced cleanup verified with typecheck, build, API smoke, and browser smoke |
| Integration acceptance | `06-integration-acceptance.md` | Planned | End-to-end manual verification by `CHECKLIST.md`; decisions reviewed |

## Implementation Status

| Area | Status | Covered by checklist |
|---|---|---|
| Repository/app scaffold | Done | Code scaffold passes checks; Docker verification accepted by user |
| Auth UI | Done | AUTH-01..AUTH-07 |
| Auth API | Done | API-01, API-02, API-10 |
| Seed admin | Done | AUTH-04 |
| Role access control | Done | ADM-LIST-04 |
| Admin labyrinth list | Done | ADM-LIST-01..ADM-LIST-03 |
| Admin create wizard | Done | ADM-CREATE-01..ADM-CREATE-10 |
| Admin delete flow | Done | ADM-DELETE-01..ADM-DELETE-03 |
| Labyrinth generation | Done | API-05, ADM-CREATE-05, ADM-CREATE-07 |
| Labyrinth persistence | Done | API-03, API-04, API-06, API-07 |
| Difficulty calculation | Done | API-03 |
| Player screen | Done | PLAYER-01..PLAYER-04 |
| Manual movement | Done | PLAYER-05..PLAYER-08 |
| Auto-solve BFS/DFS | Done | AUTO-01..AUTO-05, API-08, API-09 |
| Info screens | Done | INFO-01..INFO-04 |
| Frontend refactor | Done | Maintenance refactor verified; no direct checklist behavior changes |
| Full acceptance pass | Not started | Section 9 of `CHECKLIST.md` |

## Status Legend

- `Not started` — план или реализация ещё не начаты.
- `Planned` — план создан, реализация ещё не начата.
- `In progress` — реализация начата.
- `Blocked` — есть открытый вопрос или зависимость.
- `Done` — реализация выполнена и проверена по релевантным пунктам чеклиста.

## Rules

- Перед началом реализации блока должен быть создан и согласован отдельный план.
- Статус `Done` ставится только после проверки соответствующих пунктов `CHECKLIST.md`.
- Если во время реализации появляется новое решение по стеку, API или данным, сначала обновляется PRD или соответствующий план.
- Тесты не добавляются без отдельного запроса пользователя.
