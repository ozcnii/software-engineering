export type UserRole = 'admin' | 'player';

export interface User {
  id: string;
  login: string;
  role: UserRole;
}

export type LabyrinthTheme = 'winter' | 'summer' | 'autumn' | 'spring';

export type GenerationAlgorithm = 'prim' | 'kruskal';

export type EntryMode = 'auto' | 'manual';

export type MazeCell = 'wall' | 'path' | 'entry' | 'exit';

export interface Coordinate {
  row: number;
  col: number;
}

export type MazeGrid = MazeCell[][];

export interface LabyrinthListItem {
  id: string;
  name: string;
  width: number;
  height: number;
  theme: LabyrinthTheme;
  generationAlgorithm: GenerationAlgorithm;
  entryMode: EntryMode;
  difficulty: number;
  createdAt: string;
}

export interface LabyrinthDetail extends LabyrinthListItem {
  grid: MazeGrid;
  entry: Coordinate;
  exit: Coordinate;
}

export interface ApiFieldErrors {
  [field: string]: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  fields?: ApiFieldErrors;
}
