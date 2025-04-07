import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');

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

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Amethyst Subscribers API')
    .setDescription('The Amethyst Subscribers API CRUD Service')
    .setVersion('1.0')
    .addTag('subscribers')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
