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

  const thickWallResult = validateThickWallStructure(grid);

  if (!thickWallResult.valid) {
    return thickWallResult;
  }

  if (!hasPath(grid, pair.entry, pair.exit)) {
    return {
      valid: false,
      message: 'В лабиринте должен быть путь от входа к выходу',
    };
  }

  if (!allPassableCellsAreConnected(grid, pair.entry)) {
    return {
      valid: false,
      message: 'В лабиринте не должно быть изолированных проходов',
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

  const gridResult = validateGridForPersistence(grid, width, height);

  return gridResult.valid ? pair : null;
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
  const coordinateResult = validateEntryExitCoordinates(
    grid[0]?.length ?? 0,
    grid.length,
    entry,
    exit,
  );

  if (!coordinateResult.valid) {
    return coordinateResult;
  }

  for (const point of [entry, exit]) {
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

export function validateEntryExitCoordinates(
  width: number,
  height: number,
  entry: Coordinate,
  exit: Coordinate,
): GridValidationResult {
  if (
    !isCoordinateInside(width, height, entry) ||
    !isCoordinateInside(width, height, exit)
  ) {
    return {
      valid: false,
      message: 'Вход и выход должны находиться в пределах сетки',
    };
  }

  if (sameCoordinate(entry, exit)) {
    return {
      valid: false,
      message: 'Вход и выход должны быть разными клетками',
    };
  }

  for (const point of [entry, exit]) {
    if (!isOnPerimeterSize(width, height, point)) {
      return {
        valid: false,
        message: 'Вход и выход должны находиться на периметре',
      };
    }

    if (isCornerSize(width, height, point)) {
      return {
        valid: false,
        message: 'Вход и выход не должны находиться в углах',
      };
    }

    if (!isThickWallEndpoint(width, height, point)) {
      return {
        valid: false,
        message: 'Вход и выход должны совпадать с узлами толстостенного лабиринта',
      };
    }
  }

  if (manhattanDistance(entry, exit) < 2) {
    return {
      valid: false,
      message: 'Между входом и выходом должна быть минимум одна клетка',
    };
  }

  const entryInner = getAdjacentInnerCellBySize(width, height, entry);
  const exitInner = getAdjacentInnerCellBySize(width, height, exit);

  if (!entryInner || !exitInner || sameCoordinate(entryInner, exitInner)) {
    return {
      valid: false,
      message: 'Вход и выход должны вести в разные внутренние клетки',
    };
  }

  return { valid: true };
}

export function validateThickWallStructure(grid: MazeGrid): GridValidationResult {
  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      const cell = grid[row][col];

      if (isOnPerimeter(grid, { row, col })) {
        if (cell !== 'wall' && cell !== 'entry' && cell !== 'exit') {
          return {
            valid: false,
            message:
              'Лабиринт не толстостенный: периметр должен состоять из стен, входа и выхода',
          };
        }

        continue;
      }

      if (row % 2 === 1 && col % 2 === 1 && cell !== 'path') {
        return {
          valid: false,
          message:
            'Лабиринт не толстостенный: узлы проходов внутри лабиринта должны оставаться проходами',
        };
      }

      if (row % 2 === 0 && col % 2 === 0 && cell !== 'wall') {
        return {
          valid: false,
          message:
            'Лабиринт не толстостенный: пересечения стен внутри лабиринта должны оставаться стенами',
        };
      }
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

export function allPassableCellsAreConnected(grid: MazeGrid, start: Coordinate) {
  const passableCount = grid.reduce(
    (count, row) =>
      count +
      row.filter((cell) => cell === 'path' || cell === 'entry' || cell === 'exit').length,
    0,
  );
  const visited = new Set<string>();
  const queue: Coordinate[] = [start];
  visited.add(key(start));

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const next of getPassableNeighbors(grid, current)) {
      const nextKey = key(next);

      if (!visited.has(nextKey)) {
        visited.add(nextKey);
        queue.push(next);
      }
    }
  }

  return visited.size === passableCount;
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
  return isOnPerimeterSize(grid[0]?.length ?? 0, grid.length, coordinate);
}

function isCoordinateInside(width: number, height: number, coordinate: Coordinate) {
  return (
    Number.isInteger(coordinate.row) &&
    Number.isInteger(coordinate.col) &&
    coordinate.row >= 0 &&
    coordinate.col >= 0 &&
    coordinate.row < height &&
    coordinate.col < width
  );
}

function isOnPerimeterSize(width: number, height: number, coordinate: Coordinate) {
  return (
    coordinate.row === 0 ||
    coordinate.col === 0 ||
    coordinate.row === height - 1 ||
    coordinate.col === width - 1
  );
}

function isCornerSize(width: number, height: number, coordinate: Coordinate) {
  const lastRow = height - 1;
  const lastCol = width - 1;

  return (
    (coordinate.row === 0 && coordinate.col === 0) ||
    (coordinate.row === 0 && coordinate.col === lastCol) ||
    (coordinate.row === lastRow && coordinate.col === 0) ||
    (coordinate.row === lastRow && coordinate.col === lastCol)
  );
}

function isThickWallEndpoint(width: number, height: number, coordinate: Coordinate) {
  if (coordinate.row === 0 || coordinate.row === height - 1) {
    return coordinate.col % 2 === 1;
  }

  if (coordinate.col === 0 || coordinate.col === width - 1) {
    return coordinate.row % 2 === 1;
  }

  return false;
}

function manhattanDistance(a: Coordinate, b: Coordinate) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function getAdjacentInnerCell(grid: MazeGrid, coordinate: Coordinate): Coordinate | null {
  return getAdjacentInnerCellBySize(grid[0]?.length ?? 0, grid.length, coordinate);
}

function getAdjacentInnerCellBySize(
  width: number,
  height: number,
  coordinate: Coordinate,
): Coordinate | null {
  const lastRow = height - 1;
  const lastCol = width - 1;

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
