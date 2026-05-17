import type { Coordinate, MazeCell, MazeGrid } from '@labyrinth/shared/types/domain';

export type EditorTool = 'wall' | 'path' | 'entry' | 'exit';

export function validateFinalGrid(grid: MazeGrid): string {
  const status = getEntryExitStatus(grid);

  if (status.entryCount !== 1 || status.exitCount !== 1) {
    return 'Должен быть ровно один вход и ровно один выход';
  }

  if (!status.entry || !status.exit) {
    return 'Вход или выход не задан';
  }

  const entryValidation = validateEndpoint(grid, status.entry);
  const exitValidation = validateEndpoint(grid, status.exit);

  if (!entryValidation.ok) {
    return `Вход: ${entryValidation.message}`;
  }

  if (!exitValidation.ok) {
    return `Выход: ${exitValidation.message}`;
  }

  const distanceValidation = validateEntryExitDistance(grid, status.entry, status.exit);

  if (!distanceValidation.ok) {
    return distanceValidation.message;
  }

  const thickWallValidation = validateThickWallStructure(grid);

  if (!thickWallValidation.ok) {
    return `Лабиринт не толстостенный: ${thickWallValidation.message}`;
  }

  if (!allPassableCellsAreConnected(grid, status.entry)) {
    return 'В лабиринте не должно быть изолированных проходов';
  }

  return '';
}

export function validateGeneratedGridAfterEdit(grid: MazeGrid) {
  return validateFinalGrid(grid);
}

export function validateToolPlacement(
  grid: MazeGrid,
  tool: EditorTool,
  coordinate: Coordinate,
) {
  if (tool === 'wall' || tool === 'path') {
    return validateStructureToolPlacement(grid, tool, coordinate);
  }

  const other = findCell(grid, tool === 'entry' ? 'exit' : 'entry');

  if (other && other.row === coordinate.row && other.col === coordinate.col) {
    return { ok: false, message: 'Вход и выход не должны совпадать' };
  }

  const endpointValidation = validateEndpoint(grid, coordinate);

  if (!endpointValidation.ok || !other) {
    return endpointValidation;
  }

  return validateEntryExitDistance(
    grid,
    tool === 'entry' ? coordinate : other,
    tool === 'exit' ? coordinate : other,
  );
}

export function getEntryExitStatus(grid: MazeGrid) {
  const entryCells = findCells(grid, 'entry');
  const exitCells = findCells(grid, 'exit');

  return {
    entry: entryCells[0] ?? null,
    exit: exitCells[0] ?? null,
    entryCount: entryCells.length,
    exitCount: exitCells.length,
  };
}

export function cloneGrid(grid: MazeGrid): MazeGrid {
  return grid.map((row) => [...row]);
}

export function createTemplateGrid(width: number, height: number): MazeGrid {
  return Array.from({ length: height }, (_, row) =>
    Array.from({ length: width }, (_, col) =>
      row === 0 ||
      col === 0 ||
      row === height - 1 ||
      col === width - 1 ||
      (row % 2 === 0 && col % 2 === 0)
        ? 'wall'
        : 'path',
    ),
  );
}

export function placeAutoEntryExit(grid: MazeGrid): MazeGrid {
  const candidates = collectEndpointCandidates(grid);

  for (const entry of candidates) {
    for (const exit of [...candidates].reverse()) {
      if (validateEntryExitDistance(grid, entry, exit).ok) {
        const nextGrid = cloneGrid(grid);
        nextGrid[entry.row][entry.col] = 'entry';
        nextGrid[exit.row][exit.col] = 'exit';

        return nextGrid;
      }
    }
  }

  return grid;
}

function validateEndpoint(grid: MazeGrid, coordinate: Coordinate) {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  const isTopOrBottom = coordinate.row === 0 || coordinate.row === height - 1;
  const isLeftOrRight = coordinate.col === 0 || coordinate.col === width - 1;

  if (!isTopOrBottom && !isLeftOrRight) {
    return { ok: false, message: 'клетка должна быть на периметре' };
  }

  if (
    (coordinate.row === 0 || coordinate.row === height - 1) &&
    (coordinate.col === 0 || coordinate.col === width - 1)
  ) {
    return { ok: false, message: 'клетка не должна быть в углу' };
  }

  if (
    ((coordinate.row === 0 || coordinate.row === height - 1) &&
      coordinate.col % 2 === 0) ||
    ((coordinate.col === 0 || coordinate.col === width - 1) && coordinate.row % 2 === 0)
  ) {
    return {
      ok: false,
      message: 'клетка должна совпадать с узлом толстостенного лабиринта',
    };
  }

  const inner = adjacentInnerCell(grid, coordinate);

  if (!inner || grid[inner.row]?.[inner.col] !== 'path') {
    return { ok: false, message: 'рядом внутри лабиринта должен быть проход' };
  }

  return { ok: true, message: '' };
}

