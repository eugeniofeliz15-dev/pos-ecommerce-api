import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Orders (E-commerce)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles('CLIENTE')
  @ApiOperation({ summary: 'Confirmar pedido (Checkout desde el carrito)' })
  @ApiBody({ type: CreateOrderDto })
  @Post('checkout')
  checkout(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    return this.ordersService.checkout(req.user.id, createOrderDto);
  }

  @Roles('CLIENTE')
  @ApiOperation({ summary: 'Ver mis pedidos' })
  @Get('my-orders')
  findMyOrders(@Req() req: any) {
    return this.ordersService.findMyOrders(req.user.id);
  }

  // Rutas de Administrador
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Ver todos los pedidos (Cola de logística)' })
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Actualizar estado del pedido (Logística)' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(parseInt(id), updateOrderStatusDto);
  }
}