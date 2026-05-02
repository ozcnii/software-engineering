# Frontend Auth And Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать React frontend для входа, регистрации и экрана администратора по PRD и прототипу `sandbox/index.html`.

**Architecture:** Frontend организуется по feature-папкам. `features/auth` отвечает за формы входа/регистрации, `features/admin` за список, мастер создания, удаление и справочные страницы, `shared/api` за REST JSON клиент.

**Tech Stack:** React + Vite + TypeScript, REST JSON API, npm.

---

## Scope

Входит:

- auth screen with login/register tabs;
- API integration for login/register/logout;
- admin layout;
- admin list/search;
- create wizard with 3 steps;
- editor grid interactions needed by checklist;
- delete confirmation modal;
- admin info pages.

Не входит:

- player screen;
- backend implementation;
- automated tests, если пользователь отдельно не попросит.

## Files And Modules

Create or modify:

```text
app/frontend/src/app/App.tsx
app/frontend/src/app/router.tsx
app/frontend/src/shared/api/client.ts
app/frontend/src/shared/api/authApi.ts
app/frontend/src/shared/api/labyrinthsApi.ts
app/frontend/src/shared/types/domain.ts
app/frontend/src/shared/ui/
app/frontend/src/features/auth/
app/frontend/src/features/admin/
```

Recommended feature components:

```text
features/auth/AuthScreen.tsx
features/auth/LoginForm.tsx
features/auth/RegisterForm.tsx
features/admin/AdminLayout.tsx
features/admin/AdminLabyrinthList.tsx
features/admin/AdminCreateWizard.tsx
features/admin/AdminMazeEditor.tsx
features/admin/AdminDeleteModal.tsx
features/admin/AdminAboutPage.tsx
features/admin/AdminSystemPage.tsx
```

## UI Source

Use `sandbox/index.html` as the visual and workflow reference, but convert it to maintainable React components. Keep the same product screens and labels from PRD/CHECKLIST.

Match `sandbox/index.html` as closely as practical for both workflow and visual style.

The sandbox editor uses a canvas-like visual area and already defines the required editor controls:

- `Стена`;
- `Проход`;
- `S Вход`;
- `E Выход`.

For the first React implementation, build the editor as an HTML grid of clickable cells, not `<canvas>`, while keeping the sandbox workflow and visual language.

Admin controls should follow the sandbox UI:

- theme selector is a radio list;
- generation algorithm selector is a radio list;
- entry mode selector is a radio list.

## Data Flow

- On app startup, frontend always calls `GET /api/auth/me` to restore the current user from the httpOnly cookie.
- While `/me` is pending, show an app-level loading state instead of auth/admin content.
- If startup `/me` returns 401, show the auth screen without an error message.
- Use `react-router` for frontend routes.
- API base URL is configured with `VITE_API_URL`.
- API requests send cookies globally with `credentials: "include"`.
- API `fields` errors are shown both near related fields and as a general error above the form/section.
- Auth forms call `authApi`.
- Successful login stores current user in frontend state.
- Successful login/register redirects by role: `admin` -> admin list, `player` -> player screen placeholder.
- Successful player registration immediately authenticates the user through backend cookie and enters the app.
- Logout redirects to the auth screen without a success message.
- If logout API request fails, frontend still clears current user state and redirects to auth.
- Role `admin` routes to admin screen.
- Role `player` routes to player screen placeholder until plan `05` is implemented.
- If an authenticated `player` opens an admin route, redirect to the player screen placeholder.
- Admin list calls `GET /api/labyrinths`.
- Admin list initial loading state uses skeleton/list placeholders.
- Admin list search uses debounced requests while typing.
- Admin list loads additional cursor pages through infinite scroll.
- Create wizard calls `POST /api/labyrinths/generate` before editor step.
- Create wizard keeps local state when moving backward and forward between steps.
- Save calls `POST /api/labyrinths`.
- After successful save, navigate back to the admin list.
- Delete calls `DELETE /api/labyrinths/{id}`.
- After successful delete, remove the item locally and show a toast.

