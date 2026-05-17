# Frontend Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Привести frontend к поддерживаемой soft feature-sliced структуре, убрать дублирование и разделить крупные компоненты без изменения продуктового поведения.

**Architecture:** `features/auth`, `features/admin` и `features/player` остаются основными вертикалями приложения. Внутри каждой feature появляются локальные `components/`, `hooks/`, `model/` и `lib/`; общий код выносится в `shared/` только если он реально используется минимум в двух feature. CSS остается в одном глобальном файле, но разделяется на понятные секции и очищается от дублей.

**Tech Stack:** React + Vite + TypeScript, REST JSON API, глобальный CSS, npm.

---

## Problem Statement

Frontend уже реализует auth, admin и player flows, но после нескольких этапов разработки в нем накопились поддерживаемые риски:

- крупные компоненты держат состояние, API-запросы, обработчики, layout и мелкие UI-фрагменты одновременно;
- похожие функции повторяются в admin/player списках, auth формах, error handling и форматировании;
- в одном файле встречается несколько разнородных компонентов;
- глобальный `styles.css` стал большим и сложным для безопасной правки;
- новая доработка UI сейчас требует держать слишком много контекста в голове.

Рефакторинг нужен как отдельный план до финального acceptance, чтобы закрыть технический долг без смешивания с проверкой PRD.

## Current Behavior

- `app/frontend/src/features/player/PlayerLayout.tsx` содержит основной player orchestration, auto-solve flow, manual flow, модальные состояния, загрузку деталей и keyboard/timer logic.
- `app/frontend/src/features/admin/AdminCreateWizard.tsx` содержит несколько шагов wizard, генерацию, сохранение, состояние формы и layout.
- `app/frontend/src/features/admin/AdminMazeEditor.tsx` содержит editor state, grid rendering и инструменты редактирования.
- `AdminLabyrinthList.tsx` и `PlayerLabyrinthList.tsx` имеют похожие паттерны поиска, загрузки, cursor pagination, skeleton/error/empty states.
- `LoginForm.tsx` и `RegisterForm.tsx` имеют похожую обработку ошибок и submit/loading states.
- `app/frontend/src/app/styles.css` содержит стили разных feature вперемешку и может иметь повторяющиеся правила для cards, lists, forms, modal, skeleton, toolbar.

## Target Behavior

Пользовательское поведение должно остаться тем же:

- маршруты, тексты, роли, API calls, auth cookie flow и визуальные сценарии не меняются;
- `CHECKLIST.md` acceptance items должны продолжать проходить;
- PRD/API contracts не меняются;
- автоматические тесты не добавляются.

Внутренняя структура должна стать такой:

- feature-level orchestration остается в feature layout/container файлах;
- локальные компоненты лежат рядом с feature, где используются;
- локальная бизнес-логика feature лежит в `hooks/`, `model/` или `lib/`;
- реально повторяемые UI primitives и helpers лежат в `shared/`;
- один файл отвечает за одну понятную ответственность;
- глобальный CSS сохранен, но разбит на секции по слоям и feature.

## Open Questions

На момент создания плана открытых продуктовых, UX, API или архитектурных вопросов нет: пользователь подтвердил широкий frontend cleanup, soft feature-sliced структуру, один глобальный CSS и строгую verification стратегию.

Если во время реализации появится необходимость изменить UX, API contract, routing, schema, checklist behavior или добавить новую зависимость, нужно остановиться и согласовать изменение отдельно.

## Constraints And Non-Goals

Constraints:

- не менять PRD/API поведение;
- не добавлять automated tests без отдельного запроса;
- не добавлять новые frontend libraries без отдельного согласования;
- не менять backend;
- не менять database schema;
- не переименовывать публичные routes;
- не удалять чужие изменения;
- не коммитить без явной команды пользователя;
- после каждого крупного блока запускать `npm run typecheck` и targeted browser smoke;
- в конце запускать `npm run typecheck`, `npm run build` и полный frontend smoke по затронутым flows.

Non-goals:

- pixel-perfect redesign;
- миграция на CSS Modules/Tailwind/styled-components;
- изменение визуального прототипа;
- добавление сохраненного player progress;
- изменение алгоритмов лабиринта;
- переписывание backend API clients на другой transport;
- формальная тестовая инфраструктура.

## Affected Areas

Primary files:

