import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { CashRegisterModule } from './cash-register/cash-register.module';

@Module({
  imports: [
    // Validación de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(10).required(),
        PORT: Joi.number().default(3000),
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    SalesModule,
    CartModule,
    OrdersModule,
    CashRegisterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}