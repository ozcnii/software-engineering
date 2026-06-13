import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import type { User } from '@labyrinth/shared/types/domain';
import { DevelopersModal } from '../help/HelpPage';

interface AdminLayoutProps {
  user: User;
  onLogout: () => Promise<void>;
}

export function AdminLayout({ user, onLogout }: AdminLayoutProps) {
  const [isDevelopersOpen, setIsDevelopersOpen] = useState(false);

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <span className="admin-logo">Лабиринт</span>
        <span className="admin-role-label">Панель администратора</span>
        <div className="admin-header-right">
          <span className="badge badge-accent">admin</span>
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

      <aside className="admin-sidebar">
        <div className="sidebar-section">Лабиринты</div>
        <NavLink
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          to="/admin"
          end
        >
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
        <a
          className="sidebar-item"
          href="/help-admin.html"
          target="_blank"
          rel="noreferrer"
        >
          <span className="sidebar-icon">?</span>Справка
        </a>
        <button
          className="sidebar-item sidebar-button"
          type="button"
          onClick={() => setIsDevelopersOpen(true)}
        >
          <span className="sidebar-icon">i</span>О разработчиках
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
      {isDevelopersOpen ? (
        <DevelopersModal onClose={() => setIsDevelopersOpen(false)} />
      ) : null}
    </div>
  );
}
