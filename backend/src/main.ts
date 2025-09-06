import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS burda aktivləşdirilir
  app.enableCors({
    origin: true, // bütün origin-lərdən icazə
    credentials: true,
  });

  await app.listen(3001);
  console.log('🚀 Backend is running on http://localhost:3001/graphql');
}
bootstrap();
