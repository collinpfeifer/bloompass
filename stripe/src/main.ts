import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    cors: true,
    logger: ['error', 'warn', 'debug', 'verbose', 'log'],
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
