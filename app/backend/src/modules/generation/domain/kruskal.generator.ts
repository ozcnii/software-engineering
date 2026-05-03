import { Coordinate, MazeGrid } from '../../labyrinths/domain/maze-types';

interface Edge {
  a: Coordinate;
  b: Coordinate;
  wall: Coordinate;
}

export function generateKruskalMaze(width: number, height: number): MazeGrid {
  const grid = createWalledGrid(width, height);
  const rooms = collectRooms(width, height);
  const parent = new Map<string, string>();
  const edges = collectEdges(width, height);

  for (const room of rooms) {
    grid[room.row][room.col] = 'path';
    parent.set(key(room), key(room));
  }

  shuffle(edges);

  for (const edge of edges) {
    const aRoot = find(parent, key(edge.a));
    const bRoot = find(parent, key(edge.b));

    if (aRoot === bRoot) {
      continue;
    }

    parent.set(aRoot, bRoot);
    grid[edge.wall.row][edge.wall.col] = 'path';
  }

  return grid;
}

function createWalledGrid(width: number, height: number): MazeGrid {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall'),
  );
}

function collectRooms(width: number, height: number) {
  const rooms: Coordinate[] = [];

  for (let row = 1; row < height; row += 2) {
    for (let col = 1; col < width; col += 2) {
      rooms.push({ row, col });
    }
  }

  return rooms;
}

function collectEdges(width: number, height: number) {
  const edges: Edge[] = [];

  for (let row = 1; row < height; row += 2) {
    for (let col = 1; col < width; col += 2) {
      if (col + 2 < width) {
        edges.push({
          a: { row, col },
          b: { row, col: col + 2 },
          wall: { row, col: col + 1 },
        });
      }

      if (row + 2 < height) {
        edges.push({
          a: { row, col },
          b: { row: row + 2, col },
          wall: { row: row + 1, col },
        });
      }
    }
  }

  return edges;
}

function find(parent: Map<string, string>, value: string): string {
  const current = parent.get(value);

  if (!current || current === value) {
    return value;
  }

  const root = find(parent, current);
  parent.set(value, root);

  return root;
}

function shuffle<T>(items: T[]) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const random = Math.floor(Math.random() * (index + 1));
    const item = items[index];
    items[index] = items[random];
    items[random] = item;
  }
}

function key(coordinate: Coordinate) {
  return `${coordinate.row}:${coordinate.col}`;
}
