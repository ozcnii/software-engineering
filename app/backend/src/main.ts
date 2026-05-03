import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser = require('cookie-parser');
import { AppModule } from './app.module';
import { ApiError } from './shared/errors/api-error';
import { ApiErrorFilter } from './shared/errors/api-error.filter';
import { toValidationFields } from './shared/errors/validation-error-fields';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3001);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => ApiError.validation(toValidationFields(errors)),
    }),
  );
  app.useGlobalFilters(new ApiErrorFilter());

  await app.listen(port);
}

void bootstrap();
