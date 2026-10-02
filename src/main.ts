import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { CashRegisterModule } from './cash-register/cash-register.module';
import { CategoriesModule } from './categories/categories.module'; // ← AGREGA ESTA LÍNEA
import { CommonModule } from './common/common.module';
import { validationSchema } from './env.validation';

@Module({
  imports: [
    // 1. Validación de .env con Joi
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchema,
    }),

    // 2. Rate Limiting: Máximo 60 peticiones cada 60 segundos por IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),

    // Módulos de la aplicación
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    SalesModule,
    OrdersModule,
    CartModule,
    CashRegisterModule,
    CategoriesModule, // ← AGREGA ESTA LÍNEA AQUÍ
    CommonModule,
  ],
  providers: [
    // 3. Aplicar el Rate Limiting globalmente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}