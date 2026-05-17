import { Link } from 'react-router-dom';
import type { User } from '@labyrinth/shared/types/domain';
import { AppModal } from '../../shared/ui/AppModal';

interface PlayerHelpPageProps {
  user: User;
  onLogout: () => Promise<void>;
}

export function HelpPage() {
  return (
    <div>
      <h1 className="admin-page-title">Справка</h1>
      <p className="admin-page-sub">Общая информация о системе и работе с лабиринтами</p>

      <section className="info-grid">
        <InfoCard title="Назначение">
          Система позволяет создавать толстостенные лабиринты, выбирать тему оформления,
          просматривать список уровней и проходить лабиринты вручную или автоматически.
        </InfoCard>
        <InfoCard title="Создание лабиринтов">
          Администратор задаёт название, нечётные размеры от 7 до 25, тему, алгоритм
          генерации и режим входа/выхода. При сохранении лабиринт должен оставаться
          толстостенным.
        </InfoCard>
        <InfoCard title="Редактор">
          Внутри лабиринта сохраняется сетка с толщиной стены и прохода в одну клетку.
          Проходные узлы и пересечения стен защищены от правок, которые ломают структуру.
        </InfoCard>
        <InfoCard title="Прохождение">
          Игрок выбирает лабиринт из списка, проходит его стрелками, WASD или кнопками
          управления. Ходы через стены не засчитываются.
        </InfoCard>
        <InfoCard title="Авто-решение">
          Волновой алгоритм строит кратчайший путь. Метод правой руки двигается вдоль
          стены и может не найти выход в лабиринте с неподходящей структурой проходов.
        </InfoCard>
        <InfoCard title="Темы">
          Доступны четыре темы: зима, лето, осень и весна. Для игрока смена темы действует
          локально в текущей сессии прохождения.
        </InfoCard>
      </section>
    </div>
  );
}

export function PlayerHelpPage({ user, onLogout }: PlayerHelpPageProps) {
  return (
    <div className="player-help-page">
      <header className="player-header">
        <span className="player-logo">Лабиринт</span>
        <span className="player-role-label">Справка игрока</span>
        <div className="player-header-right">
          <span className="badge badge-success">игрок</span>
          <span className="muted">{user.login}</span>
          <button
            className="btn btn-sm btn-ghost"
            type="button"
            onClick={() => void onLogout()}
          >
            Выйти
          </button>
        </div>
      </header>
      <main className="player-help-main">
        <Link className="link-button" to="/player">
          ← к лабиринтам
        </Link>
        <HelpPage />
      </main>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: string }) {
  return (
    <article className="card">
      <div className="card-title">{title}</div>
      <p>{children}</p>
    </article>
  );
}

export function DevelopersModal({ onClose }: { onClose: () => void }) {
  return (
    <AppModal
      title="О разработчиках"
      onClose={onClose}
      actions={
        <button className="btn btn-sm btn-primary" type="button" onClick={onClose}>
          Закрыть
        </button>
      }
    >
      <div className="modal-body">
        <p>
          Фокин Евгений Андреевич, Сидоров Артемий Олегович, группа 6303. Самарский
          университет, кафедра информационных систем, 2026.
        </p>
        <p>Руководитель: Зеленко Лариса Сергеевна.</p>
      </div>
    </AppModal>
  );
}
