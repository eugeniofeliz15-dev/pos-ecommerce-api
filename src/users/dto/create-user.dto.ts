import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum RoleDto {
  ADMINISTRADOR = 'ADMINISTRADOR',
  CAJERO = 'CAJERO',
  CLIENTE = 'CLIENTE',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(RoleDto, { message: 'El rol debe ser ADMINISTRADOR, CAJERO o CLIENTE' })
  role: RoleDto;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}