import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: ['error', 'warn', 'debug', 'verbose', 'log'],
  });

  BigInt.prototype.toJSON = function (): string {
    return this.toString();
  };

  const config = new DocumentBuilder()
    .setTitle('Adfluent Links API')
    .setDescription('The Adfluent Links API CRUD Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
