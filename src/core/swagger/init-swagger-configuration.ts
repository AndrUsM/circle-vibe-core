import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const initSwaggerConfiguration = (app: INestApplication<any>) => {
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Circle Vibe Documentation')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Swagger UI available at /api/docs
}