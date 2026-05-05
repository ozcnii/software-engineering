import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { authApi } from '../shared/api/authApi';
import { ApiClientError } from '../shared/api/client';
import type { User } from '@labyrinth/shared/types/domain';
import { AppRouter } from './router';

export interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    authApi
      .me()
      .then((response) => {
        if (isMounted) {
          setUser(response.user);
        }
      })
      .catch((error: unknown) => {
        if (isMounted && !(error instanceof ApiClientError && error.status === 401)) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsRestoringSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const auth = useMemo(
    () => ({
      user,
      setUser,
      logout,
    }),
    [logout, user],
  );

  if (isRestoringSession) {
    return (
      <div className="app-loading">
        <div className="auth-logo">Лабиринт</div>
        <div className="auth-subtitle">загрузка сеанса...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRouter auth={auth} />
    </BrowserRouter>
  );
}
