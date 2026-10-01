import { IsNumber, Min } from 'class-validator';

export class OpenCashRegisterDto {
  @IsNumber()
  @Min(0, { message: 'El monto inicial no puede ser negativo' })
  openingBalance: number;
}