import type {
  LabyrinthDetail,
  LabyrinthListItem,
  MazeGrid,
} from '@labyrinth/shared/types/domain';
import { themeLabels } from './labels';

interface MazePreviewProps {
  item: LabyrinthListItem;
  detail: LabyrinthDetail | null;
  isLoading: boolean;
  error: string;
  position: {
    top: number;
    left: number;
  };
}

export function MazePreview({
  item,
  detail,
  isLoading,
  error,
  position,
}: MazePreviewProps) {
  return (
    <span className="maze-preview-popover" style={position} role="status">
      <span className="maze-preview-title">{item.name}</span>
      <span className="maze-preview-meta">
        {item.width} x {item.height} · {themeLabels[item.theme]}
      </span>
      {isLoading ? <span className="maze-preview-state">загрузка...</span> : null}
      {!isLoading && error ? (
        <span className="maze-preview-state error">{error}</span>
      ) : null}
      {!isLoading && !error && detail ? (
        <MazePreviewGrid grid={detail.grid} theme={item.theme} />
      ) : null}
    </span>
  );
}

function MazePreviewGrid({
  grid,
  theme,
}: {
  grid: MazeGrid;
  theme: LabyrinthListItem['theme'];
}) {
  const width = grid[0]?.length ?? 1;
  const height = grid.length || 1;

  return (
    <span
      className={`maze-preview-grid theme-${theme}`}
      style={{
        gridTemplateColumns: `repeat(${width}, minmax(4px, 1fr))`,
        gridTemplateRows: `repeat(${height}, minmax(4px, 1fr))`,
        aspectRatio: `${width} / ${height}`,
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <span
            className={`maze-preview-cell cell-${cell}`}
            key={`${rowIndex}-${colIndex}`}
          />
        )),
      )}
    </span>
  );
}
