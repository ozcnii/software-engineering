import type { MazeGrid } from '@labyrinth/shared/types/domain';
import { algorithmLabels, themeLabels } from '../../../shared/ui/labels';
import { AdminMazeEditor } from '../AdminMazeEditor';
import { getEntryExitStatus } from '../lib/mazeEditorRules';
import type { WizardParams } from '../model/createWizardState';

interface CreateEditorStepProps {
  params: WizardParams;
  grid: MazeGrid;
  editorResetKey: number;
  isGenerated: boolean;
  isGenerating: boolean;
  onGridChange: (grid: MazeGrid) => void;
  onGenerate: () => void;
}

export function CreateEditorStep({
  params,
  grid,
  editorResetKey,
  isGenerated,
  isGenerating,
  onGridChange,
  onGenerate,
}: CreateEditorStepProps) {
  const status = getEntryExitStatus(grid);
  const hasEndpoints = Boolean(status.entry && status.exit);
  const isManualBeforeGeneration = params.entryMode === 'manual' && !isGenerated;
  const generateLabel = isGenerating
    ? 'Генерируем...'
    : isGenerated
      ? 'Перегенерировать'
      : isManualBeforeGeneration && !hasEndpoints
        ? 'Задайте вход и выход'
        : 'Сгенерировать лабиринт';

  return (
    <>
      <div className="editor-summary card">
        <strong>{params.name}</strong>
        <span>
          {params.width} x {params.height} · {themeLabels[params.theme]} ·{' '}
          {algorithmLabels[params.generationAlgorithm]}
        </span>
        <button
          className="btn btn-sm btn-accent"
          type="button"
          disabled={isGenerating || (isManualBeforeGeneration && !hasEndpoints)}
          onClick={onGenerate}
        >
          {generateLabel}
        </button>
      </div>
      <AdminMazeEditor
        grid={grid}
        resetKey={editorResetKey}
        theme={params.theme}
        enabledTools={isGenerated ? ['wall', 'path', 'entry', 'exit'] : ['entry', 'exit']}
        isBlank={isManualBeforeGeneration}
        validateConnectivityOnEdit={isGenerated}
        onChange={onGridChange}
      />
    </>
  );
}
