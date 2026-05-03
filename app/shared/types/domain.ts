export type UserRole = 'admin' | 'player';

export type LabyrinthTheme = 'winter' | 'summer' | 'autumn' | 'spring';

export type GenerationAlgorithm = 'prim' | 'kruskal';

export type EntryMode = 'auto' | 'manual';

export type MazeCell = 'wall' | 'path' | 'entry' | 'exit';

export interface Coordinate {
  row: number;
  col: number;
}
