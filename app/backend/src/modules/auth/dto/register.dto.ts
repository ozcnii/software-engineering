import { Transform } from 'class-transformer';
import {
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LoginDto } from './login.dto';

@ValidatorConstraint({ name: 'passwordConfirmField', async: false })
class PasswordConfirmFieldConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const dto = args.object as RegisterDto;

    return (
      typeof value === 'string' &&
      value.length > 0 &&
      typeof dto.password === 'string' &&
      value === dto.password
    );
  }

  defaultMessage(args: ValidationArguments) {
    if (typeof args.value !== 'string' || args.value.length === 0) {
      return 'Повторите пароль';
    }

    return 'Пароли не совпадают';
  }
}

export class RegisterDto extends LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Validate(PasswordConfirmFieldConstraint)
  passwordConfirm!: string;
}
