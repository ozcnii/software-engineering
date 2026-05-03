import { FormEvent, useState } from 'react';
import { authApi } from '../../shared/api/authApi';
import { ApiClientError } from '../../shared/api/client';
import type { ApiFieldErrors, User } from '../../shared/types/domain';

interface LoginFormProps {
  onUser: (user: User) => void;
}

export function LoginForm({ onUser }: LoginFormProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();

    const errors = validateLogin(login, password);
    setFieldErrors(errors);
    setGeneralError('');

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.login({ login, password });
      onUser(response.user);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFieldErrors(error.fields);
        setGeneralError(error.message);
      } else {
        setGeneralError('Не удалось выполнить вход');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={(event) => void submit(event)}>
      {generalError ? <div className="form-error">{generalError}</div> : null}

      <div className="form-row">
        <label className="label" htmlFor="login-input">
          Логин
        </label>
        <input
          className="input"
          id="login-input"
          type="text"
          placeholder="введите логин..."
          value={login}
          onChange={(event) => setLogin(event.target.value)}
        />
        {fieldErrors.login ? <div className="err">{fieldErrors.login}</div> : null}
      </div>

      <div className="form-row">
        <label className="label" htmlFor="login-password">
          Пароль
        </label>
        <input
          className="input"
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {fieldErrors.password ? <div className="err">{fieldErrors.password}</div> : null}
      </div>

      <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Входим...' : 'Войти ->'}
      </button>
    </form>
  );
}

function validateLogin(login: string, password: string): ApiFieldErrors {
  const errors: ApiFieldErrors = {};
  const normalizedLogin = login.trim();
  const normalizedPassword = password.trim();

  if (!normalizedLogin) {
    errors.login = 'Введите логин';
  } else if (normalizedLogin.length < 4 || normalizedLogin.length > 8) {
    errors.login = 'Длина логина от 4 до 8 символов';
  }

  if (!normalizedPassword) {
    errors.password = 'Введите пароль';
  } else if (normalizedPassword.length < 4 || normalizedPassword.length > 10) {
    errors.password = 'Длина пароля от 4 до 10 символов';
  }

  return errors;
}
