import { Coordinate, MazeGrid } from '../maze-types';

interface Frontier {
  wall: Coordinate;
  target: Coordinate;
}

const DIRECTIONS = [
  { row: -2, col: 0 },
  { row: 2, col: 0 },
  { row: 0, col: -2 },
  { row: 0, col: 2 },
];

export function generatePrimMaze(width: number, height: number): MazeGrid {
  const grid = createWalledGrid(width, height);
  const visited = new Set<string>();
  const frontiers: Frontier[] = [];
  const start = randomRoom(width, height);

  markRoom(grid, visited, start);
  addFrontiers(width, height, start, visited, frontiers);

  while (frontiers.length > 0) {
    const index = randomIndex(frontiers.length);
    const frontier = frontiers.splice(index, 1)[0];
    const targetKey = key(frontier.target);

    if (visited.has(targetKey)) {
      continue;
    }

    grid[frontier.wall.row][frontier.wall.col] = 'path';
    markRoom(grid, visited, frontier.target);
    addFrontiers(width, height, frontier.target, visited, frontiers);
  }

  return grid;
}

function createWalledGrid(width: number, height: number): MazeGrid {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall'),
  );
}

function randomRoom(width: number, height: number): Coordinate {
  return {
    row: randomOdd(height),
    col: randomOdd(width),
  };
}

function randomOdd(limit: number) {
  const rooms = Math.floor((limit - 1) / 2);

  return randomIndex(rooms) * 2 + 1;
}

function markRoom(grid: MazeGrid, visited: Set<string>, room: Coordinate) {
  visited.add(key(room));
  grid[room.row][room.col] = 'path';
}

function addFrontiers(
  width: number,
  height: number,
  room: Coordinate,
  visited: Set<string>,
  frontiers: Frontier[],
) {
  for (const direction of DIRECTIONS) {
    const target = {
      row: room.row + direction.row,
      col: room.col + direction.col,
    };

    if (!isRoomInside(width, height, target) || visited.has(key(target))) {
      continue;
    }

    frontiers.push({
      wall: {
        row: room.row + direction.row / 2,
        col: room.col + direction.col / 2,
      },
      target,
    });
  }
}

function isRoomInside(width: number, height: number, room: Coordinate) {
  return room.row > 0 && room.col > 0 && room.row < height - 1 && room.col < width - 1;
}

function key(coordinate: Coordinate) {
  return `${coordinate.row}:${coordinate.col}`;
}

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}
