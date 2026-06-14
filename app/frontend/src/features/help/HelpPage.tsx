import { AppModal } from '../../shared/ui/AppModal';

export function DevelopersModal({ onClose }: { onClose: () => void }) {
  return (
    <AppModal
      title="Сведения о разработчиках"
      onClose={onClose}
      actions={
        <button className="btn btn-sm btn-primary" type="button" onClick={onClose}>
          Закрыть
        </button>
      }
    >
      <div className="developers-modal-body">
        <p>Самарский университет</p>
        <p>Кафедра программных систем</p>
        <p>Курсовой проект по дисциплине «Программная инженерия»</p>
        <p>
          Тема проекта: «Автоматизированная система генерирования структуры лабиринта и нахождения
          выхода из него»
        </p>
        <p className="developers-spacer">Разработчики — студенты группы 6303:</p>
        <p>Фокин Е. А.</p>
        <p>Сидоров А. О.</p>
        <p className="developers-spacer">Самара 2026</p>
      </div>
    </AppModal>
  );
}
