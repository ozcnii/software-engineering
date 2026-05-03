import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClientError } from '../../shared/api/client';
import { labyrinthsApi } from '../../shared/api/labyrinthsApi';
import type {
  ApiFieldErrors,
  EntryMode,
  GenerationAlgorithm,
  LabyrinthTheme,
  MazeGrid,
} from '../../shared/types/domain';
import { algorithmLabels, themeLabels } from '../../shared/ui/labels';
import { AdminMazeEditor, validateFinalGrid } from './AdminMazeEditor';

interface WizardParams {
  name: string;
  width: number;
  height: number;
  theme: LabyrinthTheme;
  entryMode: EntryMode;
  generationAlgorithm: GenerationAlgorithm;
}

const defaultParams: WizardParams = {
  name: '',
  width: 11,
  height: 11,
  theme: 'winter',
  entryMode: 'auto',
  generationAlgorithm: 'prim',
};

export function AdminCreateWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [params, setParams] = useState<WizardParams>(defaultParams);
  const [grid, setGrid] = useState<MazeGrid | null>(null);
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function generate(event?: FormEvent) {
    event?.preventDefault();

    const errors = validateParams(params);
    setFieldErrors(errors);
    setGeneralError('');

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsGenerating(true);

    try {
      const response = await labyrinthsApi.generate({
        width: params.width,
        height: params.height,
        theme: params.theme,
        generationAlgorithm: params.generationAlgorithm,
        entryMode: params.entryMode,
      });

      setGrid(response.grid);
      setEditorResetKey((current) => current + 1);
      setStep(2);
    } catch (error) {
      handleApiError(error, 'Не удалось сгенерировать лабиринт');
    } finally {
      setIsGenerating(false);
    }
  }

  async function regenerate() {
    if (!window.confirm('Заменить текущую сетку новой генерацией?')) {
      return;
    }

    await generate();
  }

  function goToSave() {
    if (!grid) {
      setGeneralError('Сначала сгенерируйте лабиринт');
      return;
    }

    const gridError = validateFinalGrid(grid);

    if (gridError) {
      setGeneralError(gridError);
      return;
    }

    setGeneralError('');
    setStep(3);
  }

  async function save() {
    if (!grid) {
      return;
    }

    const gridError = validateFinalGrid(grid);

    if (gridError) {
      setGeneralError(gridError);
      setStep(2);
      return;
    }

    setIsSaving(true);
    setGeneralError('');

    try {
      await labyrinthsApi.create({
        name: params.name,
        width: params.width,
        height: params.height,
        theme: params.theme,
        generationAlgorithm: params.generationAlgorithm,
        entryMode: params.entryMode,
        grid,
      });
      navigate('/admin');
    } catch (error) {
      handleApiError(error, 'Не удалось сохранить лабиринт');
    } finally {
      setIsSaving(false);
    }
  }

  function handleApiError(error: unknown, fallback: string) {
    if (error instanceof ApiClientError) {
      setFieldErrors(error.fields);
      setGeneralError(error.message);
    } else {
      setGeneralError(fallback);
    }
  }

  return (
    <div>
      <div className="wizard-head">
        <button className="link-button" type="button" onClick={() => navigate('/admin')}>
          ← к списку
        </button>
        <h1 className="admin-page-title">Создать лабиринт</h1>
        <span className="badge badge-warn">не сохранён</span>
      </div>

      <Stepper step={step} />

      {generalError ? <div className="form-error">{generalError}</div> : null}

      {step === 1 ? (
        <form onSubmit={(event) => void generate(event)}>
          <div className="wiz-params">
            <section className="card full-span">
              <div className="card-title">Название лабиринта</div>
              <input
                className="input"
                type="text"
                placeholder="например: Зимний лабиринт..."
                value={params.name}
                onChange={(event) => setParams({ ...params, name: event.target.value })}
              />
              {fieldErrors.name ? <div className="err">{fieldErrors.name}</div> : null}
            </section>

            <section className="card">
              <div className="card-title">Размеры</div>
              <div className="form-grid">
                <NumberField
                  label="Ширина"
                  value={params.width}
                  error={fieldErrors.width}
                  onChange={(width) => setParams({ ...params, width })}
                />
                <NumberField
                  label="Высота"
                  value={params.height}
                  error={fieldErrors.height}
                  onChange={(height) => setParams({ ...params, height })}
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
              onChange={(theme) => setParams({ ...params, theme })}
            />

            <RadioCard<EntryMode>
              title="Вход и выход"
              value={params.entryMode}
              options={[
                ['auto', 'Авто (на периметре)'],
                ['manual', 'Вручную (на холсте)'],
              ]}
              hint="не в углах · вход ≠ выход"
              onChange={(entryMode) => setParams({ ...params, entryMode })}
            />

            <RadioCard<GenerationAlgorithm>
              title="Алгоритм генерации"
              value={params.generationAlgorithm}
              options={[
                ['prim', 'Алгоритм Прима'],
                ['kruskal', 'Алгоритм Краскала'],
              ]}
              hint="Прим — равномерный. Краскал — хаотичный."
              onChange={(generationAlgorithm) => setParams({ ...params, generationAlgorithm })}
            />
          </div>

          <WizardNav
            nextLabel={isGenerating ? 'Генерируем...' : 'Далее — Сгенерировать ->'}
            onCancel={() => navigate('/admin')}
            nextType="submit"
            nextDisabled={isGenerating}
          />
        </form>
      ) : null}

      {step === 2 && grid ? (
        <>
          <div className="editor-summary card">
            <strong>{params.name}</strong>
            <span>
              {params.width} x {params.height} · {themeLabels[params.theme]} ·{' '}
              {algorithmLabels[params.generationAlgorithm]}
            </span>
            <button className="btn btn-sm btn-accent" type="button" onClick={() => void regenerate()}>
              Перегенерировать
            </button>
          </div>
          <AdminMazeEditor grid={grid} resetKey={editorResetKey} onChange={setGrid} />
          <WizardNav
            prevLabel="<- Назад"
            nextLabel="Далее — Сохранить ->"
            onPrev={() => setStep(1)}
            onCancel={() => navigate('/admin')}
            onNext={goToSave}
          />
        </>
      ) : null}

      {step === 3 && grid ? (
        <>
          <section className="wiz-save card">
            <div className="card-title">Проверка перед сохранением</div>
            <SummaryRow label="Название" value={params.name} />
            <SummaryRow label="Размер" value={`${params.width} x ${params.height}`} />
            <SummaryRow label="Тема" value={themeLabels[params.theme]} />
            <SummaryRow label="Алгоритм" value={algorithmLabels[params.generationAlgorithm]} />
            <SummaryRow label="Вход и выход" value="заданы" />
            <div
              className="mini-preview"
              style={{ gridTemplateColumns: `repeat(${params.width}, minmax(6px, 1fr))` }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <span className={`mini-cell cell-${cell}`} key={`${rowIndex}-${colIndex}`} />
                )),
              )}
            </div>
            <div className="save-actions">
              <button className="btn btn-success btn-full btn-lg" type="button" onClick={() => void save()}>
                {isSaving ? 'Сохраняем...' : 'Сохранить лабиринт'}
              </button>
              <button className="btn btn-ghost btn-full btn-sm" type="button" onClick={() => navigate('/admin')}>
                Отмена
              </button>
            </div>
          </section>
          <WizardNav
            prevLabel="<- Назад"
            nextLabel="Сохранить лабиринт"
            onPrev={() => setStep(2)}
            onCancel={() => navigate('/admin')}
            onNext={() => void save()}
            nextDisabled={isSaving}
          />
        </>
      ) : null}
    </div>
  );
}