## Admin List Behavior

- If there are no labyrinths, show simple text: `Нет лабиринтов`.
- If search returns no results, show a separate empty state: `Ничего не найдено`.
- Search debounce delay is 500ms.
- Infinite scroll loads the next page when the user gets near the end of the list.
- Use an adaptive list layout: desktop table, mobile cards.

## Create Wizard Behavior

- Regenerate shows a confirmation before replacing the current grid.
- Frontend validates all parameter fields before generate: `name`, `width`, `height`, `theme`, `generationAlgorithm`, `entryMode`.
- Theme, generation algorithm, and entry mode selectors use radio lists like `sandbox/index.html`.

## Editor Behavior

- Manual entry mode uses the existing sandbox tool pattern: `Стена`, `Проход`, `S Вход`, `E Выход`.
- Implement working undo/redo editor actions using the sandbox toolbar pattern.
- Frontend validates editor grid before save, including exactly one `entry` and exactly one `exit`; backend validation remains authoritative.
- Frontend blocks invalid `entry`/`exit` placement immediately and shows an error/hint.

## Delete Behavior

- Delete confirmation modal shows the labyrinth name.
- If delete API request fails, keep the modal open and show the error inside it.

## Info Pages

- Include both admin info pages from this plan: `About` and `System`.

## Implementation Steps

- [ ] Create shared API client with `VITE_API_URL`, `credentials: "include"`, and JSON request/response handling.
- [ ] Create auth API functions for login/register/logout.
- [ ] Create labyrinth API functions for list/search/generate/create/delete.
- [ ] Configure `react-router` routes and guards.
- [ ] Implement app-level current user state.
- [ ] Implement AuthScreen with login/register tabs.
- [ ] Implement login validation messages from checklist.
- [ ] Implement register validation messages from checklist.
- [ ] Route admin users to AdminLayout after login.
- [ ] Implement AdminLayout header/sidebar/main area.
- [ ] Implement admin list with search and empty states.
- [ ] Implement delete confirmation modal.
- [ ] Implement create wizard stepper and parameter form.
- [ ] Implement parameter validation before generate.
- [ ] Implement maze editor as an HTML grid with tool state.
- [ ] Implement working editor undo/redo actions.
- [ ] Implement regenerate action.
- [ ] Implement save confirmation step.
- [ ] Implement admin about and system pages.
- [ ] Wire logout button.
- [ ] Update `app/docs/plans/STATUS.md` after implementation and verification.

## Verification

Manual checks after implementation:

```bash
cd app
npm run docker:up
npm run dev:backend
npm run dev:frontend
```

Verify in browser:

- AUTH-01..AUTH-07;
- ADM-LIST-01..ADM-LIST-04;
- ADM-CREATE-01..ADM-CREATE-10;
- ADM-DELETE-01..ADM-DELETE-03;
- INFO-01;
- INFO-02.

Additional checks from answered planning questions:

- refresh while authenticated -> `/me` restores user and routes by role;
- refresh without valid session -> auth screen without an error message;
- admin list search waits 500ms after typing before request;
- infinite scroll loads next cursor page near the end of the list;
- desktop list renders as table and mobile list renders as cards;
- save success returns to admin list;
- delete success removes item locally and shows a toast;
- delete failure keeps modal open and shows error;
- editor undo/redo changes grid state backward/forward;
- invalid `entry`/`exit` placement is blocked immediately with a hint.

Command checks:

```bash
cd app
npm run typecheck
npm run build
```

Expected result:

- frontend typecheck/build pass;
- backend still builds after shared API type changes.

## Acceptance Criteria

- Auth UI matches PRD behavior.
- Admin cannot be created through registration.
- Admin list/search/create/delete flows work through backend API.
- Wizard follows the three-step flow.
- Editor is implemented as HTML grid cells with working tools and undo/redo.
- User-visible errors match checklist expectations.
- No final behavior depends on hardcoded labyrinth data.
