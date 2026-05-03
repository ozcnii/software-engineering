import { Transform } from 'class-transformer';
import {
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'loginField', async: false })
class LoginFieldConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return (
      typeof value === 'string' &&
      value.length >= 4 &&
      value.length <= 8 &&
      /^[a-z0-9_]+$/.test(value)
    );
  }

  defaultMessage(args: ValidationArguments) {
    const value = args.value;

    if (typeof value !== 'string' || value.length === 0) {
      return 'Введите логин';
    }

    if (value.length < 4 || value.length > 8) {
      return 'Длина логина от 4 до 8 символов';
    }

    return 'Логин может содержать латинские буквы, цифры и подчёркивание';
  }
}

@ValidatorConstraint({ name: 'passwordField', async: false })
class PasswordFieldConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === 'string' && value.length >= 4 && value.length <= 10;
  }

  defaultMessage(args: ValidationArguments) {
    const value = args.value;

    if (typeof value !== 'string' || value.length === 0) {
      return 'Введите пароль';
    }

    return 'Длина пароля от 4 до 10 символов';
  }
}

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @Validate(LoginFieldConstraint)
  login!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Validate(PasswordFieldConstraint)
  password!: string;
}
