# Backend Labyrinths And Algorithms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать backend для хранения лабиринтов, генерации Прима/Краскала, поиска BFS/DFS и REST API из PRD.

**Architecture:** Модуль `labyrinths` отвечает за CRUD и валидацию сетки. Модули `generation` и `solving` содержат чистую доменную логику без зависимости от HTTP, чтобы API мог переиспользовать алгоритмы.

**Tech Stack:** NestJS + TypeScript, Prisma + PostgreSQL, REST JSON, npm.

---

## Validation Stack

Use NestJS `ValidationPipe` with:

- `class-validator`;
- `class-transformer`.

DTO validation should use decorators for basic field presence, enum values, length and numeric bounds. For `grid`, DTO validates only that the field is an array. Matrix shape and domain validation stay in service/domain helpers.

Global pipe options:

```ts
whitelist: true
transform: true
forbidNonWhitelisted: false
```

Unknown request fields are stripped/ignored instead of rejected.

## Scope

Входит:

- Prisma model `Labyrinth`;
- admin-only create/delete;
- authenticated list/detail for admin and player;
- admin-only generate endpoint without persistence;
- player-only solve endpoint for BFS/DFS;
- computed `difficulty`;
- validation of size, theme, algorithms, entry/exit and grid.

Не входит:

- frontend admin/player UI;
- сохранение истории прохождений;
- restore endpoint for soft-deleted labyrinths;
- cleanup/purge command for soft-deleted labyrinths;
- audit logging for create/delete operations;
- update endpoint for already saved labyrinths;
- standalone grid validation endpoint;
- custom JSON body size limit for grid payloads;
- ratings/profiles/import/export;
- automated tests, если пользователь отдельно не попросит.

## Demo Seed Data

The seed flow should create demo labyrinths after the admin user exists. Demo names mirror the prototype:

- `Классический 11x11`;
- `Большой лабиринт`;
- `Тёмные катакомбы`;
- `Мини 7x7`.

Demo seed must be idempotent and must not recreate a demo labyrinth if a labyrinth with the same demo name already exists, including soft-deleted rows.

Demo labyrinths use fixed grid fixtures, not random generation, so acceptance checks are reproducible.

Demo fixtures should cover:

- both generation algorithms: Prim and Kruskal;
- all four themes: winter, summer, autumn, spring.
- prototype sizes: `11x11`, `21x15`, `15x15`, `7x7`.
- all demo labyrinths use the seed admin as `createdById`.
- if a demo labyrinth was soft-deleted, seed does not recreate it.
- no `isDemo` field is added; seed identifies demo rows by fixed demo names.

Fixture file:

```text
app/backend/src/modules/labyrinths/fixtures/demo-labyrinths.ts
```

## Files And Modules

Create or modify:

```text
app/backend/prisma/schema.prisma
app/backend/src/modules/labyrinths/labyrinths.module.ts
app/backend/src/modules/labyrinths/labyrinths.controller.ts
app/backend/src/modules/labyrinths/labyrinths.service.ts
app/backend/src/modules/labyrinths/dto/create-labyrinth.dto.ts
app/backend/src/modules/labyrinths/dto/generate-labyrinth.dto.ts
app/backend/src/modules/labyrinths/dto/solve-labyrinth.dto.ts
app/backend/src/modules/labyrinths/fixtures/demo-labyrinths.ts
app/backend/src/modules/labyrinths/domain/difficulty.ts
app/backend/src/modules/labyrinths/domain/grid-validation.ts
app/backend/src/modules/labyrinths/domain/maze-types.ts
app/backend/src/modules/labyrinths/labyrinth.mapper.ts
app/backend/src/modules/generation/generation.module.ts
app/backend/src/modules/generation/generation.service.ts
app/backend/src/modules/generation/domain/prim.generator.ts
app/backend/src/modules/generation/domain/kruskal.generator.ts
app/backend/src/modules/solving/solving.module.ts
app/backend/src/modules/solving/solving.service.ts
app/backend/src/modules/solving/domain/bfs.solver.ts
app/backend/src/modules/solving/domain/dfs.solver.ts
```

Pure domain logic lives in feature-local `domain/` folders. Nest services orchestrate persistence/API flow and call pure domain functions.

## Data Model

`Labyrinth` fields:

- `id`;
- `name`;
- `width`;
- `height`;
- `theme`;
- `generationAlgorithm`;
- `entryMode`;
- `grid` as PostgreSQL `jsonb`;
- `createdById`;
- `createdAt`.
- `deletedAt`.

