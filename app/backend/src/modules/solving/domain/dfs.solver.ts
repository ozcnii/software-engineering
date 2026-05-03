import {
  getPassableNeighbors,
  key,
} from '../../labyrinths/domain/grid-validation';
import { Coordinate, MazeGrid, sameCoordinate } from '../../labyrinths/domain/maze-types';

export function solveDfs(grid: MazeGrid, entry: Coordinate, exit: Coordinate) {
  const visited = new Set<string>();
  const path: Coordinate[] = [];

  if (!visit(grid, entry, exit, visited, path)) {
    return null;
  }

  return path;
}

function visit(
  grid: MazeGrid,
  current: Coordinate,
  exit: Coordinate,
  visited: Set<string>,
  path: Coordinate[],
): boolean {
  visited.add(key(current));
  path.push(current);

  if (sameCoordinate(current, exit)) {
    return true;
  }

  for (const next of getPassableNeighbors(grid, current)) {
    if (visited.has(key(next))) {
      continue;
    }

    if (visit(grid, next, exit, visited, path)) {
      return true;
    }
  }

  path.pop();

  return false;
}
