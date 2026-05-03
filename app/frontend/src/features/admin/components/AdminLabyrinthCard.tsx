import type { LabyrinthListItem } from '../../../shared/types/domain';
import { algorithmLabels, themeLabels } from '../../../shared/ui/labels';

interface AdminLabyrinthCardProps {
  item: LabyrinthListItem;
  onDelete: (item: LabyrinthListItem) => void;
}

export function AdminLabyrinthCard({ item, onDelete }: AdminLabyrinthCardProps) {
  return (
    <article className="maze-list-card">
      <div className="maze-list-title">{item.name}</div>
      <div className="maze-list-meta">
        {item.width} x {item.height} · {algorithmLabels[item.generationAlgorithm]} ·{' '}
        {themeLabels[item.theme]}
      </div>
      <button className="btn btn-sm btn-danger btn-dashed" type="button" onClick={() => onDelete(item)}>
        удал.
      </button>
    </article>
  );
}
