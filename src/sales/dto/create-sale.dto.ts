import { IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSaleItemDto } from './create-sale-item.dto';

export enum PaymentMethodDto {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  MOCKPAY = 'MOCKPAY',
}

export class CreateSaleDto {
  @ApiProperty({ enum: PaymentMethodDto, example: 'MOCKPAY' })
  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @ApiProperty({ type: [CreateSaleItemDto], example: [
    { productId: 1, quantity: 2 },
    { productId: 2, quantity: 1 }
  ]})
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}