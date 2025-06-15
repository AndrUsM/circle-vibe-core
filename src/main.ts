import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSwaggerConfiguration } from './core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  initSwaggerConfiguration(app);

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
