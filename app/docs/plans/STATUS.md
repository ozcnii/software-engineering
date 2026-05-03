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
| Backend auth and DB | `02-backend-auth-db.md` | Blocked | Code implemented; DB-backed verification blocked because Docker daemon/PostgreSQL is unavailable |
| Backend labyrinths and algorithms | `03-backend-labyrinths-algorithms.md` | Blocked | Code implemented; `prisma:generate`, `typecheck`, `build`, and local domain checks pass; DB-backed migrate/seed/curl verification skipped because PostgreSQL was not started |
| Frontend auth and admin | `04-frontend-auth-admin.md` | Planned | Auth UI, admin list, create wizard, delete modal; decisions reviewed |
| Frontend player | `05-frontend-player.md` | Planned | Player screen, manual movement, themes, auto-solve UI; decisions reviewed |
| Integration acceptance | `06-integration-acceptance.md` | Planned | End-to-end manual verification by `CHECKLIST.md`; decisions reviewed |

## Implementation Status

| Area | Status | Covered by checklist |
|---|---|---|
| Repository/app scaffold | Done | Code scaffold passes checks; Docker verification accepted by user |
| Auth UI | Not started | AUTH-01..AUTH-07 |
| Auth API | Blocked: DB unavailable for full verification | API-01, API-02, API-10 |
| Seed admin | Blocked: DB unavailable for seed verification | AUTH-04 |
| Role access control | Blocked: DB unavailable for role-session verification | ADM-LIST-04 |
| Admin labyrinth list | Not started | ADM-LIST-01..ADM-LIST-03 |
| Admin create wizard | Not started | ADM-CREATE-01..ADM-CREATE-10 |
| Admin delete flow | Not started | ADM-DELETE-01..ADM-DELETE-03 |
| Labyrinth generation | Blocked: DB-backed API verification skipped; local generator/domain validation passes | API-05, ADM-CREATE-05, ADM-CREATE-07 |
| Labyrinth persistence | Blocked: DB unavailable for migrate/seed/API verification | API-03, API-04, API-06, API-07 |
| Difficulty calculation | Done | API-03 |
| Player screen | Not started | PLAYER-01..PLAYER-04 |
| Manual movement | Not started | PLAYER-05..PLAYER-08 |
| Auto-solve BFS/DFS | Blocked: DB-backed API verification skipped; local BFS/DFS domain validation passes | AUTO-01..AUTO-05, API-08, API-09 |
| Info screens | Not started | INFO-01..INFO-04 |
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
