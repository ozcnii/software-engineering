import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClientError } from '../../shared/api/client';
import { labyrinthsApi } from '../../shared/api/labyrinthsApi';
import type { MazeGrid } from '@labyrinth/shared/types/domain';
import type { ApiFieldErrors } from '@labyrinth/shared/types/api';
import { validateFinalGrid } from './AdminMazeEditor';
import { CreateEditorStep } from './components/CreateEditorStep';
import { CreateParamsStep } from './components/CreateParamsStep';
import { CreateSaveStep } from './components/CreateSaveStep';
import { CreateWizardSteps, WizardNav, type WizardStep } from './components/CreateWizardSteps';
import { validateParams } from './lib/createWizardValidation';
import { defaultParams, type WizardParams } from './model/createWizardState';

export function AdminCreateWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
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
      setGeneralError(error.fields.grid ?? firstFieldError(error.fields) ?? error.message);
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

      <CreateWizardSteps step={step} />

      {generalError ? <div className="form-error">{generalError}</div> : null}

      {step === 1 ? (
        <form onSubmit={(event) => void generate(event)}>
          <CreateParamsStep params={params} fieldErrors={fieldErrors} onChange={setParams} />

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
          <CreateEditorStep
            params={params}
            grid={grid}
            editorResetKey={editorResetKey}
            onGridChange={setGrid}
            onRegenerate={() => void regenerate()}
          />
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
          <CreateSaveStep
            params={params}
            grid={grid}
            isSaving={isSaving}
            onSave={() => void save()}
            onCancel={() => navigate('/admin')}
          />
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

function firstFieldError(fields: ApiFieldErrors) {
  return Object.values(fields)[0];
}
