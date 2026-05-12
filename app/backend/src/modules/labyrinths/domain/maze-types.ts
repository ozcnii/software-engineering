import type {
  Coordinate as SharedCoordinate,
  EntryMode,
  GenerationAlgorithm,
  LabyrinthTheme,
  MazeCell as SharedMazeCell,
  MazeGrid as SharedMazeGrid,
  SolvingAlgorithm,
} from '@labyrinth/shared/types/domain';

export const CELL_TYPES = ['wall', 'path', 'entry', 'exit'] as const;
export const LABYRINTH_THEMES = ['winter', 'summer', 'autumn', 'spring'] as const;
export const GENERATION_ALGORITHMS = ['prim', 'kruskal'] as const;
export const ENTRY_MODES = ['auto', 'manual'] as const;
export const SOLVING_ALGORITHMS = ['wave', 'rightHand'] as const;

export type MazeCell = SharedMazeCell;
export type LabyrinthThemeValue = LabyrinthTheme;
export type GenerationAlgorithmValue = GenerationAlgorithm;
export type EntryModeValue = EntryMode;
export type SolvingAlgorithmValue = SolvingAlgorithm;

export type Coordinate = SharedCoordinate;

export type MazeGrid = SharedMazeGrid;

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
