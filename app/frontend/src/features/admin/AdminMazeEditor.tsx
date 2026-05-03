import { useEffect, useMemo, useState } from 'react';
import type { Coordinate, MazeCell, MazeGrid } from '../../shared/types/domain';

export type EditorTool = 'wall' | 'path' | 'entry' | 'exit';

interface AdminMazeEditorProps {
  grid: MazeGrid;
  resetKey: number;
  onChange: (grid: MazeGrid) => void;
}

export function AdminMazeEditor({ grid, resetKey, onChange }: AdminMazeEditorProps) {
  const [tool, setTool] = useState<EditorTool>('wall');
  const [undoStack, setUndoStack] = useState<MazeGrid[]>([]);
  const [redoStack, setRedoStack] = useState<MazeGrid[]>([]);
  const [hint, setHint] = useState('');
  const status = useMemo(() => getEntryExitStatus(grid), [grid]);

  useEffect(() => {
    setUndoStack([]);
    setRedoStack([]);
    setHint('');
  }, [resetKey]);

  function applyCell(row: number, col: number) {
    const validation = validateToolPlacement(grid, tool, { row, col });

    if (!validation.ok) {
      setHint(validation.message);
      return;
    }

    const nextGrid = cloneGrid(grid);

    if (tool === 'entry' || tool === 'exit') {
      for (const [rowIndex, cells] of nextGrid.entries()) {
        for (const [colIndex, cell] of cells.entries()) {
          if (cell === tool) {
            nextGrid[rowIndex][colIndex] = 'path';
          }
        }
      }
    }

    nextGrid[row][col] = tool;
    setUndoStack((current) => [...current, cloneGrid(grid)]);
    setRedoStack([]);
    setHint('');
    onChange(nextGrid);
  }

  function undo() {
    const previous = undoStack.at(-1);

    if (!previous) {
      return;
    }

    setUndoStack((current) => current.slice(0, -1));
    setRedoStack((current) => [...current, cloneGrid(grid)]);
    setHint('');
    onChange(previous);
  }

  function redo() {
    const next = redoStack.at(-1);

    if (!next) {
      return;
    }

    setRedoStack((current) => current.slice(0, -1));
    setUndoStack((current) => [...current, cloneGrid(grid)]);
    setHint('');
    onChange(next);
  }

  return (
    <div className="wiz-editor">
      <div className="wiz-editor-left">
        <div className="card editor-toolbar">
          <span className="muted">Инструмент:</span>
          <ToolButton active={tool === 'wall'} label="Стена" onClick={() => setTool('wall')} />
          <ToolButton active={tool === 'path'} label="Проход" onClick={() => setTool('path')} />
          <ToolButton active={tool === 'entry'} label="S Вход" onClick={() => setTool('entry')} />
          <ToolButton active={tool === 'exit'} label="E Выход" onClick={() => setTool('exit')} />
          <div className="toolbar-spacer" />
          <button className="btn btn-sm btn-ghost" type="button" onClick={undo} disabled={!undoStack.length}>
            Отмена
          </button>
          <button className="btn btn-sm btn-ghost" type="button" onClick={redo} disabled={!redoStack.length}>
            Повтор
          </button>
        </div>

        <div className="card maze-editor-card">
          <div
            className="maze-grid"
            style={{
              gridTemplateColumns: `repeat(${grid[0]?.length ?? 1}, minmax(14px, 1fr))`,
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  className={`maze-cell cell-${cell}`}
                  type="button"
                  key={`${rowIndex}-${colIndex}`}
                  aria-label={`${rowIndex}:${colIndex} ${cell}`}
                  onClick={() => applyCell(rowIndex, colIndex)}
                >
                  {cellLabel(cell)}
                </button>
              )),
            )}
          </div>
          {hint ? <div className="err centered">{hint}</div> : null}
        </div>
      </div>

      <aside className="editor-side">
        <section className="card">
          <div className="card-title">Статус</div>
          <div className="legend-item">
            <span className={`badge ${status.entry ? 'badge-success' : 'badge-danger'}`}>
              вход {status.entry ? 'задан' : 'не задан'}
            </span>
          </div>
          <div className="legend-item">
            <span className={`badge ${status.exit ? 'badge-success' : 'badge-danger'}`}>
              выход {status.exit ? 'задан' : 'не задан'}
            </span>
          </div>
        </section>

        <section className="card">
          <div className="card-title">Легенда</div>
          <Legend label="Стена" className="cell-wall" />
          <Legend label="Проход" className="cell-path" />
          <Legend label="Вход" className="cell-entry" />
          <Legend label="Выход" className="cell-exit" />
        </section>
      </aside>
    </div>
  );
}

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

function ToolButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={`btn btn-sm ${active ? 'btn-primary' : ''}`} type="button" onClick={onClick}>
      {label}
    </button>
  );
}

function Legend({ label, className }: { label: string; className: string }) {
  return (
    <div className="legend-item">
      <span className={`legend-dot ${className}`} />
      {label}
    </div>
  );
}

function cellLabel(cell: MazeCell) {
  if (cell === 'entry') {
    return 'S';
  }

  if (cell === 'exit') {
    return 'E';
  }

  return '';
}

function validateToolPlacement(grid: MazeGrid, tool: EditorTool, coordinate: Coordinate) {
  if (tool !== 'entry' && tool !== 'exit') {
    return { ok: true, message: '' };
  }

  const other = findCell(grid, tool === 'entry' ? 'exit' : 'entry');

  if (other && other.row === coordinate.row && other.col === coordinate.col) {
    return { ok: false, message: 'Вход и выход не должны совпадать' };
  }

  return validateEndpoint(grid, coordinate);
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

function getEntryExitStatus(grid: MazeGrid) {
  const entryCells = findCells(grid, 'entry');
  const exitCells = findCells(grid, 'exit');

  return {
    entry: entryCells[0] ?? null,
    exit: exitCells[0] ?? null,
    entryCount: entryCells.length,
    exitCount: exitCells.length,
  };
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

function cloneGrid(grid: MazeGrid): MazeGrid {
  return grid.map((row) => [...row]);
}
