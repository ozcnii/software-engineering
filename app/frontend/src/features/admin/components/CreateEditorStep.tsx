import type { MazeGrid } from '@labyrinth/shared/types/domain';
import { algorithmLabels, themeLabels } from '../../../shared/ui/labels';
import { AdminMazeEditor } from '../AdminMazeEditor';
import type { WizardParams } from '../model/createWizardState';

interface CreateEditorStepProps {
  params: WizardParams;
  grid: MazeGrid;
  editorResetKey: number;
  onGridChange: (grid: MazeGrid) => void;
  onRegenerate: () => void;
}

export function CreateEditorStep({
  params,
  grid,
  editorResetKey,
  onGridChange,
  onRegenerate,
}: CreateEditorStepProps) {
  return (
    <>
      <div className="editor-summary card">
        <strong>{params.name}</strong>
        <span>
          {params.width} x {params.height} · {themeLabels[params.theme]} ·{' '}
          {algorithmLabels[params.generationAlgorithm]}
        </span>
        <button className="btn btn-sm btn-accent" type="button" onClick={onRegenerate}>
          Перегенерировать
        </button>
      </div>
      <AdminMazeEditor grid={grid} resetKey={editorResetKey} onChange={onGridChange} />
    </>
  );
}
