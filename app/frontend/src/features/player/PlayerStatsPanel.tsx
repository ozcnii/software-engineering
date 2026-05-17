import { formatElapsed, type PlayerRunState } from './model/playerState';

interface PlayerStatsPanelProps {
  run: PlayerRunState | null;
  disabled: boolean;
  onReset: () => void;
  onExit: () => void;
}

export function PlayerStatsPanel({
  run,
  disabled,
  onReset,
  onExit,
}: PlayerStatsPanelProps) {
  return (
    <aside className="player-right">
      <div>
        <div className="panel-title">Статистика</div>
        <div className="stats-list">
          <div>
            <span className="muted">Шагов:</span>
            <span className="stat-value">{run?.steps ?? 0}</span>
          </div>
          <div>
            <span className="muted">Время:</span>
            <span className="stat-value">{formatElapsed(run?.elapsedSeconds ?? 0)}</span>
          </div>
        </div>
      </div>

      <hr className="divider" />

      <div>
        <div className="panel-title">Легенда</div>
        <div className="legend-item">
          <div className="legend-dot legend-entry" /> Старт (S)
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-exit" /> Финиш (E)
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-player" /> Игрок (@)
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-trail" /> След пути
        </div>
      </div>

      <hr className="divider" />

      <div className="player-actions">
        <button
          className="btn btn-ghost btn-sm btn-full"
          type="button"
          disabled={disabled}
          onClick={onReset}
        >
          ↺ Сбросить
        </button>
        <button
          className="btn btn-danger btn-sm btn-full btn-dashed"
          type="button"
          disabled={disabled}
          onClick={onExit}
        >
          ✕ Выйти из уровня
        </button>
      </div>
    </aside>
  );
}
