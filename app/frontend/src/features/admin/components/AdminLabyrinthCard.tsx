import type { LabyrinthListItem } from '@labyrinth/shared/types/domain';
import { algorithmLabels, themeLabels } from '../../../shared/ui/labels';
import { LabyrinthPreviewAnchor } from '../../../shared/ui/LabyrinthPreviewAnchor';

interface AdminLabyrinthCardProps {
  item: LabyrinthListItem;
  onDelete: (item: LabyrinthListItem) => void;
}

export function AdminLabyrinthCard({ item, onDelete }: AdminLabyrinthCardProps) {
  return (
    <article className="maze-list-card">
      <LabyrinthPreviewAnchor item={item}>
        <span className="maze-list-title">{item.name}</span>
        <span className="maze-list-meta">
          {item.width} x {item.height} · {algorithmLabels[item.generationAlgorithm]} ·{' '}
          {themeLabels[item.theme]}
        </span>
      </LabyrinthPreviewAnchor>
      <button
        className="btn btn-sm btn-danger btn-dashed"
        type="button"
        onClick={() => onDelete(item)}
      >
        удал.
      </button>
    </article>
  );
}
