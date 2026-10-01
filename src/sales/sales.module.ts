import { Module } from '@nestjs/common';
import { SalesController } from './dto/sales.controller';
import { SalesService } from './sales.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService]
})
export class SalesModule {}