function validateParams(params: WizardParams): ApiFieldErrors {
  const errors: ApiFieldErrors = {};

  if (!params.name.trim()) {
    errors.name = 'Введите название лабиринта';
  }

  if (!isValidSize(params.width)) {
    errors.width = 'Ширина должна быть нечётным числом от 7 до 25';
  }

  if (!isValidSize(params.height)) {
    errors.height = 'Высота должна быть нечётным числом от 7 до 25';
  }

  if (!params.theme) {
    errors.theme = 'Выберите тему';
  }

  if (!params.entryMode) {
    errors.entryMode = 'Выберите режим входа и выхода';
  }

  if (!params.generationAlgorithm) {
    errors.generationAlgorithm = 'Выберите алгоритм генерации';
  }

  return errors;
}

function isValidSize(value: number) {
  return Number.isInteger(value) && value >= 7 && value <= 25 && value % 2 === 1;
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const labels = ['Параметры', 'Редактор', 'Сохранить'];

  return (
    <div className="wiz-stepper">
      {labels.map((label, index) => {
        const stepNumber = (index + 1) as 1 | 2 | 3;
        const isDone = stepNumber < step;
        const isActive = stepNumber === step;

        return (
          <div className="stepper-part" key={label}>
            <div className={`wiz-dot ${isDone ? 's-done' : ''} ${isActive ? 's-active' : ''}`}>
              {stepNumber}
            </div>
            <span className={`wiz-lbl ${isActive ? 's-active' : ''}`}>{label}</span>
            {index < labels.length - 1 ? <div className={`wiz-line ${isDone ? 's-done' : ''}`} /> : null}
          </div>
        );
      })}
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
            <span className={`radio-dot ${value === optionValue ? 'on' : ''}`} aria-hidden="true" />
            {label}
          </label>
        ))}
      </div>
      {hint ? <div className="hint">{hint}</div> : null}
    </section>
  );
}

function WizardNav({
  prevLabel,
  nextLabel,
  onPrev,
  onCancel,
  onNext,
  nextType = 'button',
  nextDisabled = false,
}: {
  prevLabel?: string;
  nextLabel: string;
  onPrev?: () => void;
  onCancel: () => void;
  onNext?: () => void;
  nextType?: 'button' | 'submit';
  nextDisabled?: boolean;
}) {
  return (
    <div className="wiz-nav">
      {onPrev ? (
        <button className="btn btn-ghost btn-sm" type="button" onClick={onPrev}>
          {prevLabel}
        </button>
      ) : null}
      <div className="toolbar-spacer" />
      <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel}>
        Отмена
      </button>
      <button className="btn btn-primary" type={nextType} onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </button>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="sum-row">
      <span>{label}</span>
      <strong className="sum-val">{value}</strong>
    </div>
  );
}
