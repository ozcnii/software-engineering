import { FormEvent, useState } from 'react';
import { authApi } from '../../shared/api/authApi';
import { ApiClientError } from '../../shared/api/client';
import type { User } from '@labyrinth/shared/types/domain';
import type { ApiFieldErrors } from '@labyrinth/shared/types/api';
import { AuthField } from './components/AuthField';
import { validateRegisterFields } from './lib/authValidation';

interface RegisterFormProps {
  onUser: (user: User) => void;
}

export function RegisterForm({ onUser }: RegisterFormProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();

    const errors = validateRegisterFields(login, password, passwordConfirm, acceptedTerms);
    setFieldErrors(errors);
    setGeneralError('');

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.register({
        login,
        password,
        passwordConfirm,
        acceptedTerms,
      });
      onUser(response.user);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFieldErrors(error.fields);
        setGeneralError(error.message);
      } else {
        setGeneralError('Не удалось выполнить регистрацию');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={(event) => void submit(event)}>
      {generalError ? <div className="form-error">{generalError}</div> : null}

      <AuthField
        id="register-login"
        label="Логин"
        type="text"
        placeholder="придумайте логин..."
        value={login}
        hint="от 4 до 8 символов"
        error={fieldErrors.login}
        required
        onChange={setLogin}
      />

      <AuthField
        id="register-password"
        label="Пароль"
        type="password"
        placeholder="••••••••"
        value={password}
        hint="от 4 до 10 символов"
        error={fieldErrors.password}
        required
        onChange={setPassword}
      />

      <AuthField
        id="register-password-confirm"
        label="Подтверждение пароля"
        type="password"
        placeholder="повторите пароль..."
        value={passwordConfirm}
        error={fieldErrors.passwordConfirm}
        required
        onChange={setPasswordConfirm}
      />

      <div className="form-row">
        <label className="check-item">
          <input
            className="native-check"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          <span className={`check-box ${acceptedTerms ? 'on' : ''}`} aria-hidden="true" />
          <span className="terms-text">Принимаю условия использования</span>
        </label>
        {fieldErrors.acceptedTerms ? (
          <div className="err">{fieldErrors.acceptedTerms}</div>
        ) : null}
      </div>

      <button className="btn btn-success btn-full btn-lg" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Регистрируем...' : 'Зарегистрироваться ->'}
      </button>
    </form>
  );
}
