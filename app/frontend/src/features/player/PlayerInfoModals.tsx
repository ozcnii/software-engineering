import { AppModal } from '../../shared/ui/AppModal';

type PlayerModal = 'about' | 'system' | null;

interface PlayerInfoModalsProps {
  activeModal: PlayerModal;
  onClose: () => void;
}

export function PlayerInfoModals({ activeModal, onClose }: PlayerInfoModalsProps) {
  if (!activeModal) {
    return null;
  }

  return (
    <AppModal
      title={activeModal === 'about' ? 'О разработчике' : 'Как пользоваться'}
      className={activeModal === 'system' ? 'player-system-modal' : ''}
      onClose={onClose}
      actions={
        <>
          <button className="btn btn-sm btn-primary" type="button" onClick={onClose}>
            Закрыть
          </button>
        </>
      }
    >
      {activeModal === 'about' ? <AboutBody /> : <SystemBody />}
    </AppModal>
  );
}

function AboutBody() {
  return (
    <div className="modal-body">
      <dl className="info-list modal-info-list">
        <div>
          <dt>Авторы проекта</dt>
          <dd>Фокин Евгений Андреевич, Сидоров Артемий Олегович</dd>
        </div>
        <div>
          <dt>Группа</dt>
          <dd>6303</dd>
        </div>
        <div>
          <dt>Учебное заведение</dt>
          <dd>Самарский национальный исследовательский университет имени академика С.П. Королёва</dd>
        </div>
        <div>
          <dt>Год</dt>
          <dd>2026</dd>
        </div>
        <div>
          <dt>Руководитель</dt>
          <dd>Зеленко Лариса Сергеевна</dd>
        </div>
        <div>
          <dt>Кафедра</dt>
          <dd>Информационных систем</dd>
        </div>
      </dl>
    </div>
  );
}

function SystemBody() {
  return (
    <div className="modal-body player-system-body">
      <InfoBlock title="Выбор лабиринта">
        В левой панели найдите нужный лабиринт через поиск или прокрутку списка. Клик по названию
        загружает уровень на поле.
      </InfoBlock>
      <InfoBlock title="Ручное управление">
        Вкладка «Ручное» принимает стрелки клавиатуры, WASD и d-pad. Персонаж идёт только по проходам.
      </InfoBlock>
      <InfoBlock title="Авто-решение">
        Вкладка «Авто-решение» запускает BFS или DFS, показывает путь сразу или с анимацией.
      </InfoBlock>
      <InfoBlock title="Темы оформления">
        Локальная тема меняет только текущую сессию прохождения и сбрасывается после выхода из уровня.
      </InfoBlock>
      <InfoBlock title="Сброс и выход">
        Сброс возвращает персонажа на старт. Выход закрывает активный уровень и возвращает к выбору.
      </InfoBlock>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: string }) {
  return (
    <section className="player-info-block">
      <h3>{title}</h3>
      <p>{children}</p>
    </section>
  );
}
