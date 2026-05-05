import type { Coordinate, MazeCell } from '@labyrinth/shared/types/domain';
import type { Direction } from '../model/playerState';

export const directionDeltas: Record<Direction, Coordinate> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

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
