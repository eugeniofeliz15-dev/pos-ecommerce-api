import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(customerId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: true } } },
    });

    // Si no tiene carrito, creamos uno vacío
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { customerId },
        include: { items: { include: { product: true } } },
      });
    }

    return cart;
  }

  async addToCart(customerId: number, addToCartDto: AddToCartDto) {
    // Verificar que el producto existe y tiene stock
    const product = await this.prisma.product.findUnique({ where: { id: addToCartDto.productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.stock === 0) throw new BadRequestException('Producto agotado');

    // Obtener o crear el carrito
    let cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { customerId } });
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: addToCartDto.productId },
    });

    if (existingItem) {
      // Actualizar cantidad si ya existe
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: addToCartDto.quantity } },
      });
    } else {
      // Crear nuevo item en el carrito
      return this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: addToCartDto.productId,
          quantity: addToCartDto.quantity,
        },
      });
    }
  }

  async removeFromCart(customerId: number, productId: number) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) throw new NotFoundException('Carrito no encontrado');

    const item = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });
    if (!item) throw new NotFoundException('Producto no está en el carrito');

    return this.prisma.cartItem.delete({ where: { id: item.id } });
  }
}