```text
app/frontend/src/app/styles.css
app/frontend/src/features/auth/LoginForm.tsx
app/frontend/src/features/auth/RegisterForm.tsx
app/frontend/src/features/admin/AdminCreateWizard.tsx
app/frontend/src/features/admin/AdminMazeEditor.tsx
app/frontend/src/features/admin/AdminLabyrinthList.tsx
app/frontend/src/features/player/PlayerLayout.tsx
app/frontend/src/features/player/PlayerLabyrinthList.tsx
app/frontend/src/features/player/playerState.ts
```

Expected new folders:

```text
app/frontend/src/shared/hooks/
app/frontend/src/shared/lib/
app/frontend/src/shared/ui/
app/frontend/src/features/auth/components/
app/frontend/src/features/auth/lib/
app/frontend/src/features/admin/components/
app/frontend/src/features/admin/hooks/
app/frontend/src/features/admin/lib/
app/frontend/src/features/admin/model/
app/frontend/src/features/player/components/
app/frontend/src/features/player/hooks/
app/frontend/src/features/player/lib/
app/frontend/src/features/player/model/
```

The exact final file list may be smaller if a candidate extraction would be used only once and would not reduce complexity.

## UX States

All existing states must be preserved:

- auth loading, validation, API error and success states;
- admin list loading, search empty, global empty, error, load-more and delete modal states;
- admin create wizard step states, generation loading, save loading, validation and editor states;
- player initial choose-labyrinth state, detail loading, detail error, selected state, manual mode, auto mode, reset/exit confirmations and finish modal;
- responsive behavior of auth/admin/player pages;
- keyboard behavior for player manual controls.

No new visible UI states should be introduced unless they replace an existing state with identical behavior and copy.

## Data Flow / API / State Mapping

API clients remain in:

```text
app/frontend/src/shared/api/authApi.ts
app/frontend/src/shared/api/labyrinthsApi.ts
app/frontend/src/shared/api/client.ts
```

Data flow must remain:

- auth forms call `authApi`, then update app auth state through existing callbacks;
- admin list calls `labyrinthsApi.listLabyrinths` and `deleteLabyrinth`;
- admin wizard calls `generateLabyrinth` and `createLabyrinth`;
- player list calls `listLabyrinths`;
- player detail calls `getLabyrinth`;
- auto-solve calls `solveLabyrinth`;
- no component should start using hardcoded final data;
- no feature should bypass the existing API client layer.

State ownership rules:

- page-level selected entity and cross-panel flow state stay in feature layout/container;
- reusable state transitions move to feature `model/` or `hooks/`;
- pure formatting and error helpers move to `shared/lib/`;
- hooks in `shared/hooks/` must be product-agnostic or accept callbacks/config instead of importing feature-specific APIs;
- shared UI components must be presentational and must not own API requests.

## Target Frontend Structure

Target shape:

```text
app/frontend/src/
  app/
    App.tsx
    router.tsx
    styles.css
  features/
    auth/
      components/
      lib/
      LoginForm.tsx
      RegisterForm.tsx
      AuthScreen.tsx
    admin/
      components/
      hooks/
      lib/
      model/
      AdminLayout.tsx
      AdminLabyrinthList.tsx
      AdminCreateWizard.tsx
      AdminMazeEditor.tsx
      AdminDeleteModal.tsx
      AdminAboutPage.tsx
      AdminSystemPage.tsx
    player/
      components/
      hooks/
      lib/
      model/
      PlayerLayout.tsx
      PlayerLabyrinthList.tsx
      PlayerThemePicker.tsx
      MazeGrid.tsx
      ManualControls.tsx
      AutoSolvePanel.tsx
      PlayerStatsPanel.tsx
      PlayerInfoModals.tsx
  shared/
    api/
    hooks/
    lib/
    types/
    ui/
```

This plan intentionally keeps current feature entry files where routing/imports already point to them. Large entry files should become thin orchestration shells rather than moving route-level names to new paths in the same refactor.

## Shared Extraction Rules

Move code to `shared/` only when all rules are true:

- the code is used by at least two feature areas or two independent screens;
- the extracted unit has a stable, generic name;
- the unit does not import from `features/*`;
- extraction reduces duplication or file size meaningfully;
- extraction does not hide feature-specific decisions behind vague props.

Keep code local inside a feature when:

- it is used once;
- it depends on feature state shape;
- it would require a large generic interface only to avoid a few lines;
- it makes the call site harder to read.

