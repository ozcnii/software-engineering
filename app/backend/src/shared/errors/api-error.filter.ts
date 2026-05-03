import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiError } from './api-error';

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ApiError) {
      response.status(exception.statusCode).json(exception.toResponse());
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
          ? this.normalizeMessage(exceptionResponse.message)
          : exception.message;

      response.status(status).json({
        error: {
          code: this.codeForStatus(status),
          message,
        },
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Внутренняя ошибка сервера',
      },
    });
  }

  private normalizeMessage(message: unknown) {
    if (Array.isArray(message)) {
      return message.join('; ');
    }

    return typeof message === 'string' ? message : 'Ошибка запроса';
  }

  private codeForStatus(status: number) {
    if (status === HttpStatus.UNAUTHORIZED) {
      return 'UNAUTHORIZED';
    }

    if (status === HttpStatus.FORBIDDEN) {
      return 'FORBIDDEN';
    }

    if (status === HttpStatus.BAD_REQUEST) {
      return 'VALIDATION_ERROR';
    }

    return 'REQUEST_ERROR';
  }
}
