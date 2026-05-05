import type { MazeCell, MazeGrid } from '@labyrinth/shared/types/domain';

interface MazeEditorGridProps {
  grid: MazeGrid;
  hint: string;
  onCellClick: (row: number, col: number) => void;
}

export function MazeEditorGrid({ grid, hint, onCellClick }: MazeEditorGridProps) {
  return (
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
              onClick={() => onCellClick(rowIndex, colIndex)}
            >
              {cellLabel(cell)}
            </button>
          )),
        )}
      </div>
      {hint ? <div className="err centered">{hint}</div> : null}
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