Entry and exit are stored only inside `grid` as cell values. There are no separate `entryRow`, `entryCol`, `exitRow`, or `exitCol` columns.

Grid format:

```json
[
  ["wall", "entry", "wall"],
  ["wall", "path", "wall"],
  ["wall", "exit", "wall"]
]
```

Coordinates in API responses are zero-based:

- top-left cell is `{ "row": 0, "col": 0 }`;
- `row` indexes the grid row;
- `col` indexes the cell inside the row.

Prisma uses enums for constrained values:

- `LabyrinthTheme`: `WINTER`, `SUMMER`, `AUTUMN`, `SPRING`;
- `GenerationAlgorithm`: `PRIM`, `KRUSKAL`;
- `EntryMode`: `AUTO`, `MANUAL`.

API maps these values to lowercase PRD values:

- `winter`, `summer`, `autumn`, `spring`;
- `prim`, `kruskal`;
- `auto`, `manual`.

All DB-to-API response mapping, including uppercase Prisma enum values to lowercase API values, computed `difficulty`, and computed `entry`/`exit`, should live in `labyrinth.mapper.ts`.

`difficulty` is not stored. It is computed for both list and detail responses:

- `1` when `max(width, height) <= 7`;
- `2` when `max(width, height)` is 9-13;
- `3` when `max(width, height)` is 15-25.

Labyrinth names are unique among active labyrinths:

- trim name before validation and persistence;
- name length is 1-40 characters after trim;
- any characters are allowed after trim;
- active duplicate name returns `LABYRINTH_NAME_EXISTS`;
- soft-deleted names can be reused.
- restore is not supported in this plan.
- cleanup/purge of soft-deleted rows is not included.

Use a PostgreSQL partial unique index in the migration:

```sql
CREATE UNIQUE INDEX labyrinths_active_name_unique
ON "Labyrinth" (lower("name"))
WHERE "deletedAt" IS NULL;
```

The service should still check for an active duplicate before create to return a domain error, but the partial unique index is the final race-condition protection.

## API Contracts

Implement endpoints:

- `GET /api/labyrinths`
- `GET /api/labyrinths/{id}`
- `POST /api/labyrinths/generate`
- `POST /api/labyrinths`
- `DELETE /api/labyrinths/{id}`
- `POST /api/labyrinths/{id}/solve`

Save behavior:

- `POST /api/labyrinths` accepts the final `grid` from the frontend editor;
- backend does not trust the editor and strictly validates the submitted grid before persistence;
- save is rejected with `VALIDATION_ERROR` if the final grid does not contain exactly one `entry` and exactly one `exit`;
- this allows admin canvas edits to be saved without storing a server-side draft.

Access rules:

- list/detail require authenticated `admin` or `player`;
- generate requires `admin`;
- create/delete require `admin`;
- solve requires `player`;
- player cannot create/delete/generate;
- admin cannot call the public solve endpoint.

Search behavior:

- `GET /api/labyrinths?search=...` performs case-insensitive substring search by `name`.
- `search` is trimmed; empty search after trim is ignored.
- non-empty `search` max length is 40 characters; longer search returns `VALIDATION_ERROR`.
- list/detail ignore soft-deleted labyrinths.
- list uses cursor pagination.
- list query order is: soft-delete filter, search filter, fixed sorting, cursor pagination.

List pagination contract:

- query params: `search`, `limit`, `cursor`;
- default `limit` is 20;
- maximum `limit` is 50;
- non-numeric `limit` or `limit < 1` returns `VALIDATION_ERROR`;
- `limit > 50` is clamped to 50;
- sorting is `createdAt desc, id desc`;
- custom sort query parameter is not supported;
- `cursor` is an opaque string generated by backend from the last item;
- invalid cursor returns `VALIDATION_ERROR`;
- cursor internal format is backend-owned; use base64-encoded JSON with `{ "createdAt": string, "id": string }`;
- cursor is not bound to `search`; frontend must reset cursor when search changes;
- response shape is `{ "items": LabyrinthListItem[], "nextCursor": string | null }`.
- `totalCount` is not returned.

`LabyrinthListItem` does not include `grid`. It includes:

- `id`;
- `name`;
- `width`;
- `height`;
- `theme`;
- `generationAlgorithm`;
- `entryMode`;
- `difficulty`;
- `createdAt`.

