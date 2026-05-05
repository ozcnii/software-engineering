import { useCallback, useEffect, useRef, useState } from 'react';
import { labyrinthsApi } from '../../../shared/api/labyrinthsApi';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { useIntersectionLoadMore } from '../../../shared/hooks/useIntersectionLoadMore';
import { getErrorMessage } from '../../../shared/lib/errors';
import type { LabyrinthListItem } from '@labyrinth/shared/types/domain';

const SEARCH_DEBOUNCE_MS = 500;
const PAGE_LIMIT = 20;

export function usePlayerLabyrinthList() {
  const [items, setItems] = useState<LabyrinthListItem[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const listRequestIdRef = useRef(0);

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
          setError(getErrorMessage(loadError, 'Не удалось загрузить лабиринты'));
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
        setError(getErrorMessage(loadError, 'Не удалось загрузить следующую страницу'));
      }
    } finally {
      if (listRequestIdRef.current === requestId) {
        setIsLoadingMore(false);
      }
    }
  }, [debouncedSearch, isLoadingInitial, isLoadingMore, nextCursor]);

  useIntersectionLoadMore(sentinelRef, () => void loadMore(), '180px');

  return {
    items,
    searchInput,
    setSearchInput,
    debouncedSearch,
    sentinelRef,
    isLoadingInitial,
    isLoadingMore,
    error,
  };
}
