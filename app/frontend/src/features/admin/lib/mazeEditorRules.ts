import type { Coordinate, MazeCell, MazeGrid } from '../../../shared/types/domain';

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

  return '';
}

export function validateToolPlacement(grid: MazeGrid, tool: EditorTool, coordinate: Coordinate) {
  if (tool !== 'entry' && tool !== 'exit') {
    return { ok: true, message: '' };
  }

  const other = findCell(grid, tool === 'entry' ? 'exit' : 'entry');

  if (other && other.row === coordinate.row && other.col === coordinate.col) {
    return { ok: false, message: 'Вход и выход не должны совпадать' };
  }

  return validateEndpoint(grid, coordinate);
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

  const inner = adjacentInnerCell(grid, coordinate);

  if (!inner || grid[inner.row]?.[inner.col] !== 'path') {
    return { ok: false, message: 'рядом внутри лабиринта должен быть проход' };
  }

  return { ok: true, message: '' };
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
