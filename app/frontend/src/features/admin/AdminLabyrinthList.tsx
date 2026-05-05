import { useState } from 'react';
import { Link } from 'react-router-dom';
import { labyrinthsApi } from '../../shared/api/labyrinthsApi';
import { getErrorMessage } from '../../shared/lib/errors';
import type { LabyrinthListItem } from '@labyrinth/shared/types/domain';
import { ListSkeleton } from '../../shared/ui/ListSkeleton';
import { algorithmLabels, themeLabels, themeMarks } from '../../shared/ui/labels';
import { AdminDeleteModal } from './AdminDeleteModal';
import { AdminLabyrinthCard } from './components/AdminLabyrinthCard';
import { useAdminLabyrinthList } from './hooks/useAdminLabyrinthList';

export function AdminLabyrinthList() {
  const [deleteTarget, setDeleteTarget] = useState<LabyrinthListItem | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState('');
  const list = useAdminLabyrinthList();

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await labyrinthsApi.delete(deleteTarget.id);
      list.setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      setToast(`Лабиринт «${deleteTarget.name}» удалён`);
      setDeleteTarget(null);
    } catch (deleteRequestError) {
      setDeleteError(getErrorMessage(deleteRequestError, 'Не удалось удалить лабиринт'));
    } finally {
      setIsDeleting(false);
    }
  }

  const isEmpty = !list.isLoadingInitial && list.items.length === 0 && !list.error;
  const emptyText = list.debouncedSearch ? 'Ничего не найдено' : 'Нет лабиринтов';

  function openDeleteModal(item: LabyrinthListItem) {
    setDeleteError('');
    setDeleteTarget(item);
  }

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
            value={list.searchInput}
            onChange={(event) => list.setSearchInput(event.target.value)}
          />
        </div>

        {list.error ? <div className="form-error">{list.error}</div> : null}

        {list.isLoadingInitial ? <ListSkeleton label="Загрузка списка" /> : null}

        {!list.isLoadingInitial && list.items.length > 0 ? (
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
                  {list.items.map((item) => (
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
                          onClick={() => openDeleteModal(item)}
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
              {list.items.map((item) => (
                <AdminLabyrinthCard item={item} key={item.id} onDelete={openDeleteModal} />
              ))}
            </div>
          </>
        ) : null}

        {isEmpty ? <div className="empty-state">{emptyText}</div> : null}

        <div ref={list.sentinelRef} className="scroll-sentinel" />
        {list.isLoadingMore ? <div className="hint centered">загружаем ещё...</div> : null}
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