function validateEntryExitDistance(grid: MazeGrid, entry: Coordinate, exit: Coordinate) {
  if (entry.row === exit.row && entry.col === exit.col) {
    return { ok: false, message: 'Вход и выход должны быть разными клетками' };
  }

  if (Math.abs(entry.row - exit.row) + Math.abs(entry.col - exit.col) < 2) {
    return {
      ok: false,
      message: 'Между входом и выходом должна быть минимум одна клетка',
    };
  }

  const entryInner = adjacentInnerCell(grid, entry);
  const exitInner = adjacentInnerCell(grid, exit);

  if (
    entryInner &&
    exitInner &&
    entryInner.row === exitInner.row &&
    entryInner.col === exitInner.col
  ) {
    return { ok: false, message: 'Вход и выход должны вести в разные внутренние клетки' };
  }

  return { ok: true, message: '' };
}

function validateStructureToolPlacement(
  grid: MazeGrid,
  tool: 'wall' | 'path',
  coordinate: Coordinate,
) {
  if (isPerimeter(grid, coordinate)) {
    return tool === 'wall'
      ? { ok: true, message: '' }
      : { ok: false, message: 'периметр должен оставаться стеной, входом или выходом' };
  }

  if (coordinate.row % 2 === 1 && coordinate.col % 2 === 1) {
    return tool === 'path'
      ? { ok: true, message: '' }
      : { ok: false, message: 'узел прохода должен оставаться проходом' };
  }

  if (coordinate.row % 2 === 0 && coordinate.col % 2 === 0) {
    return tool === 'wall'
      ? { ok: true, message: '' }
      : { ok: false, message: 'пересечение стен должно оставаться стеной' };
  }

  return { ok: true, message: '' };
}

function validateThickWallStructure(grid: MazeGrid) {
  for (const [rowIndex, row] of grid.entries()) {
    for (const [colIndex, cell] of row.entries()) {
      const coordinate = { row: rowIndex, col: colIndex };

      if (isPerimeter(grid, coordinate)) {
        if (cell !== 'wall' && cell !== 'entry' && cell !== 'exit') {
          return {
            ok: false,
            message: 'периметр должен состоять из стен, входа и выхода',
          };
        }

        continue;
      }

      if (rowIndex % 2 === 1 && colIndex % 2 === 1 && cell !== 'path') {
        return {
          ok: false,
          message: 'узлы проходов внутри лабиринта должны оставаться проходами',
        };
      }

      if (rowIndex % 2 === 0 && colIndex % 2 === 0 && cell !== 'wall') {
        return {
          ok: false,
          message: 'пересечения стен внутри лабиринта должны оставаться стенами',
        };
      }
    }
  }

  return { ok: true, message: '' };
}

function allPassableCellsAreConnected(grid: MazeGrid, start: Coordinate) {
  const passableCount = grid.reduce(
    (count, row) =>
      count +
      row.filter((cell) => cell === 'path' || cell === 'entry' || cell === 'exit').length,
    0,
  );
  const visited = new Set<string>([coordinateKey(start)]);
  const queue: Coordinate[] = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const next of passableNeighbors(grid, current)) {
      const key = coordinateKey(next);

      if (!visited.has(key)) {
        visited.add(key);
        queue.push(next);
      }
    }
  }

  return visited.size === passableCount;
}

function passableNeighbors(grid: MazeGrid, coordinate: Coordinate) {
  return [
    { row: coordinate.row - 1, col: coordinate.col },
    { row: coordinate.row + 1, col: coordinate.col },
    { row: coordinate.row, col: coordinate.col - 1 },
    { row: coordinate.row, col: coordinate.col + 1 },
  ].filter((next) => {
    const cell = grid[next.row]?.[next.col];

    return cell === 'path' || cell === 'entry' || cell === 'exit';
  });
}

function isPerimeter(grid: MazeGrid, coordinate: Coordinate) {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;

  return (
    coordinate.row === 0 ||
    coordinate.row === height - 1 ||
    coordinate.col === 0 ||
    coordinate.col === width - 1
  );
}

function adjacentInnerCell(grid: MazeGrid, coordinate: Coordinate): Coordinate | null {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;

  if (coordinate.row === 0) {
    return { row: 1, col: coordinate.col };
  }

  if (coordinate.row === height - 1) {
    return { row: height - 2, col: coordinate.col };
  }

  if (coordinate.col === 0) {
    return { row: coordinate.row, col: 1 };
  }

  if (coordinate.col === width - 1) {
    return { row: coordinate.row, col: width - 2 };
  }

  return null;
}

function collectEndpointCandidates(grid: MazeGrid) {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  const candidates: Coordinate[] = [];

  for (let col = 1; col < width - 1; col += 2) {
    candidates.push({ row: 0, col }, { row: height - 1, col });
  }

  for (let row = 1; row < height - 1; row += 2) {
    candidates.push({ row, col: 0 }, { row, col: width - 1 });
  }

  return candidates.filter((candidate) => validateEndpoint(grid, candidate).ok);
}

function coordinateKey(coordinate: Coordinate) {
  return `${coordinate.row}:${coordinate.col}`;
}

function findCell(grid: MazeGrid, target: MazeCell): Coordinate | null {
  return findCells(grid, target)[0] ?? null;
}

function findCells(grid: MazeGrid, target: MazeCell): Coordinate[] {
  const coordinates: Coordinate[] = [];

  for (const [rowIndex, row] of grid.entries()) {
    for (const [colIndex, cell] of row.entries()) {
      if (cell === target) {
        coordinates.push({ row: rowIndex, col: colIndex });
      }
    }
  }

  return coordinates;
}
