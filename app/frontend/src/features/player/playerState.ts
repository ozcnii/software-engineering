import type { Coordinate, LabyrinthDetail, MazeCell } from '../../shared/types/domain';

export type ControlMode = 'manual' | 'auto';
export type AutoDisplayMode = 'animated' | 'instant';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type ProgressSource = 'none' | 'manual' | 'auto';

export interface PlayerRunState {
  position: Coordinate;
  trail: Coordinate[];
  steps: number;
  elapsedSeconds: number;
  isFinished: boolean;
  progressSource: ProgressSource;
}

export const directionDeltas: Record<Direction, Coordinate> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

export function createInitialRunState(labyrinth: LabyrinthDetail): PlayerRunState {
  return {
    position: labyrinth.entry,
    trail: [labyrinth.entry],
    steps: 0,
    elapsedSeconds: 0,
    isFinished: false,
    progressSource: 'none',
  };
}

export function coordinateKey(coordinate: Coordinate) {
  return `${coordinate.row}:${coordinate.col}`;
}

export function sameCoordinate(left: Coordinate, right: Coordinate) {
  return left.row === right.row && left.col === right.col;
}

export function moveCoordinate(coordinate: Coordinate, direction: Direction): Coordinate {
  const delta = directionDeltas[direction];

  return {
    row: coordinate.row + delta.row,
    col: coordinate.col + delta.col,
  };
}

export function getCell(grid: MazeCell[][], coordinate: Coordinate): MazeCell | null {
  if (
    coordinate.row < 0 ||
    coordinate.row >= grid.length ||
    coordinate.col < 0 ||
    coordinate.col >= (grid[coordinate.row]?.length ?? 0)
  ) {
    return null;
  }

  return grid[coordinate.row][coordinate.col];
}

export function isWalkableCell(cell: MazeCell | null) {
  return cell === 'path' || cell === 'entry' || cell === 'exit';
}

export function hasProgress(run: PlayerRunState | null) {
  return Boolean(run && (run.steps > 0 || run.isFinished));
}

export function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
