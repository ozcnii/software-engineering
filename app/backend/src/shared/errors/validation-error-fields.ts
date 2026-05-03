import type { ValidationError } from '@nestjs/common';

export function toValidationFields(errors: ValidationError[]) {
  return errors.reduce<Record<string, string>>((fields, error) => {
    const message = error.constraints ? Object.values(error.constraints)[0] : undefined;

    if (message) {
      fields[error.property] = message;
    }

    return fields;
  }, {});
}
