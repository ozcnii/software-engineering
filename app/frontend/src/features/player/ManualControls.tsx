import type { Direction } from './model/playerState';

interface ManualControlsProps {
  disabled: boolean;
  onMove: (direction: Direction) => void;
}

export function ManualControls({ disabled, onMove }: ManualControlsProps) {
  return (
    <div className="manual-controls">
      <div className="dpad" aria-label="d-pad">
        <div className="dpad-empty" />
        <button
          className="dpad-btn"
          type="button"
          disabled={disabled}
          onClick={() => onMove('up')}
        >
          ↑
        </button>
        <div className="dpad-empty" />
        <button
          className="dpad-btn"
          type="button"
          disabled={disabled}
          onClick={() => onMove('left')}
        >
          ←
        </button>
        <div className="dpad-empty" />
        <button
          className="dpad-btn"
          type="button"
          disabled={disabled}
          onClick={() => onMove('right')}
        >
          →
        </button>
        <div className="dpad-empty" />
        <button
          className="dpad-btn"
          type="button"
          disabled={disabled}
          onClick={() => onMove('down')}
        >
          ↓
        </button>
        <div className="dpad-empty" />
      </div>
      <div className="manual-hint">
        стрелки клавиатуры
        <br />
        или кнопки d-pad
        <br />
        для перемещения
      </div>
    </div>
  );
}
