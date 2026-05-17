import type { LabyrinthListItem } from '@labyrinth/shared/types/domain';
import { ListSkeleton } from '../../shared/ui/ListSkeleton';
import { PlayerLabyrinthCard } from './components/PlayerLabyrinthCard';
import { usePlayerLabyrinthList } from './hooks/usePlayerLabyrinthList';

interface PlayerLabyrinthListProps {
  selectedId: string | null;
  detailError: string;
  onSelect: (labyrinth: LabyrinthListItem) => void;
}

export function PlayerLabyrinthList({
  selectedId,
  detailError,
  onSelect,
}: PlayerLabyrinthListProps) {
  const list = usePlayerLabyrinthList();
  const isEmpty = !list.isLoadingInitial && list.items.length === 0 && !list.error;
  const emptyText = list.debouncedSearch ? 'Ничего не найдено' : 'Нет лабиринтов';

  return (
    <div>
      <div className="panel-title">Выбор лабиринта</div>
      <input
        className="input player-search"
        type="text"
        placeholder="поиск..."
        value={list.searchInput}
        onChange={(event) => list.setSearchInput(event.target.value)}
      />

      {detailError ? <div className="form-error compact-error">{detailError}</div> : null}
      {list.error ? <div className="form-error compact-error">{list.error}</div> : null}

      <div className="player-maze-list">
        {list.isLoadingInitial ? (
          <ListSkeleton label="Загрузка списка лабиринтов" />
        ) : null}

        {!list.isLoadingInitial
          ? list.items.map((item) => (
              <PlayerLabyrinthCard
                item={item}
                isSelected={selectedId === item.id}
                key={item.id}
                onSelect={onSelect}
              />
            ))
          : null}

        {isEmpty ? (
          <div className="empty-state player-empty-state">{emptyText}</div>
        ) : null}
        <div ref={list.sentinelRef} className="scroll-sentinel" />
        {list.isLoadingMore ? (
          <div className="hint centered">загружаем ещё...</div>
        ) : null}
      </div>
    </div>
  );
}
