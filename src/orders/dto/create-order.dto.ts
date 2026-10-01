import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethodOrder {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  MOCKPAY = 'MOCKPAY',
}

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  addressId: number;

  @ApiPropertyOptional({ example: 'Casa azul, timbre no funciona' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: PaymentMethodOrder, example: 'MOCKPAY' })
  @IsEnum(PaymentMethodOrder)
  paymentMethod: PaymentMethodOrder;
}