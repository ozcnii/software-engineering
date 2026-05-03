import type { LabyrinthListItem } from '../../shared/types/domain';

interface AdminDeleteModalProps {
  labyrinth: LabyrinthListItem | null;
  error: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AdminDeleteModal({
  labyrinth,
  error,
  isDeleting,
  onCancel,
  onConfirm,
}: AdminDeleteModalProps) {
  if (!labyrinth) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <div className="modal-head">
          <h2 id="delete-title">Подтверждение удаления</h2>
          <button className="modal-close" type="button" onClick={onCancel} aria-label="Закрыть">
            x
          </button>
        </div>
        <div className="modal-body">
          <p className="muted">Удалить выбранный лабиринт?</p>
          <strong>{labyrinth.name}</strong>
          {error ? <div className="form-error">{error}</div> : null}
        </div>
        <div className="modal-actions">
          <button className="btn btn-sm btn-ghost" type="button" onClick={onCancel} disabled={isDeleting}>
            Отмена
          </button>
          <button className="btn btn-sm btn-danger" type="button" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Удаляем...' : 'Подтвердить удаление'}
          </button>
        </div>
      </section>
    </div>
  );
}
