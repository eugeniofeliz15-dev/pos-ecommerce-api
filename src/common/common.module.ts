import { Module } from '@nestjs/common';
import { MockPayService } from './mockpay/mockpay.service';

@Module({
  providers: [MockPayService],
  exports: [MockPayService], // <-- Importante para que OrdersModule lo pueda usar
})
export class CommonModule {}