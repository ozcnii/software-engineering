import type { MazeGrid } from '@labyrinth/shared/types/domain';
import { algorithmLabels, themeLabels } from '../../../shared/ui/labels';
import type { WizardParams } from '../model/createWizardState';

interface CreateSaveStepProps {
  params: WizardParams;
  grid: MazeGrid;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function CreateSaveStep({ params, grid, isSaving, onSave, onCancel }: CreateSaveStepProps) {
  return (
    <section className="wiz-save card">
      <div className="card-title">Проверка перед сохранением</div>
      <SummaryRow label="Название" value={params.name} />
      <SummaryRow label="Размер" value={`${params.width} x ${params.height}`} />
      <SummaryRow label="Тема" value={themeLabels[params.theme]} />
      <SummaryRow label="Алгоритм" value={algorithmLabels[params.generationAlgorithm]} />
      <SummaryRow label="Вход и выход" value="заданы" />
      <div className="mini-preview" style={{ gridTemplateColumns: `repeat(${params.width}, minmax(6px, 1fr))` }}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <span className={`mini-cell cell-${cell}`} key={`${rowIndex}-${colIndex}`} />
          )),
        )}
      </div>
      <div className="save-actions">
        <button className="btn btn-success btn-full btn-lg" type="button" onClick={onSave}>
          {isSaving ? 'Сохраняем...' : 'Сохранить лабиринт'}
        </button>
        <button className="btn btn-ghost btn-full btn-sm" type="button" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </section>
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
