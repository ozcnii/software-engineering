# Backend Auth And DB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать backend-основу пользователей, ролей, seed-админа и auth API из PRD.

**Architecture:** NestJS backend использует Prisma для PostgreSQL. Модули `users` и `auth` разделены: `users` отвечает за хранение и поиск пользователей, `auth` отвечает за регистрацию игрока, вход, выход и проверку текущего пользователя. Auth реализуется через JWT в httpOnly cookie.

**Tech Stack:** NestJS + TypeScript, Prisma + PostgreSQL, Docker Compose, REST JSON, npm.

---

## Scope

Входит:

- Prisma model `User`;
- миграция БД;
- seed-скрипт начального администратора;
- регистрация только роли `player`;
- login/logout API;
- `GET /api/auth/me`;
- JWT в httpOnly cookie;
- CORS с credentials для Vite frontend;
- единый формат ошибок API;
- базовый role guard для будущих admin/player endpoints.

Не входит:

- frontend auth UI;
- лабиринты и алгоритмы;
- automated tests, если пользователь отдельно не попросит.

## Files And Modules

Create or modify:

```text
app/backend/prisma/schema.prisma
app/backend/prisma/seed.ts
app/backend/src/main.ts
app/backend/src/app.module.ts
app/backend/src/shared/errors/api-error.filter.ts
app/backend/src/shared/errors/api-error.ts
app/backend/src/modules/users/users.module.ts
app/backend/src/modules/users/users.service.ts
app/backend/src/modules/auth/auth.module.ts
app/backend/src/modules/auth/auth.controller.ts
app/backend/src/modules/auth/auth.service.ts
app/backend/src/modules/auth/dto/login.dto.ts
app/backend/src/modules/auth/dto/register.dto.ts
app/backend/src/modules/auth/jwt.types.ts
app/backend/src/modules/auth/guards/roles.guard.ts
app/backend/src/modules/auth/decorators/roles.decorator.ts
```

## Data Model

`User` fields:

- `id` — UUID string primary key;
- `login` — unique lowercase string, 4-8 chars;
- `passwordHash` — string;
- `role` — enum `ADMIN` or `PLAYER`;
- `createdAt` — timestamp.

Public API maps DB roles to lowercase PRD values:

- `ADMIN` -> `admin`;
- `PLAYER` -> `player`.

## Seed Admin

Seed script creates one admin user if it does not exist.

Seed credentials come from env:

```text
SEED_ADMIN_LOGIN=admin
SEED_ADMIN_PASSWORD=admin
```

The local example uses `admin / admin`. If these credentials are changed later, update `app/docs/CHECKLIST.md` or the implementation README before acceptance.

## Auth Mechanism

Use JWT stored in an httpOnly cookie.

Cookie settings for local development:

```ts
httpOnly: true
sameSite: 'lax'
secure: false
maxAge: 24 * 60 * 60 * 1000
```

JWT lifetime is 24 hours.

CSRF protection is not added in this plan. `sameSite: 'lax'` is accepted for the course/local implementation.

Logout behavior:

- `POST /api/auth/logout` clears the cookie with an expired `Set-Cookie`;
- token blacklist is not implemented;
- frontend clears current user state after successful logout.

CORS behavior:

- allow origin `http://localhost:5173`;
- enable `credentials: true`;
- frontend API client must send requests with credentials enabled.

## Validation Rules

Login:

- length: 4-8;
- allowed characters: latin letters, digits and underscore;
- case-insensitive;
- stored lowercase;
- `Admin` and `admin` are the same login.

Password:

- length: 4-10 after trimming edge spaces;
- any non-empty characters inside the trimmed string are allowed.

Password hashing:

- use `bcrypt`;
- passwords are never stored or returned in plaintext.

## Error Codes

Auth-related errors:

- `VALIDATION_ERROR`;
- `LOGIN_ALREADY_EXISTS`;
- `INVALID_CREDENTIALS`;
- `UNAUTHORIZED`;
- `FORBIDDEN`.

