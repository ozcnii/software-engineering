import {
  getPassableNeighbors,
  key,
} from '../grid-validation';
import { Coordinate, MazeGrid, sameCoordinate } from '../maze-types';

export function solveBfs(grid: MazeGrid, entry: Coordinate, exit: Coordinate) {
  const queue: Coordinate[] = [entry];
  const visited = new Set<string>([key(entry)]);
  const previous = new Map<string, Coordinate>();

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (sameCoordinate(current, exit)) {
      return reconstructPath(previous, entry, exit);
    }

    for (const next of getPassableNeighbors(grid, current)) {
      const nextKey = key(next);

      if (visited.has(nextKey)) {
        continue;
      }

      visited.add(nextKey);
      previous.set(nextKey, current);
      queue.push(next);
    }
  }

  return null;
}

function reconstructPath(
  previous: Map<string, Coordinate>,
  entry: Coordinate,
  exit: Coordinate,
) {
  const path: Coordinate[] = [exit];
  let current = exit;

  while (!sameCoordinate(current, entry)) {
    const parent = previous.get(key(current));

    if (!parent) {
      return null;
    }

    path.push(parent);
    current = parent;
  }

  return path.reverse();
}