## Implementation Steps

### Task 1: Baseline And Inventory

**Files:**

- Modify: `app/docs/plans/07-frontend-refactor.md`
- Modify: `app/docs/plans/STATUS.md`

- [x] Confirm `git status --short` before starting.
- [x] Read `app/docs/plans/STATUS.md`, `app/docs/PRD.md`, `app/docs/CHECKLIST.md`, `sandbox/index.html`, `app/docs/plans/00-implementation-roadmap.md`, `01-project-scaffold.md`, `02-backend-auth-db.md`, `03-backend-labyrinths-algorithms.md`, `04-frontend-auth-admin.md`, `05-frontend-player.md`, `06-integration-acceptance.md`, and this plan.
- [x] Confirm plans `01`..`05` are marked `Done`; if not, stop and report the dependency gap.
- [x] Update `STATUS.md`: `Frontend refactor` -> `In progress`.
- [x] Record the current largest frontend files with `wc -l app/frontend/src/**/*.tsx app/frontend/src/app/styles.css` or equivalent shell glob that works locally.
- [x] Scan for duplicate helpers and leftover junk with `rg "function |const .* = \\(|TODO|FIXME|console\\." app/frontend/src`.
- [x] Run baseline command check:

```bash
cd app
npm run typecheck
```

Expected: command passes before refactor. If it fails because of existing code, stop and report the exact error before changing files.

### Task 2: Create Folder Skeleton

**Files:**

- Create folders under `app/frontend/src/shared/hooks/`, `shared/lib/`, `shared/ui/`
- Create folders under `features/auth/{components,lib}/`
- Create folders under `features/admin/{components,hooks,lib,model}/`
- Create folders under `features/player/{components,hooks,lib,model}/`

- [x] Create only folders needed by the next tasks. Use `.gitkeep` only if a folder must exist before files are added.
- [x] Do not move route entry files yet.
- [x] Confirm imports still compile:

```bash
cd app
npm run typecheck
```

Expected: command passes.

### Task 3: Extract Shared Pure Helpers

**Files:**

- Create: `app/frontend/src/shared/lib/errors.ts`
- Create: `app/frontend/src/shared/lib/format.ts`
- Create if needed: `app/frontend/src/shared/lib/labyrinth.ts`
- Modify duplicated callers in auth/admin/player features.

Extract only pure helpers with identical behavior, for example:

- API error message normalization;
- elapsed-time formatting;
- difficulty-to-label or difficulty-to-stars formatting;
- coordinate/key helpers used by both admin and player maze rendering.

- [x] Move duplicated pure helpers to `shared/lib/*`.
- [x] Keep helper names concrete, for example `getErrorMessage`, `formatElapsedTime`, `formatDifficultyStars`.
- [x] Replace local duplicates with imports.
- [x] Do not change visible text returned by helpers.
- [x] Do not move feature-specific validation into shared unless both auth forms use exactly the same rule.
- [x] Run:

```bash
cd app
npm run typecheck
```

Expected: command passes.

Targeted smoke:

- login form still shows API errors;
- admin/player list difficulty display is unchanged;
- player timer display is unchanged.

### Task 4: Extract Shared Hooks

**Files:**

- Create: `app/frontend/src/shared/hooks/useDebouncedValue.ts`
- Create if needed: `app/frontend/src/shared/hooks/useInterval.ts`
- Create if needed: `app/frontend/src/shared/hooks/useIntersectionLoadMore.ts`
- Modify: admin/player list components and player timer/animation code as needed.

- [x] Extract debounce behavior used by search inputs into `useDebouncedValue`.
- [x] Extract interval behavior only if both timer and animation/list logic benefit from the same generic hook.
- [x] Extract intersection observer load-more behavior only if admin and player lists can use one product-agnostic hook without hiding their API details.
- [x] Ensure hooks clean up timers/observers on unmount.
- [x] Ensure stale request guards in list components are preserved.
- [x] Run:

```bash
cd app
npm run typecheck
```

Expected: command passes.

Targeted smoke:

- admin search still debounces and paginates;
- player search still debounces and paginates;
- player timer and auto animation still stop when expected.

### Task 5: Extract Shared UI Primitives

**Files:**

- Create: `app/frontend/src/shared/ui/AppModal.tsx`
- Create if needed: `app/frontend/src/shared/ui/InlineError.tsx`
- Create if needed: `app/frontend/src/shared/ui/ListSkeleton.tsx`
- Create if needed: `app/frontend/src/shared/ui/RadioGroup.tsx`
- Modify modal/error/skeleton/radio call sites.

