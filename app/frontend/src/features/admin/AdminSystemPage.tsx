export function AdminSystemPage() {
  return (
    <div>
      <h1 className="admin-page-title">О системе</h1>
      <p className="admin-page-sub">Руководство администратора</p>

      <section className="info-grid">
        <article className="card">
          <div className="card-title">Список лабиринтов</div>
          <p>
            Раздел «Все лабиринты» показывает сохранённые лабиринты, поддерживает поиск по названию
            и удаление через подтверждение.
          </p>
        </article>
        <article className="card">
          <div className="card-title">Создание</div>
          <p>
            Мастер состоит из параметров, редактора и шага сохранения. Перед сохранением должны быть
            заданы корректные вход и выход.
          </p>
        </article>
        <article className="card">
          <div className="card-title">Алгоритмы генерации</div>
          <p>
            Алгоритм Прима строит более равномерные лабиринты. Алгоритм Краскала создаёт более
            хаотичные коридоры.
          </p>
        </article>
        <article className="card">
          <div className="card-title">Темы оформления</div>
          <p>Доступны четыре темы: зима, лето, осень и весна. Тема влияет только на отображение.</p>
        </article>
      </section>
    </div>
  );
}
