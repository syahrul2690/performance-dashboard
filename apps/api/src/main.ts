import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableCors({
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(','),
    credentials: true,
  });
  const port = Number(process.env.API_PORT || 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[pusmanpro-api] listening on http://localhost:${port}/api`);
}
bootstrap();
