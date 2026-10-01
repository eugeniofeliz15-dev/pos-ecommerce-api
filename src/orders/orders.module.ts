import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CommonModule } from '../common/common.module'; // <-- Agregar esta línea

@Module({
  imports: [CommonModule], // <-- Agregar esta línea
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}