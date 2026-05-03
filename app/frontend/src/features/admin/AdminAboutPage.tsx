export function AdminAboutPage() {
  return (
    <div>
      <h1 className="admin-page-title">О разработчике</h1>
      <p className="admin-page-sub">Сведения о курсовом проекте</p>

      <section className="card info-card">
        <div className="card-title">Авторы</div>
        <dl className="info-list">
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
      </section>
    </div>
  );
}
