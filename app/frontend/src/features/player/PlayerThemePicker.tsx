import type { LabyrinthTheme } from '@labyrinth/shared/types/domain';
import { themeLabels, themeMarks } from '../../shared/ui/labels';

const themes: LabyrinthTheme[] = ['winter', 'summer', 'autumn', 'spring'];

interface PlayerThemePickerProps {
  value: LabyrinthTheme | null;
  disabled: boolean;
  onChange: (theme: LabyrinthTheme) => void;
}

export function PlayerThemePicker({ value, disabled, onChange }: PlayerThemePickerProps) {
  return (
    <div>
      <div className="panel-title">Тема оформления</div>
      <div className="radio-list">
        {themes.map((theme) => (
          <label className={`check-item ${disabled ? 'disabled' : ''}`} key={theme}>
            <input
              className="native-check"
              type="radio"
              name="player-theme"
              checked={value === theme}
              disabled={disabled}
              onChange={() => onChange(theme)}
            />
            <span className={`radio-dot ${value === theme ? 'on' : ''}`} />
            {themeMarks[theme]} {themeLabels[theme]}
          </label>
        ))}
      </div>
      <div className="hint">изменение локально для сессии</div>
    </div>
  );
}