Rules:

- invalid request fields return `VALIDATION_ERROR` with `fields`;
- duplicate register login returns `LOGIN_ALREADY_EXISTS`;
- wrong login or password during login returns generic `INVALID_CREDENTIALS`;
- missing or expired cookie returns `UNAUTHORIZED`;
- insufficient role returns `FORBIDDEN`.

## API Contracts

### POST /api/auth/register

Request:

```json
{
  "login": "maria",
  "password": "1234",
  "passwordConfirm": "1234",
  "acceptedTerms": true
}
```

Behavior:

- validate login length 4-8;
- validate password length 4-10;
- require password confirmation match;
- require accepted terms;
- reject duplicate login;
- always create role `player`;
- never accept role from client.

### POST /api/auth/login

Request:

```json
{
  "login": "admin",
  "password": "admin"
}
```

Behavior:

- validate login/password presence and length;
- verify password hash;
- return user id, login and role;
- set JWT httpOnly cookie.

### POST /api/auth/logout

Behavior:

- clears JWT cookie;
- returns 204.

### GET /api/auth/me

Behavior:

- requires valid JWT cookie;
- returns current user.

Response:

```json
{
  "user": {
    "id": "uuid",
    "login": "admin",
    "role": "admin"
  }
}
```

## Implementation Steps

- [x] Extend Prisma schema with `User` model and role enum.
- [x] Add Prisma migration for users.
- [x] Add `bcrypt` dependency and service-level hashing helper.
- [x] Implement `UsersService` for create/find-by-login/find-by-id.
- [x] Implement seed script that creates admin if missing.
- [x] Implement DTOs for login and register request bodies.
- [x] Implement `AuthService.registerPlayer`.
- [x] Implement `AuthService.login`.
- [x] Implement `AuthService.logout`.
- [x] Implement `AuthService.getCurrentUser`.
- [x] Implement `AuthController` routes under `/api/auth`.
- [x] Add JWT cookie creation and clearing.
- [x] Add CORS config for `http://localhost:5173` with credentials.
- [x] Add global API error filter matching PRD error shape.
- [x] Add role metadata decorator and guard for later admin/player endpoints.
- [x] Update backend README or root README with seed env variables and local admin example.
- [x] Update `app/docs/plans/STATUS.md` after implementation and verification.

## Verification

Manual/API checks after implementation:

```bash
cd app
npm run docker:up
npm run prisma:migrate
npm run seed
npm run dev:backend
```

Verify with curl/Postman:

- register valid user -> 201, role `player`, no password in response;
- register duplicate login -> error `LOGIN_ALREADY_EXISTS`;
- register with mismatched passwords -> `VALIDATION_ERROR`;
- register `Admin` after `admin` exists -> duplicate login behavior because login is case-insensitive;
- login as seeded admin -> 200, role `admin`;
- successful login sets httpOnly cookie;
- login as registered player -> 200, role `player`;
- wrong password -> `INVALID_CREDENTIALS`;
- `GET /api/auth/me` with valid cookie -> current user;
- `GET /api/auth/me` without cookie -> `UNAUTHORIZED`;
- logout -> 204.

Checklist coverage:

- AUTH-04;
- AUTH-05;
- AUTH-06;
- AUTH-07;
- API-01;
- API-02;
- API-10;
- auth prerequisite for frontend session restore;
- backend prerequisite for ADM-LIST-04.

## Acceptance Criteria

- Public registration cannot create admins.
- Seed admin exists after running seed.
- Passwords are stored hashed and never returned.
- JWT is stored only in httpOnly cookie.
- `GET /api/auth/me` restores current user from cookie.
- CORS allows frontend credentials from `http://localhost:5173`.
- Auth responses match PRD role naming.
- API errors match the PRD error shape.
- Role guard exists for later protected endpoints.
