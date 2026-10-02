import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Escudo: Helmet (Agrega cabeceras de seguridad HTTP automáticamente)
  app.use(helmet());

  // 2. Escudo: CORS (Permite peticiones desde el frontend)
  app.enableCors({
    origin: '*', // En producción, cambia '*' por la URL real de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 4. Filtro Global de Errores de Prisma
  app.useGlobalFilters(new PrismaClientExceptionFilter());

  // 5. Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('POS & E-commerce API')
    .setDescription('API para sistema híbrido de Punto de Venta y Tienda Web')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 6. Iniciar servidor
const port = process.env.PORT || 10000;
await app.listen(port, '0.0.0.0');
console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
}

bootstrap();