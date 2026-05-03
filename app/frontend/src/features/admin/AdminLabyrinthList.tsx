import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '../../shared/api/client';
import { labyrinthsApi } from '../../shared/api/labyrinthsApi';
import type { LabyrinthListItem } from '../../shared/types/domain';
import { algorithmLabels, themeLabels, themeMarks } from '../../shared/ui/labels';
import { AdminDeleteModal } from './AdminDeleteModal';

const SEARCH_DEBOUNCE_MS = 500;
const PAGE_LIMIT = 20;

export function AdminLabyrinthList() {
  const [items, setItems] = useState<LabyrinthListItem[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<LabyrinthListItem | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState('');
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;

    setIsLoadingInitial(true);
    setError('');

    labyrinthsApi
      .list({ search: debouncedSearch, limit: PAGE_LIMIT })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setItems(response.items);
        setNextCursor(response.nextCursor);
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(errorMessage(loadError, 'Не удалось загрузить лабиринты'));
          setItems([]);
          setNextCursor(null);
        }
      })
      .finally(() => {
        if (isMounted) {
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

    try {
      const response = await labyrinthsApi.list({
        search: debouncedSearch,
        cursor: nextCursor,
        limit: PAGE_LIMIT,
      });

      setItems((current) => [...current, ...response.items]);
      setNextCursor(response.nextCursor);
    } catch (loadError) {
      setError(errorMessage(loadError, 'Не удалось загрузить следующую страницу'));
    } finally {
      setIsLoadingMore(false);
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
      { rootMargin: '240px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore]);

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await labyrinthsApi.delete(deleteTarget.id);
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      setToast(`Лабиринт «${deleteTarget.name}» удалён`);
      setDeleteTarget(null);
    } catch (deleteRequestError) {
      setDeleteError(errorMessage(deleteRequestError, 'Не удалось удалить лабиринт'));
    } finally {
      setIsDeleting(false);
    }
  }

  const isEmpty = !isLoadingInitial && items.length === 0 && !error;
  const emptyText = debouncedSearch ? 'Ничего не найдено' : 'Нет лабиринтов';

  return (
    <div>
      <div className="list-title-row">
        <div>
          <h1 className="admin-page-title">Все лабиринты</h1>
          <p className="admin-page-sub">Управление созданными лабиринтами</p>
        </div>
        <Link className="btn btn-primary" to="/admin/create">
          + Создать
        </Link>
      </div>

      {toast ? (
        <div className="toast" role="status">
          {toast}
          <button className="toast-close" type="button" onClick={() => setToast('')}>
            x
          </button>
        </div>
      ) : null}

      <section className="card admin-list-card">
        <div className="card-toolbar">
          <span className="card-title no-border">Список лабиринтов</span>
          <input
            className="input search-input"
            type="text"
            placeholder="поиск..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        {error ? <div className="form-error">{error}</div> : null}

        {isLoadingInitial ? <ListSkeleton /> : null}

        {!isLoadingInitial && items.length > 0 ? (
          <>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Размер</th>
                    <th>Алгоритм</th>
                    <th>Тема</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        {item.width} x {item.height}
                      </td>
                      <td>{algorithmLabels[item.generationAlgorithm]}</td>
                      <td>
                        {themeMarks[item.theme]} {themeLabels[item.theme]}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger btn-dashed"
                          type="button"
                          onClick={() => {
                            setDeleteError('');
                            setDeleteTarget(item);
                          }}
                        >
                          удал.
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-list">
              {items.map((item) => (
                <article className="maze-list-card" key={item.id}>
                  <div className="maze-list-title">{item.name}</div>
                  <div className="maze-list-meta">
                    {item.width} x {item.height} · {algorithmLabels[item.generationAlgorithm]} ·{' '}
                    {themeLabels[item.theme]}
                  </div>
                  <button
                    className="btn btn-sm btn-danger btn-dashed"
                    type="button"
                    onClick={() => {
                      setDeleteError('');
                      setDeleteTarget(item);
                    }}
                  >
                    удал.
                  </button>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {isEmpty ? <div className="empty-state">{emptyText}</div> : null}

        <div ref={sentinelRef} className="scroll-sentinel" />
        {isLoadingMore ? <div className="hint centered">загружаем ещё...</div> : null}
      </section>

      <AdminDeleteModal
        labyrinth={deleteTarget}
        error={deleteError}
        isDeleting={isDeleting}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError('');
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="skeleton-list" aria-label="Загрузка списка">
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