- [x] Extract modal shell only if admin delete modal, player confirmations, finish modal, and info modals can keep identical semantics.
- [x] Preserve accessible attributes and focus-relevant markup already present.
- [x] Extract inline error rendering only for repeated same-level error blocks.
- [x] Extract list skeleton only if admin and player placeholders remain visually equivalent.
- [x] Extract radio group only if theme, algorithm, display mode, and auth/admin usage can keep clear labels and controlled state without generic complexity.
- [x] Do not create a shared `Button` or `Card` unless there is a direct duplicate and the result stays simpler than current markup.
- [x] Run:

```bash
cd app
npm run typecheck
```

Expected: command passes.

Targeted smoke:

- admin delete confirmation works;
- player reset/exit/warning/finish/info modals work;
- radio groups still update state.

### Task 6: Refactor Auth Feature

**Files:**

- Modify: `app/frontend/src/features/auth/LoginForm.tsx`
- Modify: `app/frontend/src/features/auth/RegisterForm.tsx`
- Create if useful: `app/frontend/src/features/auth/lib/authValidation.ts`
- Create if useful: `app/frontend/src/features/auth/components/AuthField.tsx`

- [x] Extract repeated auth validation only when rules are identical.
- [x] Extract repeated field markup only if it keeps labels, `autoComplete`, disabled/loading states and error text unchanged.
- [x] Keep `LoginForm.tsx` and `RegisterForm.tsx` as readable feature entry components.
- [x] Preserve redirects and app auth state update behavior.
- [x] Run:

```bash
cd app
npm run typecheck
```

Expected: command passes.

Targeted smoke:

- admin login works;
- player registration works;
- duplicate/mismatch auth errors are still visible.

### Task 7: Refactor Admin Labyrinth List

**Files:**

- Modify: `app/frontend/src/features/admin/AdminLabyrinthList.tsx`
- Create if useful: `app/frontend/src/features/admin/components/AdminLabyrinthCard.tsx`
- Create if useful: `app/frontend/src/features/admin/components/AdminListToolbar.tsx`
- Create if useful: `app/frontend/src/features/admin/hooks/useAdminLabyrinthList.ts`

- [x] Move API/search/pagination state to `useAdminLabyrinthList` only if it makes `AdminLabyrinthList.tsx` primarily render layout.
- [x] Move individual card markup to `AdminLabyrinthCard`.
- [x] Keep delete flow and selected item behavior unchanged.
- [x] Preserve admin-only access behavior from existing routes/layout.
- [x] Preserve empty, search-empty, loading, loading-more and error states.
- [x] Run:

```bash
cd app
npm run typecheck
```

Expected: command passes.

Targeted smoke:

- admin list loads;
- search filters;
- load-more still works;
- delete modal opens and closes without deleting the wrong item.

### Task 8: Refactor Admin Create Wizard

**Files:**

- Modify: `app/frontend/src/features/admin/AdminCreateWizard.tsx`
- Create if useful: `app/frontend/src/features/admin/components/CreateWizardSteps.tsx`
- Create if useful: `app/frontend/src/features/admin/components/CreateParamsStep.tsx`
- Create if useful: `app/frontend/src/features/admin/components/CreateEditorStep.tsx`
- Create if useful: `app/frontend/src/features/admin/components/CreateSaveStep.tsx`
- Create if useful: `app/frontend/src/features/admin/model/createWizardState.ts`
- Create if useful: `app/frontend/src/features/admin/lib/createWizardValidation.ts`
- Create if useful: `app/frontend/src/features/admin/hooks/useCreateWizard.ts`

- [x] Separate wizard step indicator/navigation from step content.
- [x] Move parameter validation into feature `lib` or `model` if it is pure and reused across handlers.
- [x] Move generation/save orchestration into a hook only if it reduces `AdminCreateWizard.tsx` without hiding UI decisions.
- [x] Preserve generated/manual creation modes exactly.
- [x] Preserve all validation messages, disabled states, loading states and success/error handling.
- [x] Keep API calls through `labyrinthsApi`.
- [x] Run:

```bash
cd app
npm run typecheck
```

Expected: command passes.

Targeted smoke:

- manual wizard path still works;
- auto-generation path still works;
- save still creates a labyrinth visible in admin list.

