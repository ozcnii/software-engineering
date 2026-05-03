import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiClientError } from '../../shared/api/client';
import { labyrinthsApi } from '../../shared/api/labyrinthsApi';
import type { LabyrinthListItem } from '../../shared/types/domain';
import { algorithmLabels, themeLabels, themeMarks } from '../../shared/ui/labels';

const SEARCH_DEBOUNCE_MS = 500;
const PAGE_LIMIT = 20;

interface PlayerLabyrinthListProps {
  selectedId: string | null;
  detailError: string;
  onSelect: (labyrinth: LabyrinthListItem) => void;
}

export function PlayerLabyrinthList({ selectedId, detailError, onSelect }: PlayerLabyrinthListProps) {
  const [items, setItems] = useState<LabyrinthListItem[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const listRequestIdRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;
    const requestId = listRequestIdRef.current + 1;
    listRequestIdRef.current = requestId;

    setIsLoadingInitial(true);
    setIsLoadingMore(false);
    setError('');

    labyrinthsApi
      .list({ search: debouncedSearch, limit: PAGE_LIMIT })
      .then((response) => {
        if (!isMounted || listRequestIdRef.current !== requestId) {
          return;
        }

        setItems(response.items);
        setNextCursor(response.nextCursor);
      })
      .catch((loadError: unknown) => {
        if (isMounted && listRequestIdRef.current === requestId) {
          setError(errorMessage(loadError, 'Не удалось загрузить лабиринты'));
          setItems([]);
          setNextCursor(null);
        }
      })
      .finally(() => {
        if (isMounted && listRequestIdRef.current === requestId) {
          setIsLoadingInitial(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore || isLoadingInitial) {
      return;
    }

    setIsLoadingMore(true);
    const requestId = listRequestIdRef.current;

    try {
      const response = await labyrinthsApi.list({
        search: debouncedSearch,
        cursor: nextCursor,
        limit: PAGE_LIMIT,
      });

      if (listRequestIdRef.current !== requestId) {
        return;
      }

      setItems((current) => [...current, ...response.items]);
      setNextCursor(response.nextCursor);
    } catch (loadError) {
      if (listRequestIdRef.current === requestId) {
        setError(errorMessage(loadError, 'Не удалось загрузить следующую страницу'));
      }
    } finally {
      if (listRequestIdRef.current === requestId) {
        setIsLoadingMore(false);
      }
    }
  }, [debouncedSearch, isLoadingInitial, isLoadingMore, nextCursor]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: '180px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore]);

  const isEmpty = !isLoadingInitial && items.length === 0 && !error;
  const emptyText = debouncedSearch ? 'Ничего не найдено' : 'Нет лабиринтов';

  return (
    <div>
      <div className="panel-title">Выбор лабиринта</div>
      <input
        className="input player-search"
        type="text"
        placeholder="поиск..."
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
      />

      {detailError ? <div className="form-error compact-error">{detailError}</div> : null}
      {error ? <div className="form-error compact-error">{error}</div> : null}

      <div className="player-maze-list">
        {isLoadingInitial ? <ListSkeleton /> : null}

        {!isLoadingInitial
          ? items.map((item) => (
              <button
                className={`player-maze-list-item ${selectedId === item.id ? 'selected' : ''}`}
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
              >
                <span className="player-maze-list-title">
                  {themeMarks[item.theme]} {item.name}
                </span>
                <span className="player-maze-list-meta">
                  {algorithmLabels[item.generationAlgorithm]} · {themeLabels[item.theme]} ·{' '}
                  {difficultyStars(item.difficulty)}
                </span>
              </button>
            ))
          : null}

        {isEmpty ? <div className="empty-state player-empty-state">{emptyText}</div> : null}
        <div ref={sentinelRef} className="scroll-sentinel" />
        {isLoadingMore ? <div className="hint centered">загружаем ещё...</div> : null}
      </div>
    </div>
  );
}

function difficultyStars(difficulty: number) {
  return `${'★'.repeat(Math.max(1, Math.min(3, difficulty)))}${'☆'.repeat(
    Math.max(0, 3 - Math.max(1, Math.min(3, difficulty))),
  )}`;
}

function ListSkeleton() {
  return (
    <div className="skeleton-list" aria-label="Загрузка списка лабиринтов">
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}
