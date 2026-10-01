import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Audífonos Bluetooth Sony' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Inalámbricos con cancelación de ruido' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 25.50 })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  categoryId: number;
}