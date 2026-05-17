import type { CSSProperties } from 'react';
import type {
  Coordinate,
  LabyrinthTheme,
  MazeGrid as MazeGridData,
} from '@labyrinth/shared/types/domain';
import { coordinateKey, sameCoordinate } from './lib/playerMovement';

interface MazeGridProps {
  grid: MazeGridData;
  position: Coordinate | null;
  trail: Coordinate[];
  theme: LabyrinthTheme;
  isWallFeedbackActive: boolean;
  isPlaceholder?: boolean;
}

export function MazeGrid({
  grid,
  position,
  trail,
  theme,
  isWallFeedbackActive,
  isPlaceholder = false,
}: MazeGridProps) {
  const trailKeys = new Set(trail.map(coordinateKey));
  const width = grid[0]?.length ?? 1;
  const height = grid.length || 1;

  return (
    <div
      className={`player-maze-grid theme-${theme} ${isWallFeedbackActive ? 'wall-feedback' : ''} ${
        isPlaceholder ? 'maze-placeholder' : ''
      }`}
      style={
        {
          '--maze-ratio': String(width / height),
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`,
          aspectRatio: `${width} / ${height}`,
        } as CSSProperties
      }
      aria-label="Лабиринт игрока"
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const coordinate = { row: rowIndex, col: colIndex };
          const hasPlayer = position ? sameCoordinate(position, coordinate) : false;
          const hasTrail = trailKeys.has(coordinateKey(coordinate));
          const cellClass = [
            'player-maze-cell',
            `player-cell-${cell}`,
            hasTrail ? 'has-trail' : '',
            hasPlayer ? 'has-player' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div className={cellClass} key={`${rowIndex}-${colIndex}`}>
              {cell === 'entry' ? <span className="cell-label">S</span> : null}
              {cell === 'exit' ? <span className="cell-label">E</span> : null}
              {hasTrail && !hasPlayer ? <span className="trail-dot" /> : null}
              {hasPlayer ? <span className="player-token">@</span> : null}
            </div>
          );
        }),
      )}
    </div>
  );
}
