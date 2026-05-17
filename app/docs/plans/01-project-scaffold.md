# Project Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать базовую структуру приложения `app/` для frontend, backend, shared types, env-файлов и локальных команд запуска.

**Architecture:** Проект остаётся монорепозиторием внутри `app/`. Frontend и backend живут в отдельных подпроектах, общие типы хранятся в `app/shared/types`, документация и планы остаются в `app/docs`.

**Tech Stack:** React + Vite + TypeScript, NestJS + TypeScript, Prisma + PostgreSQL, Docker Compose, REST JSON, npm.

---

## Scope

Этот план создаёт только каркас проекта. Он не реализует auth, CRUD лабиринтов, алгоритмы, UI-экраны и API-контракты из PRD.

## Target Files And Directories

Create:

```text
app/
  README.md
  .env.example
  docker-compose.yml
  package.json

  frontend/
    package.json
    index.html
    tsconfig.json
    vite.config.ts
    src/
      main.tsx
      app/
        App.tsx
      shared/
        api/
        types/
        ui/
      features/
        auth/
        admin/
        player/

  backend/
    package.json
    tsconfig.json
    nest-cli.json
    .env.example
    prisma/
      schema.prisma
    src/
      main.ts
      app.module.ts
      shared/
        config/
        errors/
      modules/
        auth/
        users/
        labyrinths/
        generation/
        solving/

  shared/
    types/
      api.ts
      domain.ts
```

## Root App Package

The root `app/package.json` should provide orchestration commands:

```json
{
  "name": "labyrinth-app",
  "private": true,
  "scripts": {
    "dev": "npm run dev:backend --workspace backend & npm run dev:frontend --workspace frontend",
    "dev:frontend": "npm run dev --workspace frontend",
    "dev:backend": "npm run start:dev --workspace backend",
    "build": "npm run build --workspace frontend && npm run build --workspace backend",
    "typecheck": "npm run typecheck --workspace frontend && npm run typecheck --workspace backend",
    "docker:up": "docker compose up -d postgres",
    "docker:down": "docker compose down",
    "docker:logs": "docker compose logs -f postgres",
    "prisma:generate": "npm run prisma:generate --workspace backend",
    "prisma:migrate": "npm run prisma:migrate --workspace backend",
    "seed": "npm run seed --workspace backend"
  },
  "workspaces": ["frontend", "backend"]
}
```

If parallel command handling causes platform issues, replace root `dev` with separate documented commands in `app/README.md`.

## Shared Types

Create `app/shared/types/domain.ts` with stable domain enums and lightweight shapes used by both sides:

```ts
export type UserRole = 'admin' | 'player';

export type LabyrinthTheme = 'winter' | 'summer' | 'autumn' | 'spring';

export type GenerationAlgorithm = 'prim' | 'kruskal';

export type EntryMode = 'auto' | 'manual';

export type MazeCell = 'wall' | 'path' | 'entry' | 'exit';

export interface Coordinate {
  row: number;
  col: number;
}
```

Create `app/shared/types/api.ts` with the shared API error shape:

```ts
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
```

## Docker And Database Decisions

The root `app/docker-compose.yml` should define PostgreSQL only. Frontend and backend run locally through npm during development.

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: labyrinth-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: labyrinth
      POSTGRES_USER: labyrinth
      POSTGRES_PASSWORD: labyrinth
    ports:
      - '5433:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Root `app/.env.example` should document shared local values:

```text
POSTGRES_DB=labyrinth
POSTGRES_USER=labyrinth
POSTGRES_PASSWORD=labyrinth
POSTGRES_PORT=5433
BACKEND_PORT=3001
FRONTEND_PORT=5173
```

## Backend Scaffold Decisions

Backend modules are created empty at scaffold stage:

- `auth` — login/register/logout, later.
- `users` — user model and seed admin, later.
- `labyrinths` — CRUD and validation, later.
- `generation` — Prim/Kruskal, later.
- `solving` — волновой алгоритм/метод правой руки, later.

Prisma schema at scaffold stage should only establish provider and datasource:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Backend `.env.example`:

```text
DATABASE_URL="postgresql://labyrinth:labyrinth@localhost:5433/labyrinth?schema=public"
PORT=3001
```

## Frontend Scaffold Decisions

Frontend starts with one neutral app shell:

- app title: `Лабиринт`;
- short text: `Каркас приложения готов`;
- no mocked auth/admin/player behavior as final functionality.

Feature folders are created empty except for placeholder `.gitkeep` files if needed.

## Implementation Steps

- [x] Create root `app/package.json` with npm workspaces and orchestration scripts.
- [x] Create `app/README.md` with stack, folder structure, and local commands.
- [x] Create `app/.env.example` documenting frontend and backend env expectations.
- [x] Create `app/docker-compose.yml` with PostgreSQL service and persistent volume.
- [x] Scaffold `app/frontend` as React + Vite + TypeScript.
- [x] Scaffold `app/backend` as NestJS + TypeScript.
- [x] Add Prisma to backend and create initial PostgreSQL `prisma/schema.prisma`.
- [x] Create shared type files in `app/shared/types`.
- [x] Create empty feature/module directories according to the target structure.
- [x] Run dependency installation if needed.
- [x] Run TypeScript/build verification commands available after scaffold.
- [x] Update `app/docs/plans/STATUS.md`: mark `Project scaffold` as `Done` only after verification passes.

## Verification

Run the minimum relevant checks after implementation:

```bash
cd app
npm run docker:up
npm run typecheck
npm run build
```

Expected result:

- frontend TypeScript passes;
- backend TypeScript passes;
- PostgreSQL container starts and accepts connections on localhost port 5433;
- frontend build succeeds;
- backend build succeeds.

If dependency installation or framework scaffolding changes available commands, update this plan before continuing.

## Acceptance Criteria

- `app/frontend` exists and can render the placeholder React app.
- `app/backend` exists and can start a NestJS server.
- `app/docker-compose.yml` starts PostgreSQL for local development.
- Prisma is configured for PostgreSQL.
- `app/shared/types` exists and exports agreed domain/API types.
- `app/README.md` explains how to install, run, build, and typecheck.
- No PRD functionality is implemented in this step beyond the neutral scaffold.
- No tests are added unless the user asks separately.
