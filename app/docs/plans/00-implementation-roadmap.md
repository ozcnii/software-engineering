# Labyrinth App Implementation Roadmap

## Goal

Разбить реализацию приложения «Лабиринт» на последовательные планы, которые можно выполнять и проверять отдельно по `app/docs/PRD.md` и `app/docs/CHECKLIST.md`.

## Fixed Stack

- Frontend: React + Vite + TypeScript
- Backend: NestJS + TypeScript
- API: REST JSON
- Database: PostgreSQL
- ORM: Prisma
- Infrastructure: Docker Compose for PostgreSQL
- Package manager: npm

## Target App Structure

```text
app/
  docker-compose.yml

  docs/
    PRD.md
    CHECKLIST.md
    plans/
      STATUS.md
      00-implementation-roadmap.md
      01-project-scaffold.md
      02-backend-auth-db.md
      03-backend-labyrinths-algorithms.md
      04-frontend-auth-admin.md
      05-frontend-player.md
      06-integration-acceptance.md

  frontend/
    src/
      app/
      features/
      shared/

  backend/
    prisma/
    src/
      modules/
      shared/

  shared/
    types/
```

## Plan Order

### 01. Project Scaffold

Purpose:

- создать структуру `frontend`, `backend`, `shared`;
- зафиксировать npm-команды;
- подготовить базовые env-файлы;
- сделать проект готовым для следующих backend/frontend планов.

Expected output:

- базовый frontend на React/Vite/TypeScript;
- базовый backend на NestJS/TypeScript;
- Prisma подключена к PostgreSQL;
- PostgreSQL запускается через Docker Compose;
- есть место для общих типов;
- команды запуска описаны в `app/README.md`.

### 02. Backend Auth and DB

Purpose:

- реализовать модель `User`;
- реализовать seed-админа;
- реализовать регистрацию игрока;
- реализовать вход и выход;
- заложить проверку ролей.

PRD coverage:

- roles and users;
- `POST /api/auth/login`;
- `POST /api/auth/register`;
- `POST /api/auth/logout`;
- admin creation through seed.

Checklist coverage:

- AUTH-01..AUTH-07;
- API-01;
- API-02;
- API-10;
- ADM-LIST-04 as backend prerequisite.

### 03. Backend Labyrinths and Algorithms

Purpose:

- реализовать модель `Labyrinth`;
- реализовать CRUD для лабиринтов;
- реализовать генерацию Прима и Краскала;
- реализовать BFS и DFS;
- реализовать вычисление `difficulty`;
- реализовать валидацию размеров, входа, выхода и сетки.

PRD coverage:

- Labyrinth entity;
- Maze Cell;
- generation algorithms;
- solving algorithms;
- labyrinth REST API.

Checklist coverage:

- API-03..API-09;
- backend prerequisites for ADM-CREATE and PLAYER/AUTO sections.

### 04. Frontend Auth and Admin

Purpose:

- перенести auth UI из `sandbox/index.html` в React;
- реализовать экран администратора;
- реализовать список, поиск, создание и удаление лабиринтов;
- подключить admin UI к backend API.

PRD coverage:

- auth screen;
- admin screen;
- create wizard;
- delete modal;
- info screens for admin.

Checklist coverage:

- AUTH-01..AUTH-07;
- ADM-LIST-01..ADM-LIST-04;
- ADM-CREATE-01..ADM-CREATE-10;
- ADM-DELETE-01..ADM-DELETE-03;
- INFO-01;
- INFO-02.

### 05. Frontend Player

Purpose:

- перенести player UI из `sandbox/index.html` в React;
- реализовать выбор лабиринта;
- реализовать локальную смену темы;
- реализовать ручное движение;
- реализовать авто-решение UI;
- подключить player UI к backend API.

PRD coverage:

- player screen;
- manual movement;
- local themes;
- auto-solve modes;
- stats and legend;
- player info modals.

Checklist coverage:

- PLAYER-01..PLAYER-08;
- AUTO-01..AUTO-05;
- INFO-03;
- INFO-04.

### 06. Integration Acceptance

Purpose:

- пройти приложение целиком по `CHECKLIST.md`;
- закрыть разрывы между frontend и backend;
- обновить `STATUS.md`;
- подготовить финальный запуск для демонстрации.

Checklist coverage:

- all checklist sections;
- final acceptance section.

## Dependencies

```text
01-project-scaffold
  -> 02-backend-auth-db
  -> 03-backend-labyrinths-algorithms
  -> 04-frontend-auth-admin
  -> 05-frontend-player
  -> 06-integration-acceptance
```

Frontend plans can start after scaffold, but API integration depends on backend plans. If frontend is implemented earlier, it should use typed API clients with temporary empty/loading/error states, not hardcoded product data as final behavior.

## Non-Goals For This Roadmap

- No profiles, ratings, history, import, or export features.
- No automated tests unless the user asks separately.
- No deployment plan until local implementation passes the checklist.
- No changes to `report/` or UML artifacts unless product requirements change.

## Acceptance For The Roadmap

The roadmap is complete when:

- every checklist section maps to exactly one implementation plan;
- each future plan has a clear owner area;
- `STATUS.md` shows all planned blocks and their current state;
- no implementation work starts before the relevant detailed plan is written and approved.
