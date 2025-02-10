import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AllExceptionsHandler } from './common/exception-hanlder.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    rawBody: true,
    logger: new ConsoleLogger({
      json: true,
      colors: true,
    }),
  });
  app.useGlobalFilters(new AllExceptionsHandler());

  const config = new DocumentBuilder()
    .setTitle('Notion Neat API')
    .setDescription('The Notion Neat API description')
    .setVersion('1.0')
    .addTag('Notion Neat Tags')
    .addBearerAuth()

    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors();
  const port = 8080;
  await app.listen(port, '0.0.0.0');
  console.log('Server is running on port ' + port);
}

bootstrap();