### Task 9: Refactor Admin Maze Editor

**Files:**

- Modify: `app/frontend/src/features/admin/AdminMazeEditor.tsx`
- Create if useful: `app/frontend/src/features/admin/components/MazeEditorGrid.tsx`
- Create if useful: `app/frontend/src/features/admin/components/MazeEditorToolbar.tsx`
- Create if useful: `app/frontend/src/features/admin/hooks/useMazeEditor.ts`
- Create if useful: `app/frontend/src/features/admin/lib/mazeEditorRules.ts`

- [x] Split toolbar controls from grid rendering.
- [x] Move editor state transitions into `useMazeEditor` only if it keeps props smaller than the current file's internal complexity.
- [x] Preserve wall/path/entry/exit editing behavior.
- [x] Preserve generated maze editing behavior.
- [x] Preserve validation that prevents invalid maze save.
- [x] Run:

```bash
cd app
npm run typecheck
```

Expected: command passes.

Targeted smoke:

- manual editor paints cells;
- entry and exit can still be placed according to existing rules;
- generated maze can still be adjusted before save.

### Task 10: Refactor Player List

**Files:**

- Modify: `app/frontend/src/features/player/PlayerLabyrinthList.tsx`
- Create if useful: `app/frontend/src/features/player/components/PlayerLabyrinthCard.tsx`
- Create if useful: `app/frontend/src/features/player/components/PlayerListToolbar.tsx`
- Create if useful: `app/frontend/src/features/player/hooks/usePlayerLabyrinthList.ts`

- [x] Reuse shared debounce/load-more helpers where already extracted.
- [x] Move card markup to `PlayerLabyrinthCard`.
- [x] Preserve selected item state, detail loading callback and detail error behavior.
- [x] Preserve global empty and search-empty copy.
- [x] Preserve difficulty stars and theme labels.
- [x] Run:

```bash
cd app
npm run typecheck
```

Expected: command passes.

Targeted smoke:

- player list loads;
- search filters;
- load-more still works;
- selecting a labyrinth loads detail and highlights the selected card.

### Task 11: Refactor Player Runtime

**Files:**

- Modify: `app/frontend/src/features/player/PlayerLayout.tsx`
- Move/modify: `app/frontend/src/features/player/playerState.ts` -> `app/frontend/src/features/player/model/playerState.ts`
- Create if useful: `app/frontend/src/features/player/hooks/usePlayerRun.ts`
- Create if useful: `app/frontend/src/features/player/hooks/usePlayerTimer.ts`
- Create if useful: `app/frontend/src/features/player/hooks/usePlayerKeyboardMovement.ts`
- Create if useful: `app/frontend/src/features/player/hooks/useAutoSolveRun.ts`
- Create if useful: `app/frontend/src/features/player/lib/playerMovement.ts`
- Create if useful: `app/frontend/src/features/player/components/PlayerHeader.tsx`
- Create if useful: `app/frontend/src/features/player/components/PlayerBoardSection.tsx`
- Create if useful: `app/frontend/src/features/player/components/PlayerSidebar.tsx`

- [x] Move `playerState.ts` into `model/` and update imports.
- [x] Extract pure movement rules into `playerMovement.ts` if they can be tested manually through existing UI behavior.
- [x] Extract keyboard subscription into a hook that preserves manual-only activation and cleanup.
- [x] Extract timer logic into a hook while preserving start/stop rules.
- [x] Extract auto-solve orchestration only if the hook interface remains explicit: labyrinth id, display mode, speed, current progress source and callbacks.
- [x] Keep `PlayerLayout.tsx` as the route-level coordinator for selected labyrinth, modals, mode and child composition.
- [x] Preserve the solved bugs from the previous implementation: square maze grid, stale list request guards, solve double-start guard, and manual-only auto warning.
- [x] Run:

```bash
cd app
npm run typecheck
```

Expected: command passes.

Targeted smoke:

- manual movement via keyboard and d-pad works;
- wall moves do not increment steps;
- reset/exit confirmations still appear only with progress;
- instant волновой алгоритм/метод правой руки moves to exit;
- animated волновой алгоритм/метод правой руки animates at selected speed and disables conflicting controls.

### Task 12: Restructure Global CSS

**Files:**

- Modify: `app/frontend/src/app/styles.css`

CSS remains one file. Reorganize it into stable sections:

