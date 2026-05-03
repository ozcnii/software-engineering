import { useState } from 'react';
import type { AuthState } from '../../app/App';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthScreenProps {
  auth: AuthState;
}

type AuthTab = 'login' | 'register';

export function AuthScreen({ auth }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  return (
    <div className="auth-wrap">
      <div className="maze-bg" aria-hidden="true" />
      <div className="auth-logo">Лабиринт</div>
      <div className="auth-subtitle">система генерации и прохождения лабиринтов</div>

      <section className="auth-card" aria-label="Аутентификация">
        <div className="auth-tabs" role="tablist">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTab === 'login'}
            onClick={() => setActiveTab('login')}
          >
            Вход
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            onClick={() => setActiveTab('register')}
          >
            Регистрация
          </button>
        </div>

        {activeTab === 'login' ? (
          <LoginForm onUser={auth.setUser} />
        ) : (
          <RegisterForm onUser={auth.setUser} />
        )}
      </section>
    </div>
  );
}
