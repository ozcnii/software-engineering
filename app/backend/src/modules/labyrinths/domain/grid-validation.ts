import {
  Coordinate,
  EntryExitPair,
  MazeGrid,
  isMazeCell,
  sameCoordinate,
} from './maze-types';

export interface GridValidationResult {
  valid: boolean;
  message?: string;
}

export function validateOddSize(width: number, height: number): GridValidationResult {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return {
      valid: false,
      message: 'Ширина и высота должны быть целыми числами',
    };
  }

  if (width < 7 || width > 25 || height < 7 || height > 25) {
    return {
      valid: false,
      message: 'Ширина и высота должны быть от 7 до 25',
    };
  }

  if (width % 2 === 0 || height % 2 === 0) {
    return {
      valid: false,
      message: 'Ширина и высота должны быть нечетными числами',
    };
  }

  return { valid: true };
}

export function validateGridForPersistence(
  grid: unknown,
  width: number,
  height: number,
): GridValidationResult {
  const sizeResult = validateOddSize(width, height);

  if (!sizeResult.valid) {
    return sizeResult;
  }

  if (!isMazeGridShape(grid, width, height)) {
    return {
      valid: false,
      message: 'Сетка должна соответствовать указанным ширине и высоте',
    };
  }

  if (!allCellsAreValid(grid)) {
    return {
      valid: false,
      message: 'Сетка содержит некорректные значения клеток',
    };
  }

  const pair = findEntryExit(grid);

  if (!pair) {
    return {
      valid: false,
      message: 'Сетка должна содержать ровно один вход и один выход',
    };
  }

  const entryExitResult = validateEntryExit(grid, pair.entry, pair.exit);

  if (!entryExitResult.valid) {
    return entryExitResult;
  }

  if (!hasPath(grid, pair.entry, pair.exit)) {
    return {
      valid: false,
      message: 'В лабиринте должен быть путь от входа к выходу',
    };
  }

  return { valid: true };
}

export function assertIntegrityGrid(grid: unknown, width: number, height: number) {
  if (!isMazeGridShape(grid, width, height) || !allCellsAreValid(grid)) {
    return null;
  }

  const pair = findEntryExit(grid);

  if (!pair) {
    return null;
  }

  const entryExitResult = validateEntryExit(grid, pair.entry, pair.exit);

  return entryExitResult.valid ? pair : null;
}

export function findEntryExit(grid: MazeGrid): EntryExitPair | null {
  const entries: Coordinate[] = [];
  const exits: Coordinate[] = [];

  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      if (grid[row][col] === 'entry') {
        entries.push({ row, col });
      }

      if (grid[row][col] === 'exit') {
        exits.push({ row, col });
      }
    }
  }

  if (entries.length !== 1 || exits.length !== 1) {
    return null;
  }

  return {
    entry: entries[0],
    exit: exits[0],
  };
}

export function validateEntryExit(
  grid: MazeGrid,
  entry: Coordinate,
  exit: Coordinate,
): GridValidationResult {
  if (sameCoordinate(entry, exit)) {
    return {
      valid: false,
      message: 'Вход и выход должны быть разными клетками',
    };
  }

  for (const point of [entry, exit]) {
    if (!isOnPerimeter(grid, point)) {
      return {
        valid: false,
        message: 'Вход и выход должны находиться на периметре',
      };
    }

    if (isCorner(grid, point)) {
      return {
        valid: false,
        message: 'Вход и выход не должны находиться в углах',
      };
    }

    const inner = getAdjacentInnerCell(grid, point);

    if (!inner || grid[inner.row][inner.col] !== 'path') {
      return {
        valid: false,
        message: 'Рядом с входом и выходом внутри лабиринта должен быть проход',
      };
    }
  }

  return { valid: true };
}

export function hasPath(grid: MazeGrid, start: Coordinate, end: Coordinate) {
  const visited = new Set<string>();
  const queue: Coordinate[] = [start];
  visited.add(key(start));

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (sameCoordinate(current, end)) {
      return true;
    }

    for (const next of getPassableNeighbors(grid, current)) {
      const nextKey = key(next);

      if (!visited.has(nextKey)) {
        visited.add(nextKey);
        queue.push(next);
      }
    }
  }

  return false;
}

export function getPassableNeighbors(grid: MazeGrid, coordinate: Coordinate) {
  const candidates = [
    { row: coordinate.row - 1, col: coordinate.col },
    { row: coordinate.row + 1, col: coordinate.col },
    { row: coordinate.row, col: coordinate.col - 1 },
    { row: coordinate.row, col: coordinate.col + 1 },
  ];

  return candidates.filter((candidate) => isPassable(grid, candidate));
}

export function isPassable(grid: MazeGrid, coordinate: Coordinate) {
  const cell = grid[coordinate.row]?.[coordinate.col];

  return cell === 'path' || cell === 'entry' || cell === 'exit';
}

export function key(coordinate: Coordinate) {
  return `${coordinate.row}:${coordinate.col}`;
}

function isMazeGridShape(grid: unknown, width: number, height: number): grid is MazeGrid {
  return (
    Array.isArray(grid) &&
    grid.length === height &&
    grid.every((row) => Array.isArray(row) && row.length === width)
  );
}

function allCellsAreValid(grid: MazeGrid) {
  return grid.every((row) => row.every((cell) => isMazeCell(cell)));
}

function isOnPerimeter(grid: MazeGrid, coordinate: Coordinate) {
  return (
    coordinate.row === 0 ||
    coordinate.col === 0 ||
    coordinate.row === grid.length - 1 ||
    coordinate.col === grid[0].length - 1
  );
}

function isCorner(grid: MazeGrid, coordinate: Coordinate) {
  const lastRow = grid.length - 1;
  const lastCol = grid[0].length - 1;

  return (
    (coordinate.row === 0 && coordinate.col === 0) ||
    (coordinate.row === 0 && coordinate.col === lastCol) ||
    (coordinate.row === lastRow && coordinate.col === 0) ||
    (coordinate.row === lastRow && coordinate.col === lastCol)
  );
}

function getAdjacentInnerCell(grid: MazeGrid, coordinate: Coordinate): Coordinate | null {
  const lastRow = grid.length - 1;
  const lastCol = grid[0].length - 1;

  if (coordinate.row === 0) {
    return { row: 1, col: coordinate.col };
  }

  if (coordinate.row === lastRow) {
    return { row: lastRow - 1, col: coordinate.col };
  }

  if (coordinate.col === 0) {
    return { row: coordinate.row, col: 1 };
  }

  if (coordinate.col === lastCol) {
    return { row: coordinate.row, col: lastCol - 1 };
  }

  return null;
}
