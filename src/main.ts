import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Validación global de DTOs (transforma y limpia datos)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 2. Configuración de Swagger UI
  const config = new DocumentBuilder()
    .setTitle('POS & E-commerce API')
    .setDescription('Sistema Híbrido de Punto de Venta y Comercio Electrónico')
    .setVersion('1.0')
    .addBearerAuth() // Preparado para cuando activemos los Guards
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 3. Puerto dinámico desde ConfigService
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();