import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAboutPage } from '../features/admin/AdminAboutPage';
import { AdminCreateWizard } from '../features/admin/AdminCreateWizard';
import { AdminLabyrinthList } from '../features/admin/AdminLabyrinthList';
import { AdminLayout } from '../features/admin/AdminLayout';
import { AdminSystemPage } from '../features/admin/AdminSystemPage';
import { AuthScreen } from '../features/auth/AuthScreen';
import { PlayerLayout } from '../features/player/PlayerLayout';
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
            <PlayerLayout user={auth.user} onLogout={auth.logout} />
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
