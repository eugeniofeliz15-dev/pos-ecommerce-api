import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async checkout(customerId: number, createOrderDto: CreateOrderDto) {
    // 1. Obtener el carrito del cliente
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // 2. Transacción atómica: Crear pedido, descontar stock, vaciar carrito
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      // Validar stock y calcular total
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${item.product.name}". Disponible: ${item.product.stock}`
          );
        }
        
        const subtotal = item.product.salePrice * item.quantity;
        totalAmount += subtotal;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.salePrice,
          subtotal: subtotal,
        });
      }

      // Crear la Orden
      const order = await tx.order.create({
        data: {
          customerId,
          addressId: createOrderDto.addressId,
          totalAmount,
          notes: createOrderDto.notes,
          status: 'PENDIENTE', // Estado inicial
          items: { create: orderItemsData },
        },
        include: {
          items: { include: { product: true } },
          address: true,
        },
      });

      // Descontar Stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Vaciar el carrito (borrar todos los items)
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    return this.prisma.order.update({
      where: { id },
      data: { status: updateOrderStatusDto.status },
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        customer: { select: { firstName: true, lastName: true, email: true } },
        address: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyOrders(customerId: number) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        address: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}