# Лабиринт

Монорепозиторий веб-приложения «Лабиринт».

## Stack

- Frontend: React + Vite + TypeScript
- Backend: NestJS + TypeScript
- API: REST JSON
- Database: PostgreSQL
- ORM: Prisma
- Infrastructure: Docker Compose for PostgreSQL
- Package manager: npm

## Structure

```text
app/
  frontend/   React/Vite application
  backend/    NestJS API application
  shared/     shared TypeScript domain and API types
  docs/       PRD, checklist, and implementation plans
```

## Local Setup

Install dependencies:

```bash
npm install
```

Copy local environment examples when needed:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Start PostgreSQL:

```bash
npm run docker:up
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Run both apps:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Checks

```bash
npm run typecheck
npm run build
```

## Service Ports

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- PostgreSQL: `localhost:5432`
