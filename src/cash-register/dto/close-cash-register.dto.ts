import { IsNumber, Min } from 'class-validator';

export class CloseCashRegisterDto {
  @IsNumber()
  @Min(0, { message: 'El monto de cierre no puede ser negativo' })
  closingBalance: number;
}