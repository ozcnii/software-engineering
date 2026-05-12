import type { ApiFieldErrors } from '@labyrinth/shared/types/api';

export function validateLoginFields(login: string, password: string): ApiFieldErrors {
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

export function validateRegisterFields(
  login: string,
  password: string,
  passwordConfirm: string,
): ApiFieldErrors {
  const errors = validateLoginFields(login, password);
  const normalizedPassword = password.trim();
  const normalizedConfirm = passwordConfirm.trim();

  if (!normalizedConfirm) {
    errors.passwordConfirm = 'Повторите пароль';
  } else if (normalizedConfirm !== normalizedPassword) {
    errors.passwordConfirm = 'Пароли не совпадают';
  }

  return errors;
}
