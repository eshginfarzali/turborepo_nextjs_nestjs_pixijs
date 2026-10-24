import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { corsOrigins, port } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: corsOrigins() });
  app.enableShutdownHooks();

  await app.listen(port());
  Logger.log(`API listening on ${await app.getUrl()}/graphql`, 'Bootstrap');
}

void bootstrap();
