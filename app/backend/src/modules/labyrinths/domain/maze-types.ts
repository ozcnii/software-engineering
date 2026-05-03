export const CELL_TYPES = ['wall', 'path', 'entry', 'exit'] as const;
export const LABYRINTH_THEMES = ['winter', 'summer', 'autumn', 'spring'] as const;
export const GENERATION_ALGORITHMS = ['prim', 'kruskal'] as const;
export const ENTRY_MODES = ['auto', 'manual'] as const;
export const SOLVING_ALGORITHMS = ['bfs', 'dfs'] as const;

export type MazeCell = (typeof CELL_TYPES)[number];
export type LabyrinthThemeValue = (typeof LABYRINTH_THEMES)[number];
export type GenerationAlgorithmValue = (typeof GENERATION_ALGORITHMS)[number];
export type EntryModeValue = (typeof ENTRY_MODES)[number];
export type SolvingAlgorithmValue = (typeof SOLVING_ALGORITHMS)[number];

export interface Coordinate {
  row: number;
  col: number;
}

export type MazeGrid = MazeCell[][];

export interface EntryExitPair {
  entry: Coordinate;
  exit: Coordinate;
}

export function isMazeCell(value: unknown): value is MazeCell {
  return typeof value === 'string' && CELL_TYPES.includes(value as MazeCell);
}

export function sameCoordinate(a: Coordinate, b: Coordinate) {
  return a.row === b.row && a.col === b.col;
}
