import { IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSaleItemDto } from './create-sale-item.dto';

export enum PaymentMethodDto {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  MOCKPAY = 'MOCKPAY',
}

export class CreateSaleDto {
  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}