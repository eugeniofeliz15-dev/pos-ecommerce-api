import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

   @Roles('CLIENTE')
  @ApiOperation({ summary: 'Checkout exclusivo con MockPay (Genera URL de pago)' })
  @ApiBody({ type: CreateOrderDto })
  @Post('checkout-mockpay')
  async checkoutMockPay(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    return this.ordersService.checkoutMockPay(req.user.id, createOrderDto);
  }

  @Roles('CLIENTE')
  @ApiOperation({ summary: 'Ver mis pedidos' })
  @Get('my-orders')
  findMyOrders(@Req() req: any) {
    return this.ordersService.findMyOrders(req.user.id);
  }

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

  // --- ENDPOINT PÚBLICO PARA WEBHOOK ---
  @Post('webhooks/mockpay')
  @ApiOperation({ summary: 'Webhook público para recibir confirmación de pago de MockPay' })
  async handleMockPayWebhook(@Body() webhookData: any) {
    // Este endpoint no tiene guards, cualquiera puede llamarlo, 
    // pero en producción real validarías una firma secreta de MockPay.
    return this.ordersService.handlePaymentWebhook(webhookData);
  }
}