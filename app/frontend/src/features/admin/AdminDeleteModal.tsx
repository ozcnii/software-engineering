import type { LabyrinthListItem } from '@labyrinth/shared/types/domain';
import { AppModal } from '../../shared/ui/AppModal';

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
    <AppModal
      title="Подтверждение удаления"
      titleId="delete-title"
      onClose={onCancel}
      actions={
        <>
          <button
            className="btn btn-sm btn-ghost"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Отмена
          </button>
          <button
            className="btn btn-sm btn-danger"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаляем...' : 'Подтвердить удаление'}
          </button>
        </>
      }
    >
      <div className="modal-body">
        <p className="muted">Удалить выбранный лабиринт?</p>
        <strong>{labyrinth.name}</strong>
        {error ? <div className="form-error">{error}</div> : null}
      </div>
    </AppModal>
  );
}
