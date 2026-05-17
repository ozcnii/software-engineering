# Frontend Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать React frontend для экрана игрока: выбор лабиринта, локальные темы, ручное прохождение и авто-решение.

**Architecture:** `features/player` содержит layout игрока, список лабиринтов, HTML grid visualizer, ручное управление, auto-solve panel, статистику и модальные окна. API-запросы идут через `shared/api/labyrinthsApi.ts`.

**Tech Stack:** React + Vite + TypeScript, HTML/CSS grid rendering, REST JSON API, npm.

---

## Scope

Входит:

- player layout from prototype;
- labyrinth list/search;
- load selected labyrinth;
- local theme switching;
- HTML grid maze rendering;
- manual movement with keyboard and d-pad;
- reset and exit level;
- auto-solve UI for волновой алгоритм/метод правой руки;
- animation/immediate modes;
- speed 1-10 steps/sec;
- player info modals.

Не входит:

- admin UI;
- backend algorithms;
- saved progress/history/ratings;
- automated tests, если пользователь отдельно не попросит.

## Files And Modules

Create or modify:

```text
app/frontend/src/features/player/PlayerLayout.tsx
app/frontend/src/features/player/PlayerLabyrinthList.tsx
app/frontend/src/features/player/PlayerThemePicker.tsx
app/frontend/src/features/player/MazeGrid.tsx
app/frontend/src/features/player/ManualControls.tsx
app/frontend/src/features/player/AutoSolvePanel.tsx
app/frontend/src/features/player/PlayerStatsPanel.tsx
app/frontend/src/features/player/PlayerInfoModals.tsx
app/frontend/src/features/player/playerState.ts
app/frontend/src/shared/api/labyrinthsApi.ts
```

## UI Source

Match `sandbox/index.html` as closely as practical for both player workflow and visual style.

Player controls should follow the sandbox UI:

- local theme selector is a radio list;
- auto-solve algorithm selector is a radio list;
- auto display mode selector is a radio list;
- default animated speed is `3` steps/sec;
- no separate `Остановить` auto-animation button is included because the sandbox auto panel does not have one.

## Routing And Access

- If an authenticated `admin` opens the player route, redirect to the admin list.
- Player screen uses the shared authenticated app state from plan `04`.

## State Model

Player state should track:

- selected labyrinth;
- active theme override for current session;
- player position;
- trail coordinates;
- step count;
- elapsed time;
- active control mode: `manual` or `auto`;
- auto algorithm: `bfs` or `dfs`;
- auto display mode: `animated` or `instant`;
- speed from 1 to 10.
- whether a detail request, solve request, or auto animation is currently running.

Theme override is local frontend state only. It is reset when leaving the level or selecting the same labyrinth again after exit.

## Data Flow

- On player screen load, call `GET /api/labyrinths`.
- Do not auto-select the first labyrinth. Initial central state asks the player to choose a labyrinth.
- On selecting labyrinth, call `GET /api/labyrinths/{id}`.
- For auto-solve, call `POST /api/labyrinths/{id}/solve`.
- Maze grid renders from selected labyrinth grid and current local state.
- Manual movement updates local position/trail/stats only.
- If detail loading fails, reset selected labyrinth and show the error in the left panel.

## Player List Behavior

- Initial list loading state uses skeleton/list placeholders.
- Search uses debounced requests while typing.
- Search debounce delay is 500ms.
- Cursor pagination loads additional pages through infinite scroll.
- If there are no labyrinths, show simple text: `Нет лабиринтов`.
- If search returns no results, show a separate empty state: `Ничего не найдено`.
- Difficulty is displayed as sandbox-style stars: `★☆☆`, `★★☆`, `★★★`.
- Selected labyrinth detail loading uses a skeleton/placeholder maze in the central area.

## Maze And Manual Movement

- Render the player labyrinth as an HTML grid of cells, not `<canvas>`.
- The maze visualizer fits into the available central area with equal-size cells.
- Keyboard movement supports both arrow keys and WASD.
- Keyboard controls are active only when a labyrinth is selected and the `Ручное` tab is active.
- D-pad controls are available as in the sandbox.
- Wall and out-of-bounds moves do not change position and do not count as successful moves.
- Wall move attempts show short visual feedback such as highlight/shake.
- Every successful move increments `steps`, including moving back to an already visited cell.
- Trail contains all visited cells.
- Reset asks for confirmation when `steps > 0`.
- Exit level asks for confirmation when there is progress.
- Finish at `exit` shows a completion modal/message.

