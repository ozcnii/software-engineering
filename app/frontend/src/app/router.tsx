import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAboutPage } from '../features/admin/AdminAboutPage';
import { AdminCreateWizard } from '../features/admin/AdminCreateWizard';
import { AdminLabyrinthList } from '../features/admin/AdminLabyrinthList';
import { AdminLayout } from '../features/admin/AdminLayout';
import { AdminSystemPage } from '../features/admin/AdminSystemPage';
import { AuthScreen } from '../features/auth/AuthScreen';
import type { AuthState } from './App';

interface AppRouterProps {
  auth: AuthState;
}

export function AppRouter({ auth }: AppRouterProps) {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          auth.user ? <Navigate to={routeForRole(auth.user.role)} replace /> : <AuthScreen auth={auth} />
        }
      />

      <Route
        path="/admin"
        element={
          auth.user?.role === 'admin' ? (
            <AdminLayout user={auth.user} onLogout={auth.logout} />
          ) : (
            <Navigate to={auth.user ? '/player' : '/auth'} replace />
          )
        }
      >
        <Route index element={<AdminLabyrinthList />} />
        <Route path="create" element={<AdminCreateWizard />} />
        <Route path="about" element={<AdminAboutPage />} />
        <Route path="system" element={<AdminSystemPage />} />
      </Route>

      <Route
        path="/player"
        element={
          auth.user?.role === 'player' ? (
            <PlayerPlaceholder userLogin={auth.user.login} onLogout={auth.logout} />
          ) : (
            <Navigate to={auth.user ? '/admin' : '/auth'} replace />
          )
        }
      />

      <Route
        path="*"
        element={<Navigate to={auth.user ? routeForRole(auth.user.role) : '/auth'} replace />}
      />
    </Routes>
  );
}

function routeForRole(role: 'admin' | 'player') {
  return role === 'admin' ? '/admin' : '/player';
}

function PlayerPlaceholder({
  userLogin,
  onLogout,
}: {
  userLogin: string;
  onLogout: () => Promise<void>;
}) {
  return (
    <div className="player-placeholder">
      <header className="admin-header">
        <span className="admin-logo">Лабиринт</span>
        <span className="admin-role-label">Экран игрока</span>
        <div className="admin-header-right">
          <span className="badge badge-accent">player</span>
          <span className="muted">{userLogin}</span>
          <button className="btn btn-sm btn-ghost" type="button" onClick={() => void onLogout()}>
            Выйти
          </button>
        </div>
      </header>
      <main className="placeholder-main">
        <div className="card">
          <div className="card-title">Экран игрока</div>
          <p className="muted">Будет реализован в плане 05.</p>
        </div>
      </main>
    </div>
  );
}
