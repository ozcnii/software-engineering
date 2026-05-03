import { FormEvent, useState } from 'react';
import { authApi } from '../../shared/api/authApi';
import { ApiClientError } from '../../shared/api/client';
import type { ApiFieldErrors, User } from '../../shared/types/domain';
import { AuthField } from './components/AuthField';
import { validateLoginFields } from './lib/authValidation';

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

    const errors = validateLoginFields(login, password);
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

      <AuthField
        id="login-input"
        label="Логин"
        type="text"
        placeholder="введите логин..."
        value={login}
        error={fieldErrors.login}
        onChange={setLogin}
      />

      <AuthField
        id="login-password"
        label="Пароль"
        type="password"
        placeholder="••••••••"
        value={password}
        error={fieldErrors.password}
        onChange={setPassword}
      />

      <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Входим...' : 'Войти ->'}
      </button>
    </form>
  );
}
