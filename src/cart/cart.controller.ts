import { Controller, Get, Post, Body, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLIENTE') // Solo clientes web usan el carrito
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Ver mi carrito' })
  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @ApiOperation({ summary: 'Agregar producto al carrito' })
  @ApiBody({ type: AddToCartDto })
  @Post('add')
  addToCart(@Body() addToCartDto: AddToCartDto, @Req() req: any) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @ApiOperation({ summary: 'Eliminar producto del carrito' })
  @Delete('remove/:productId')
  removeFromCart(@Param('productId') productId: string, @Req() req: any) {
    return this.cartService.removeFromCart(req.user.id, parseInt(productId));
  }
}