## Stats And Timer

- Timer starts after the first successful manual move or after starting auto-solve.
- Timer stops when the player reaches exit manually or when instant/animated auto-solve finishes.

## Auto-Solve Behavior

- Instant mode immediately renders the full path and moves the player to `exit`.
- Animated mode moves the player along the path and draws trail step by step.
- Starting auto-solve resets the player to `entry` and shows backend path from entry to exit.
- If manual progress exists before auto-solve, show a warning modal that auto-solve will start from zero.
- Manual controls are disabled during auto animation.
- There is no separate cancel/stop button for auto animation.
- Solve API errors are shown inside the auto panel.
- `Запустить решение` is disabled while no labyrinth detail is loaded or while solve/animation is running.

## Info Modals

- Include both player modals: `О разработчике` and `О системе`.

## Implementation Steps

- [x] Implement player layout shell.
- [x] Implement labyrinth list with search, infinite scroll, and empty states.
- [x] Implement selected labyrinth loading.
- [x] Implement local theme picker and theme reset on exit.
- [x] Implement `MazeGrid` renderer for wall/path/entry/exit/player/trail.
- [x] Implement keyboard movement.
- [x] Implement d-pad movement.
- [x] Prevent movement through walls and out of bounds.
- [x] Implement step/trail updates for valid moves.
- [x] Implement wall-move visual feedback.
- [x] Implement elapsed timer start/stop rules.
- [x] Implement finish modal/message.
- [x] Implement reset button.
- [x] Implement exit-level button.
- [x] Implement reset and exit-level confirmations.
- [x] Implement auto-solve panel controls.
- [x] Implement instant auto-solve rendering.
- [x] Implement animated auto-solve rendering with speed.
- [x] Implement auto-solve warning modal before resetting manual progress.
- [x] Hide or disable speed when instant mode is selected.
- [x] Implement player about/system modals.
- [x] Wire logout button.
- [x] Update `app/docs/plans/STATUS.md` after implementation and verification.

## Verification

Manual checks after implementation:

```bash
cd app
npm run docker:up
npm run dev:backend
npm run dev:frontend
```

Verify in browser:

- PLAYER-01..PLAYER-08;
- AUTO-01..AUTO-05;
- INFO-03;
- INFO-04.

Command checks:

```bash
cd app
npm run typecheck
npm run build
```

Expected result:

- frontend typecheck/build pass;
- player HTML grid renders non-empty maze;
- player interactions do not require hardcoded final data.

Additional checks from answered planning questions:

- admin opening player route redirects to admin list;
- player screen initially shows choose-labyrinth state instead of auto-selecting first labyrinth;
- player search waits 500ms after typing before request;
- player list loads additional cursor pages through infinite scroll;
- difficulty displays as stars;
- detail loading shows a central skeleton/placeholder maze;
- detail error resets selection and shows error in the left panel;
- maze grid fits the central area with equal-size cells;
- arrow keys and WASD move the player only on the manual tab;
- wall move shows short visual feedback and does not increment steps;
- backtracking increments steps and trail keeps all visited cells;
- timer starts after first successful manual move or auto-solve start;
- timer stops at manual finish or auto-solve completion;
- reset asks confirmation only when `steps > 0`;
- exit-level asks confirmation only when progress exists;
- local theme reset happens only on exit level;
- instant auto-solve renders full path and moves player to exit;
- animated auto-solve moves player along path and draws trail step by step;
- auto-solve with manual progress shows warning and restarts from entry;
- manual controls are disabled during auto animation;
- no separate auto-animation stop button exists;
- solve API error appears inside auto panel.

## Acceptance Criteria

- Player can select and load a backend labyrinth.
- Manual movement works only through valid cells.
- Theme changes are local and reset on exit.
- Player maze is rendered as HTML grid cells.
- волновой алгоритм/метод правой руки auto-solve results display correctly.
- Animated mode respects speed.
- All player checklist items can be verified manually.
