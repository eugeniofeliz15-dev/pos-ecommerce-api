import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar CORS para que tu frontend pueda conectarse
  app.enableCors();

  // 2. Validación global de DTOs (rechaza campos extra y transforma tipos)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 3. Prefijo global para todas las rutas (ej: /api/auth/login)
  app.setGlobalPrefix('api');

  // 4. Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('POS E-commerce API')
    .setDescription('API para el sistema de punto de venta y e-commerce')
    .setVersion('1.0')
    .addBearerAuth() // Habilita el botón de "Authorize" en Swagger
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 5. Puerto y host (CRUCIAL para Render: debe ser '0.0.0.0')
  const port = process.env.PORT || 10000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();