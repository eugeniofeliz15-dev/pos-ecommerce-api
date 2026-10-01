import { IsEnum } from 'class-validator';

export enum OrderStatusDto {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  EN_CAMINO = 'EN_CAMINO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatusDto)
  status: OrderStatusDto;
}