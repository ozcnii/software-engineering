import { FormEvent, useState } from 'react';
import { authApi } from '../../shared/api/authApi';
import { ApiClientError } from '../../shared/api/client';
import type { ApiFieldErrors, User } from '../../shared/types/domain';

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

    const errors = validateRegister(login, password, passwordConfirm, acceptedTerms);
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

      <div className="form-row">
        <label className="label" htmlFor="register-login">
          Логин <span className="required">*</span>
        </label>
        <input
          className="input"
          id="register-login"
          type="text"
          placeholder="придумайте логин..."
          value={login}
          onChange={(event) => setLogin(event.target.value)}
        />
        <div className="hint">от 4 до 8 символов</div>
        {fieldErrors.login ? <div className="err">{fieldErrors.login}</div> : null}
      </div>

      <div className="form-row">
        <label className="label" htmlFor="register-password">
          Пароль <span className="required">*</span>
        </label>
        <input
          className="input"
          id="register-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="hint">от 4 до 10 символов</div>
        {fieldErrors.password ? <div className="err">{fieldErrors.password}</div> : null}
      </div>

      <div className="form-row">
        <label className="label" htmlFor="register-password-confirm">
          Подтверждение пароля <span className="required">*</span>
        </label>
        <input
          className="input"
          id="register-password-confirm"
          type="password"
          placeholder="повторите пароль..."
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
        />
        {fieldErrors.passwordConfirm ? (
          <div className="err">{fieldErrors.passwordConfirm}</div>
        ) : null}
      </div>

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

function validateRegister(
  login: string,
  password: string,
  passwordConfirm: string,
  acceptedTerms: boolean,
): ApiFieldErrors {
  const errors: ApiFieldErrors = {};
  const normalizedLogin = login.trim();
  const normalizedPassword = password.trim();
  const normalizedConfirm = passwordConfirm.trim();

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

  if (!normalizedConfirm) {
    errors.passwordConfirm = 'Повторите пароль';
  } else if (normalizedConfirm !== normalizedPassword) {
    errors.passwordConfirm = 'Пароли не совпадают';
  }

  if (!acceptedTerms) {
    errors.acceptedTerms = 'Примите условия использования';
  }

  return errors;
}
