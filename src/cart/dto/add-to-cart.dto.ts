import { IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;
}