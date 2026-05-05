import { NavLink, Outlet } from 'react-router-dom';
import type { User } from '@labyrinth/shared/types/domain';

interface AdminLayoutProps {
  user: User;
  onLogout: () => Promise<void>;
}

export function AdminLayout({ user, onLogout }: AdminLayoutProps) {
  return (
    <div className="admin-layout">
      <header className="admin-header">
        <span className="admin-logo">Лабиринт</span>
        <span className="admin-role-label">Панель администратора</span>
        <div className="admin-header-right">
          <span className="badge badge-accent">admin</span>
          <span className="muted">{user.login}</span>
          <button className="btn btn-sm btn-ghost" type="button" onClick={() => void onLogout()}>
            Выйти
          </button>
        </div>
      </header>

      <aside className="admin-sidebar">
        <div className="sidebar-section">Лабиринты</div>
        <NavLink className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} to="/admin" end>
          <span className="sidebar-icon">#</span>
          Все лабиринты
        </NavLink>
        <NavLink
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          to="/admin/create"
        >
          <span className="sidebar-icon">+</span>
          Создать новый
        </NavLink>

        <div className="sidebar-section">Информация</div>
        <NavLink
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          to="/admin/about"
        >
          <span className="sidebar-icon">i</span>
          О разработчике
        </NavLink>
        <NavLink
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          to="/admin/system"
        >
          <span className="sidebar-icon">?</span>
          О системе
        </NavLink>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