```css
/* 1. Design tokens */
/* 2. Base */
/* 3. Shared layout */
/* 4. Shared controls */
/* 5. Shared feedback and modals */
/* 6. Auth */
/* 7. Admin */
/* 8. Player */
/* 9. Responsive */
```

- [x] Move rules into sections without changing selectors unnecessarily.
- [x] Merge exact duplicate declarations only when cascade behavior stays the same.
- [x] Remove dead selectors only after `rg` confirms no matching class usage in `app/frontend/src`.
- [x] Keep responsive breakpoints and player grid sizing behavior intact.
- [x] Do not introduce CSS Modules or new styling tools.
- [x] Run:

```bash
cd app
npm run typecheck
npm run build
```

Expected: both commands pass.

Targeted smoke:

- auth page remains usable on desktop and mobile widths;
- admin list/create/editor remain readable;
- player grid remains square and does not overflow;
- modal overlays still render correctly.

### Task 13: Final Cleanup And Documentation

**Files:**

- Modify: `app/docs/plans/07-frontend-refactor.md`
- Modify: `app/docs/plans/STATUS.md`

- [x] Run leftover scan:

```bash
cd app
rg "TODO|FIXME|console\\.|mock|hardcoded" frontend/src
```

Expected: no newly introduced leftover junk. Existing legitimate text must be reviewed before changing.

- [x] Run broad type/build verification:

```bash
cd app
npm run typecheck
npm run build
```

Expected: both commands pass.

- [x] Run final browser smoke with backend/frontend dev servers:

```bash
cd app
npm run docker:up
npm run prisma:migrate
npm run seed
npm run dev:backend
npm run dev:frontend
```

Verify:

- admin login;
- player registration;
- admin list/search/load-more/delete modal open-close;
- admin manual create wizard;
- admin generated create wizard;
- player list/search/detail;
- player manual movement and finish/reset/exit states;
- player instant and animated auto-solve.

- [x] Confirm no API, backend, DB, PRD or checklist files changed; only this plan and `STATUS.md` should change in documentation during the refactor unless the user separately approves more.
- [x] Update `STATUS.md`: `Frontend refactor` -> `Done` only after verification passes; otherwise `Blocked` with reason.
- [x] Mark all checkboxes in this plan that were completed.
- [x] Ask: `Провести deep review?`

## Verification Steps

Per major block:

```bash
cd app
npm run typecheck
```

For CSS and final verification:

```bash
cd app
npm run build
```

For browser smoke:

```bash
cd app
npm run docker:up
npm run prisma:migrate
npm run seed
npm run dev:backend
npm run dev:frontend
```

Expected final result:

- `npm run typecheck` passes;
- `npm run build` passes;
- browser smoke covers auth/admin/player flows listed above;
- no new console/TODO/FIXME/mock/hardcoded leftovers in refactored files;
- existing PRD/CHECKLIST behavior is unchanged.

## Risks And Edge Cases

- Moving state into hooks can introduce stale closures in search, pagination, timer and auto animation. Preserve request id guards and cleanup functions.
- Shared components can become too generic. If props grow unclear, keep the component local instead of forcing reuse.
- CSS reordering can change cascade behavior. Move in small blocks and verify affected screens after each section.
- Player keyboard handlers can become active on the wrong tab or after unmount. Verify manual-only activation and cleanup.
- Auto-solve has race-sensitive disabled states. Preserve the existing busy guard before and during animation.
- Auth forms depend on visible backend error messages. Do not normalize messages into vague generic copy.
- Admin editor has domain-specific constraints around entry/exit/walls. Do not move those rules into shared UI.
- Large file reduction should not be achieved by creating one equally large hook. If a hook becomes too broad, split by responsibility or keep logic in the feature layout.

## Acceptance Criteria

- No behavior change relative to implemented plans `04` and `05`.
- `PlayerLayout.tsx`, `AdminCreateWizard.tsx`, `AdminMazeEditor.tsx`, `AdminLabyrinthList.tsx` and `PlayerLabyrinthList.tsx` are smaller and have clearer responsibilities.
- Repeated helpers for errors, formatting, debounce/load-more and repeated UI shells are extracted where reuse is real.
- `styles.css` remains global but has predictable sections and fewer duplicates.
- `npm run typecheck` and `npm run build` pass.
- Targeted browser smoke passes for auth, admin and player flows.
- `STATUS.md` accurately reflects the refactor plan state.
