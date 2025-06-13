import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { globalPrefix } from './libs/helpers';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(globalPrefix);
  const config = new DocumentBuilder()
    .setTitle('Your title')
    .setDescription('Your description')
    .setVersion('1.0')
    .addTag('Your tag')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/explorer`, app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(5000);
}
bootstrap();
