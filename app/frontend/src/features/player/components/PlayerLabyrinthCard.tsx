import { formatDifficultyStars } from '../../../shared/lib/format';
import type { LabyrinthListItem } from '@labyrinth/shared/types/domain';
import { algorithmLabels, themeLabels, themeMarks } from '../../../shared/ui/labels';
import { LabyrinthPreviewAnchor } from '../../../shared/ui/LabyrinthPreviewAnchor';

interface PlayerLabyrinthCardProps {
  item: LabyrinthListItem;
  isSelected: boolean;
  onSelect: (item: LabyrinthListItem) => void;
}

export function PlayerLabyrinthCard({
  item,
  isSelected,
  onSelect,
}: PlayerLabyrinthCardProps) {
  return (
    <button
      className={`player-maze-list-item ${isSelected ? 'selected' : ''}`}
      type="button"
      onClick={() => onSelect(item)}
    >
      <LabyrinthPreviewAnchor item={item}>
        <span className="player-maze-list-title">
          {themeMarks[item.theme]} {item.name}
        </span>
        <span className="player-maze-list-meta">
          {algorithmLabels[item.generationAlgorithm]} · {themeLabels[item.theme]} ·{' '}
          {formatDifficultyStars(item.difficulty)}
        </span>
      </LabyrinthPreviewAnchor>
    </button>
  );
}
