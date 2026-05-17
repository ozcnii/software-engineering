import type { MazeCell, MazeGrid } from '@labyrinth/shared/types/domain';

type VisibleCell = MazeCell | 'blank' | 'border' | 'endpoint-slot';

interface MazeEditorGridProps {
  grid: MazeGrid;
  hint: string;
  isBlank?: boolean;
  onCellClick: (row: number, col: number) => void;
}

export function MazeEditorGrid({
  grid,
  hint,
  isBlank = false,
  onCellClick,
}: MazeEditorGridProps) {
  const width = grid[0]?.length ?? 1;
  const height = grid.length || 1;
  const maxGridWidth = Math.min(620, Math.round((width / height) * 620));

  return (
    <div className="card maze-editor-card">
      <div
        className={`maze-grid ${isBlank ? 'maze-grid-blank' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(14px, 1fr))`,
          gridTemplateRows: `repeat(${height}, minmax(14px, 1fr))`,
          aspectRatio: `${width} / ${height}`,
          width: `min(100%, ${maxGridWidth}px)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const visibleCell = getVisibleCell(grid, cell, rowIndex, colIndex, isBlank);

            return (
              <button
                className={`maze-cell cell-${visibleCell}`}
                type="button"
                key={`${rowIndex}-${colIndex}`}
                aria-label={`${rowIndex}:${colIndex} ${visibleCell}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
              >
                {cellLabel(cell)}
              </button>
            );
          }),
        )}
      </div>
      {hint ? <div className="err centered">{hint}</div> : null}
    </div>
  );
}

function getVisibleCell(
  grid: MazeGrid,
  cell: MazeCell,
  row: number,
  col: number,
  isBlank: boolean,
): VisibleCell {
  if (!isBlank || cell === 'entry' || cell === 'exit') {
    return cell;
  }

  if (isEndpointSlot(grid, row, col)) {
    return 'endpoint-slot';
  }

  if (isPerimeter(grid, row, col)) {
    return 'border';
  }

  return 'blank';
}

function isEndpointSlot(grid: MazeGrid, row: number, col: number) {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;

  return (
    ((row === 0 || row === height - 1) && col > 0 && col < width - 1 && col % 2 === 1) ||
    ((col === 0 || col === width - 1) && row > 0 && row < height - 1 && row % 2 === 1)
  );
}

function isPerimeter(grid: MazeGrid, row: number, col: number) {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;

  return row === 0 || row === height - 1 || col === 0 || col === width - 1;
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
