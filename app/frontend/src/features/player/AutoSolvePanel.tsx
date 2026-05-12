import type { SolvingAlgorithm } from '@labyrinth/shared/types/domain';
import type { AutoDisplayMode } from './model/playerState';

interface AutoSolvePanelProps {
  algorithm: SolvingAlgorithm;
  displayMode: AutoDisplayMode;
  speed: number;
  error: string;
  disabled: boolean;
  isRunning: boolean;
  speedDisabled: boolean;
  onAlgorithmChange: (algorithm: SolvingAlgorithm) => void;
  onDisplayModeChange: (mode: AutoDisplayMode) => void;
  onSpeedChange: (speed: number) => void;
  onStart: () => void;
}

export function AutoSolvePanel({
  algorithm,
  displayMode,
  speed,
  error,
  disabled,
  isRunning,
  speedDisabled,
  onAlgorithmChange,
  onDisplayModeChange,
  onSpeedChange,
  onStart,
}: AutoSolvePanelProps) {
  return (
    <div className="auto-panel">
      <div>
        <label className="label">Алгоритм поиска пути</label>
        <div className="radio-list">
          <RadioOption
            checked={algorithm === 'wave'}
            disabled={isRunning || displayMode === 'instant'}
            name="solve-algorithm"
            onChange={() => onAlgorithmChange('wave')}
          >
            Волновой алгоритм — кратчайший путь
          </RadioOption>
          <RadioOption
            checked={algorithm === 'rightHand'}
            disabled={isRunning || displayMode === 'instant'}
            name="solve-algorithm"
            onChange={() => onAlgorithmChange('rightHand')}
          >
            Метод правой руки — движение вдоль стены
          </RadioOption>
        </div>
        {displayMode === 'instant' ? (
          <div className="hint">мгновенный результат строится волновым алгоритмом</div>
        ) : null}
      </div>

      <hr className="divider" />

      <div>
        <label className="label">Режим отображения</label>
        <div className="radio-list">
          <RadioOption
            checked={displayMode === 'animated'}
            disabled={isRunning}
            name="solve-display-mode"
            onChange={() => onDisplayModeChange('animated')}
          >
            С анимацией (пошагово)
          </RadioOption>
          <RadioOption
            checked={displayMode === 'instant'}
            disabled={isRunning}
            name="solve-display-mode"
            onChange={() => onDisplayModeChange('instant')}
          >
            Мгновенный результат
          </RadioOption>
        </div>
      </div>

      {displayMode === 'animated' ? (
        <div>
          <label className="label">Скорость перемещения</label>
          <div className="speed-row">
            <span className="speed-edge">1/с</span>
            <input
              className="sketch-range"
              type="range"
              min="1"
              max="10"
              step="1"
              value={speed}
              disabled={speedDisabled}
              onChange={(event) => onSpeedChange(Number(event.target.value))}
            />
            <span className="speed-edge">10/с</span>
          </div>
          <div className="speed-value">{speed} шага/сек</div>
        </div>
      ) : null}

      {error ? <div className="form-error compact-error">{error}</div> : null}

      <button
        className="btn btn-accent btn-full"
        type="button"
        disabled={disabled}
        onClick={onStart}
      >
        ▶ Запустить решение
      </button>
    </div>
  );
}

function RadioOption({
  checked,
  disabled,
  name,
  onChange,
  children,
}: {
  checked: boolean;
  disabled: boolean;
  name: string;
  onChange: () => void;
  children: string;
}) {
  return (
    <label className={`check-item ${disabled ? 'disabled' : ''}`}>
      <input
        className="native-check"
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className={`radio-dot ${checked ? 'on' : ''}`} />
      {children}
    </label>
  );
}
