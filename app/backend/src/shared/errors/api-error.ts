export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
  }

  toResponse(): ApiErrorBody {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.fields ? { fields: this.fields } : {}),
      },
    };
  }

  static validation(fields: Record<string, string>, message = 'Ошибка валидации') {
    return new ApiError(400, 'VALIDATION_ERROR', message, fields);
  }

  static loginAlreadyExists() {
    return new ApiError(409, 'LOGIN_ALREADY_EXISTS', 'Логин уже занят');
  }

  static invalidCredentials() {
    return new ApiError(401, 'INVALID_CREDENTIALS', 'Неверный логин или пароль');
  }

  static unauthorized() {
    return new ApiError(401, 'UNAUTHORIZED', 'Требуется авторизация');
  }

  static forbidden() {
    return new ApiError(403, 'FORBIDDEN', 'Недостаточно прав');
  }

  static notFound(message = 'Ресурс не найден') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static labyrinthNameExists() {
    return new ApiError(
      409,
      'LABYRINTH_NAME_EXISTS',
      'Лабиринт с таким названием уже существует',
    );
  }

  static pathNotFound() {
    return new ApiError(422, 'PATH_NOT_FOUND', 'Путь не найден');
  }

  static dataIntegrity() {
    return new ApiError(500, 'DATA_INTEGRITY_ERROR', 'Данные лабиринта повреждены');
  }
}
