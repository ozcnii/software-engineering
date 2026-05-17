import type {
  EntryMode,
  GenerationAlgorithm,
  LabyrinthTheme,
} from '@labyrinth/shared/types/domain';
import type { ApiFieldErrors } from '@labyrinth/shared/types/api';
import type { WizardParams } from '../model/createWizardState';

interface CreateParamsStepProps {
  params: WizardParams;
  fieldErrors: ApiFieldErrors;
  nameStatus: string;
  onChange: (params: WizardParams) => void;
}

export function CreateParamsStep({
  params,
  fieldErrors,
  nameStatus,
  onChange,
}: CreateParamsStepProps) {
  return (
    <div className="wiz-params">
      <section className="card full-span">
        <div className="card-title">Название лабиринта</div>
        <input
          className="input"
          type="text"
          placeholder="например: Зимний лабиринт..."
          value={params.name}
          onChange={(event) => onChange({ ...params, name: event.target.value })}
        />
        {fieldErrors.name ? <div className="err">{fieldErrors.name}</div> : null}
        {!fieldErrors.name && nameStatus ? (
          <div className="hint">{nameStatus}</div>
        ) : null}
      </section>

      <section className="card">
        <div className="card-title">Размеры</div>
        <div className="form-grid">
          <NumberField
            label="Ширина"
            value={params.width}
            error={fieldErrors.width}
            onChange={(width) => onChange({ ...params, width })}
          />
          <NumberField
            label="Высота"
            value={params.height}
            error={fieldErrors.height}
            onChange={(height) => onChange({ ...params, height })}
          />
        </div>
      </section>

      <RadioCard<LabyrinthTheme>
        title="Тема оформления"
        value={params.theme}
        options={[
          ['winter', 'Зима'],
          ['summer', 'Лето'],
          ['autumn', 'Осень'],
          ['spring', 'Весна'],
        ]}
        onChange={(theme) => onChange({ ...params, theme })}
      />

      <RadioCard<EntryMode>
        title="Вход и выход"
        value={params.entryMode}
        options={[
          ['auto', 'Авто (на периметре)'],
          ['manual', 'Вручную (на холсте)'],
        ]}
        hint="не в углах · вход ≠ выход"
        onChange={(entryMode) => onChange({ ...params, entryMode })}
      />

      <RadioCard<GenerationAlgorithm>
        title="Алгоритм генерации"
        value={params.generationAlgorithm}
        options={[
          ['prim', 'Алгоритм Прима'],
          ['kruskal', 'Алгоритм Краскала'],
        ]}
        hint="Прим — равномерный. Краскал — хаотичный."
        onChange={(generationAlgorithm) => onChange({ ...params, generationAlgorithm })}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: number;
  error?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="label">
        {label}
        <input
          className="input"
          type="number"
          min={7}
          max={25}
          step={2}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>
      <div className="hint">7–25, нечётное</div>
      {error ? <div className="err">{error}</div> : null}
    </div>
  );
}

function RadioCard<T extends string>({
  title,
  value,
  options,
  hint,
  onChange,
}: {
  title: string;
  value: T;
  options: Array<[T, string]>;
  hint?: string;
  onChange: (value: T) => void;
}) {
  return (
    <section className="card">
      <div className="card-title">{title}</div>
      <div className="radio-list">
        {options.map(([optionValue, label]) => (
          <label className="check-item" key={optionValue}>
            <input
              className="native-check"
              type="radio"
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
            />
            <span
              className={`radio-dot ${value === optionValue ? 'on' : ''}`}
              aria-hidden="true"
            />
            {label}
          </label>
        ))}
      </div>
      {hint ? <div className="hint">{hint}</div> : null}
    </section>
  );
}
