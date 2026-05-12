import { isPassable, key } from '../grid-validation';
import { Coordinate, MazeGrid, sameCoordinate } from '../maze-types';

type Direction = 'up' | 'right' | 'down' | 'left';

const DELTAS: Record<Direction, Coordinate> = {
  up: { row: -1, col: 0 },
  right: { row: 0, col: 1 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
};

const RIGHT_TURN: Record<Direction, Direction> = {
  up: 'right',
  right: 'down',
  down: 'left',
  left: 'up',
};

const LEFT_TURN: Record<Direction, Direction> = {
  up: 'left',
  left: 'down',
  down: 'right',
  right: 'up',
};

const BACK_TURN: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export function solveRightHand(grid: MazeGrid, entry: Coordinate, exit: Coordinate) {
  let position = entry;
  let direction = directionIntoMaze(grid, entry);
  const path: Coordinate[] = [entry];
  const visitedStates = new Set<string>();

  while (true) {
    if (sameCoordinate(position, exit)) {
      return path;
    }

    const stateKey = `${key(position)}:${direction}`;

    if (visitedStates.has(stateKey)) {
      return null;
    }

    visitedStates.add(stateKey);

    const nextDirection = chooseNextDirection(grid, position, direction);

    if (!nextDirection) {
      return null;
    }

    direction = nextDirection;
    position = move(position, direction);
    path.push(position);
  }
}

function chooseNextDirection(
  grid: MazeGrid,
  position: Coordinate,
  direction: Direction,
): Direction | null {
  const candidates = [
    RIGHT_TURN[direction],
    direction,
    LEFT_TURN[direction],
    BACK_TURN[direction],
  ];

  return (
    candidates.find((candidate) => isPassable(grid, move(position, candidate))) ?? null
  );
}

function directionIntoMaze(grid: MazeGrid, entry: Coordinate): Direction {
  if (entry.row === 0) {
    return 'down';
  }

  if (entry.row === grid.length - 1) {
    return 'up';
  }

  if (entry.col === 0) {
    return 'right';
  }

  return 'left';
}

function move(position: Coordinate, direction: Direction): Coordinate {
  const delta = DELTAS[direction];

  return {
    row: position.row + delta.row,
    col: position.col + delta.col,
  };
}