Full `grid` is returned only by `GET /api/labyrinths/{id}`.

`POST /api/labyrinths` request requires:

- `name`;
- `width`;
- `height`;
- `theme`;
- `generationAlgorithm`;
- `entryMode`;
- `grid`.

`POST /api/labyrinths` response returns the same full detail shape as `GET /api/labyrinths/{id}` after persistence, including `grid`, computed `entry`, and computed `exit`.

Detail response includes all list item fields plus:

- `grid`;
- computed `entry`;
- computed `exit`.

If persisted grid data is corrupted and backend cannot compute exactly one `entry` and one `exit`, detail/solve endpoints return `DATA_INTEGRITY_ERROR`.

Domain error HTTP status mapping:

- `VALIDATION_ERROR` -> 400;
- `UNAUTHORIZED` -> 401;
- `FORBIDDEN` -> 403;
- `NOT_FOUND` -> 404;
- `LABYRINTH_NAME_EXISTS` -> 409;
- `PATH_NOT_FOUND` -> 422;
- `DATA_INTEGRITY_ERROR` -> 500.

Do not add more granular labyrinth error codes in this plan. Invalid size, invalid enum values, invalid grid, invalid entry/exit, and unknown enum/string values return `VALIDATION_ERROR` with field details.

## Algorithm Rules

Generation:

- width/height must be odd and 7-25;
- width/height are final grid dimensions; choosing `11 x 11` returns a grid with 11 rows and 11 columns according to height/width;
- thick-wall maze pattern uses walls on even indexes and rooms/passages on odd indexes internally, while still returning the requested final grid dimensions;
- grid values use `wall`, `path`, `entry`, `exit`;
- when `entryMode = auto`, generated maze includes valid `entry` and `exit`;
- when `entryMode = manual`, generated maze contains only `wall` and `path`; admin places `entry` and `exit` later in the editor;
- when `entryMode = auto`, `POST /api/labyrinths/generate` returns `width`, `height`, `theme`, `generationAlgorithm`, `entryMode`, `grid`, computed `entry`, and computed `exit`;
- when `entryMode = manual`, `POST /api/labyrinths/generate` does not return `entry` or `exit` fields;
- when `entryMode = manual`, `POST /api/labyrinths/generate` returns `width`, `height`, `theme`, `generationAlgorithm`, `entryMode`, and `grid`;
- auto `entry`/`exit` are on perimeter, not corners, and not equal;
- auto `entry` is placed randomly on a valid odd position on the top or left perimeter;
- auto `exit` is placed randomly on a valid odd position on the bottom or right perimeter;
- auto placement must ensure the adjacent inner cell for both `entry` and `exit` is `path`;
- manual `entry`/`exit` must follow the same validation rules as auto: perimeter, not corners, not equal;
- manual editor may replace a perimeter `wall` cell with `entry` or `exit`;
- manual `entry`/`exit` still require adjacent inner `path` cells;
- after manual editing, saved grid does not need to preserve the original thick-wall parity pattern if general grid validation passes;
- `generationAlgorithm` remains metadata for the initial generated maze even if admin edits the grid manually before save;
- `entryMode` remains the value selected on the parameters step and is not recalculated from later grid edits;
- generation must use real randomized Prim and randomized Kruskal algorithms for odd-size grids.
- generators use `Math.random()`;
- deterministic generation seed parameter is not included in this plan.
- generation retry and `GENERATION_FAILED` fallback are not included; generators are expected to return valid mazes.
- separate generation assertion/validation layer is not included.

Grid validation on save:

- matrix has exactly `height` rows and each row has exactly `width` columns;
- all cells are valid cell types;
- exactly one `entry`;
- exactly one `exit`;
- `entry` and `exit` are on perimeter;
- `entry` and `exit` are not in corners;
- `entry` and `exit` are not the same cell;
- adjacent inner cells for `entry` and `exit` are `path`;
- at least one path exists from `entry` to `exit`.

Grid validation errors use a simple field key:

```json
{
  "fields": {
    "grid": "Grid must contain exactly one entry and one exit"
  }
}
```

Do not require per-cell error paths in this plan.

Solving:

- BFS returns shortest path by number of moves;
- DFS returns any valid path;
- solve always uses `entry` and `exit` from the persisted grid;
- solve ignores soft-deleted labyrinths and returns `NOT_FOUND` for them;
- custom `start` or `end` coordinates are not accepted;
- extra fields in solve request are ignored; only `algorithm` is used;
- missing or invalid solve `algorithm` returns `VALIDATION_ERROR`;
- path contains coordinates from entry to exit;
- movement is four-directional;
- solver never walks through `wall`;
- if no path exists, return `PATH_NOT_FOUND`.

