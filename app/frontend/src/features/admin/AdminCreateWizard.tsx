import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClientError } from '../../shared/api/client';
import { labyrinthsApi } from '../../shared/api/labyrinthsApi';
import type { MazeGrid } from '@labyrinth/shared/types/domain';
import type { ApiFieldErrors } from '@labyrinth/shared/types/api';
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue';
import { validateFinalGrid } from './AdminMazeEditor';
import { CreateEditorStep } from './components/CreateEditorStep';
import { CreateParamsStep } from './components/CreateParamsStep';
import { CreateSaveStep } from './components/CreateSaveStep';
import {
  CreateWizardSteps,
  WizardNav,
  type WizardStep,
} from './components/CreateWizardSteps';
import { validateParams } from './lib/createWizardValidation';
import {
  createTemplateGrid,
  getEntryExitStatus,
  placeAutoEntryExit,
} from './lib/mazeEditorRules';
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
  const [isGenerated, setIsGenerated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nameStatus, setNameStatus] = useState('');
  const nameRequestIdRef = useRef(0);
  const debouncedName = useDebouncedValue(params.name.trim(), 450);

  useEffect(() => {
    const name = debouncedName;

    if (!name) {
      setNameStatus('');
      return undefined;
    }

    const localErrors = validateParams({ ...params, name });

    if (localErrors.name) {
      setNameStatus('');
      return undefined;
    }

    const requestId = nameRequestIdRef.current + 1;
    nameRequestIdRef.current = requestId;
    setNameStatus('проверяем название...');

    labyrinthsApi
      .checkName(name)
      .then((response) => {
        if (nameRequestIdRef.current !== requestId) {
          return;
        }

        setNameStatus(response.available ? 'название свободно' : '');
        setFieldErrors((current) => ({
          ...current,
          name: response.available ? '' : 'Лабиринт с таким названием уже существует',
        }));
      })
      .catch(() => {
        if (nameRequestIdRef.current === requestId) {
          setNameStatus('');
        }
      });

    return undefined;
  }, [debouncedName]);

  async function beginEditor(event?: FormEvent) {
    event?.preventDefault();

    const errors = validateParams(params);
    setFieldErrors(errors);
    setGeneralError('');

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!(await ensureNameAvailable())) {
      return;
    }

    const template = createTemplateGrid(params.width, params.height);
    const nextGrid = params.entryMode === 'auto' ? placeAutoEntryExit(template) : template;

    setGrid(nextGrid);
    setIsGenerated(false);
    setEditorResetKey((current) => current + 1);
    setStep(2);

    if (params.entryMode === 'auto') {
      await generateMaze(nextGrid, 'Не удалось автоматически задать вход и выход');
    }
  }

  async function generateMaze(
    sourceGrid = grid,
    missingEndpointsMessage = 'Сначала задайте вход и выход',
  ) {
    if (!sourceGrid) {
      return false;
    }

    const status = getEntryExitStatus(sourceGrid);

    if (!status.entry || !status.exit) {
      setGeneralError(missingEndpointsMessage);
      return false;
    }

    setIsGenerating(true);
    setGeneralError('');

    try {
      const response = await labyrinthsApi.generate({
        width: params.width,
        height: params.height,
        theme: params.theme,
        generationAlgorithm: params.generationAlgorithm,
        entryMode: params.entryMode,
        entry: status.entry,
        exit: status.exit,
      });

      setGrid(response.grid);
      setIsGenerated(true);
      setEditorResetKey((current) => current + 1);
      return true;
    } catch (error) {
      handleApiError(error, 'Не удалось сгенерировать лабиринт');
      return false;
    } finally {
      setIsGenerating(false);
    }
  }

  async function generateFromEditor() {
    if (isGenerated && !window.confirm('Заменить текущую сетку новой генерацией?')) {
      return;
    }

    await generateMaze(grid);
  }

  function goToSave() {
    if (!grid || !isGenerated) {
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
    if (!grid || !isGenerated) {
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
      setGeneralError(
        error.fields.grid ?? firstFieldError(error.fields) ?? error.message,
      );
    } else {
      setGeneralError(fallback);
    }
  }

  async function ensureNameAvailable() {
    try {
      const response = await labyrinthsApi.checkName(params.name.trim());

      if (response.available) {
        setFieldErrors((current) => ({ ...current, name: '' }));
        return true;
      }

      setFieldErrors((current) => ({
        ...current,
        name: 'Лабиринт с таким названием уже существует',
      }));
      return false;
    } catch (error) {
      handleApiError(error, 'Не удалось проверить название');
      return false;
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
        <form onSubmit={(event) => void beginEditor(event)}>
          <CreateParamsStep
            params={params}
            fieldErrors={fieldErrors}
            nameStatus={nameStatus}
            onChange={setParams}
          />

          <WizardNav
            nextLabel="Далее — вход и выход ->"
            onCancel={() => navigate('/admin')}
            nextType="submit"
          />
        </form>
      ) : null}

      {step === 2 && grid ? (
        <>
          <CreateEditorStep
            params={params}
            grid={grid}
            editorResetKey={editorResetKey}
            isGenerated={isGenerated}
            isGenerating={isGenerating}
            onGridChange={setGrid}
            onGenerate={() => void generateFromEditor()}
          />
          <WizardNav
            prevLabel="<- Назад"
            nextLabel="Далее — Сохранить ->"
            onPrev={() => setStep(1)}
            onCancel={() => navigate('/admin')}
            onNext={goToSave}
            nextDisabled={!isGenerated || isGenerating}
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
