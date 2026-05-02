# Planning TODO

## Unresolved Decisions

### Player dead-end count

Status: needs separate decision before implementing `05-frontend-player.md`.

Problem:

- PRD and prototype mention player statistics with `Тупиков`.
- We decided that backend plan `03-backend-labyrinths-algorithms.md` will not compute dead-end count.
- Need to choose how player UI should handle this value.

Candidate options:

- hide the dead-end field until a metric is defined;
- show `0` as a temporary value;
- count failed moves into walls;
- count graph dead-end cells in the whole labyrinth;
- define another metric explicitly.

Do not implement this silently. Ask before editing the player implementation plan.