Solve response returns only:

- `algorithm`;
- `path`;
- `steps`.

Backend does not compute dead-end count in this plan.

## Implementation Steps

- [x] Extend Prisma schema with `Labyrinth` model and enums.
- [x] Add migration for labyrinth persistence.
- [x] Add PostgreSQL partial unique index for active labyrinth names.
- [x] Implement shared domain types or imports for maze cells and coordinates.
- [x] Implement `computeDifficulty(width, height)`.
- [x] Implement soft delete filtering for list/detail.
- [x] Implement validation helpers for odd size, bounds, entry/exit and grid.
- [x] Implement validation for trimmed unique name length 1-40.
- [x] Implement `labyrinth.mapper.ts` as the single DB-to-API response mapper.
- [x] Implement Prim generator.
- [x] Implement Kruskal generator.
- [x] Implement BFS solver.
- [x] Implement DFS solver.
- [x] Extend seed flow with 2-4 active demo labyrinth fixtures.
- [x] Implement `POST /api/labyrinths/generate` with admin role guard and `entryMode`-specific output.
- [x] Implement `POST /api/labyrinths` with admin role guard and final editor grid validation.
- [x] Implement `GET /api/labyrinths` with case-insensitive substring search by name and cursor pagination.
- [x] Implement `GET /api/labyrinths/{id}`.
- [x] Implement `DELETE /api/labyrinths/{id}` as soft delete with admin role guard.
- [x] Implement `POST /api/labyrinths/{id}/solve` with player role guard.
- [x] Map all errors to PRD error shape.
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

- generate 11x11 Prim maze with `entryMode = auto` -> grid returned, entry/exit valid, path exists;
- generate 11x11 Prim maze with `entryMode = manual` -> grid returned without entry/exit cells and without `entry`/`exit` response fields;
- generate even width -> `VALIDATION_ERROR`;
- generate as player -> forbidden error;
- create labyrinth as admin -> 201 and appears in list;
- create labyrinth as admin -> response is full detail with `grid`, computed `entry`, and computed `exit`;
- create labyrinth with invalid submitted grid -> `VALIDATION_ERROR`;
- create labyrinth without entry or exit after manual generation -> `VALIDATION_ERROR`;
- create duplicate active name -> `LABYRINTH_NAME_EXISTS`;
- create labyrinth as player -> forbidden error;
- list with `search` filters by case-insensitive substring in name;
- list with search longer than 40 characters -> `VALIDATION_ERROR`;
- list supports cursor pagination;
- list returns `nextCursor` when more items exist;
- list with invalid cursor -> `VALIDATION_ERROR`;
- list with non-numeric or too small limit -> `VALIDATION_ERROR`;
- list with limit greater than 50 -> uses 50;
- list items do not include `grid`;
- soft-deleted labyrinths are absent from list/detail;
- soft-deleted name can be reused by a new labyrinth;
- list response includes computed `difficulty`;
- corrupted persisted grid without valid entry/exit -> `DATA_INTEGRITY_ERROR`;
- delete as admin -> 204 and sets `deletedAt`;
- repeated delete -> `NOT_FOUND`;
- solve as player with BFS -> valid shortest path;
- solve as player with DFS -> valid path;
- solve without algorithm -> `VALIDATION_ERROR`;
- solve as admin -> forbidden error;
- solve soft-deleted labyrinth -> `NOT_FOUND`;
- solve missing labyrinth -> `NOT_FOUND`.
- seed creates demo labyrinths for list/player verification.

Checklist coverage:

- API-03..API-09;
- API-10 for labyrinth errors;
- backend prerequisite for ADM-CREATE, ADM-DELETE, PLAYER and AUTO sections.

## Acceptance Criteria

- Labyrinth persistence matches PRD entity fields.
- `difficulty` is computed and not stored.
- Generated mazes are solvable.
- BFS and DFS follow PRD behavior.
- Role restrictions are enforced.
- Soft-deleted labyrinths are hidden from public API reads.
- Active labyrinth name uniqueness is enforced by PostgreSQL partial unique index.
- `labyrinth.mapper.ts` owns DB enum to API lowercase mapping.
- All API responses and errors match PRD.
