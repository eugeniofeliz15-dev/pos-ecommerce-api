import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'El costo no puede ser negativo' })
  costPrice: number;

  @IsNumber()
  @Min(0, { message: 'El precio de venta no puede ser negativo' })
  salePrice: number;

  @IsNumber()
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @IsNumber()
  categoryId: number;
}