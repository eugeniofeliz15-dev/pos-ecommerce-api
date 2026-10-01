import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  addressId: number;

  @IsOptional()
  @IsString()
  notes?: string; // Referencias para el envío (ej: "Casa azul, timbre no funciona")
}