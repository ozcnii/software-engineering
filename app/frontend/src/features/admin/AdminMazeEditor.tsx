import { useEffect, useMemo, useState } from 'react';
import type { LabyrinthTheme, MazeGrid } from '@labyrinth/shared/types/domain';
import { MazeEditorGrid } from './components/MazeEditorGrid';
import { MazeEditorToolbar } from './components/MazeEditorToolbar';
import {
  cloneGrid,
  getEntryExitStatus,
  validateFinalGrid,
  validateGeneratedGridAfterEdit,
  validateToolPlacement,
  type EditorTool,
} from './lib/mazeEditorRules';

export type { EditorTool };
export { validateFinalGrid };

interface AdminMazeEditorProps {
  grid: MazeGrid;
  resetKey: number;
  theme?: LabyrinthTheme;
  enabledTools?: EditorTool[];
  isBlank?: boolean;
  validateConnectivityOnEdit?: boolean;
  onChange: (grid: MazeGrid) => void;
}

export function AdminMazeEditor({
  grid,
  resetKey,
  theme,
  enabledTools = ['wall', 'path', 'entry', 'exit'],
  isBlank = false,
  validateConnectivityOnEdit = false,
  onChange,
}: AdminMazeEditorProps) {
  const [tool, setTool] = useState<EditorTool>(enabledTools[0] ?? 'entry');
  const [undoStack, setUndoStack] = useState<MazeGrid[]>([]);
  const [redoStack, setRedoStack] = useState<MazeGrid[]>([]);
  const [hint, setHint] = useState('');
  const status = useMemo(() => getEntryExitStatus(grid), [grid]);

  useEffect(() => {
    setUndoStack([]);
    setRedoStack([]);
    setHint('');
    setTool(enabledTools[0] ?? 'entry');
  }, [resetKey]);

  useEffect(() => {
    if (!enabledTools.includes(tool)) {
      setTool(enabledTools[0] ?? 'entry');
    }
  }, [enabledTools, tool]);

  function applyCell(row: number, col: number) {
    if (!enabledTools.includes(tool)) {
      setHint('Этот инструмент сейчас недоступен');
      return;
    }

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
            nextGrid[rowIndex][colIndex] = 'wall';
          }
        }
      }
    }

    nextGrid[row][col] = tool;

    if (validateConnectivityOnEdit) {
      const gridError = validateGeneratedGridAfterEdit(nextGrid);

      if (gridError) {
        setHint(gridError);
        return;
      }
    }

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
    <div className={`wiz-editor ${theme ? `theme-${theme}` : ''}`}>
      <div className="wiz-editor-left">
        <MazeEditorToolbar
          tool={tool}
          enabledTools={enabledTools}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onToolChange={setTool}
          onUndo={undo}
          onRedo={redo}
        />
        <MazeEditorGrid
          grid={grid}
          hint={hint}
          isBlank={isBlank}
          onCellClick={applyCell}
        />
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

function Legend({ label, className }: { label: string; className: string }) {
  return (
    <div className="legend-item">
      <span className={`legend-dot ${className}`} />
      {label}
    </div>
  );
}
