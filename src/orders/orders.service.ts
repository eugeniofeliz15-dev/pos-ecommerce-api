import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, PaymentMethodOrder } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { MockPayService } from '../common/mockpay/mockpay.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mockPayService: MockPayService,
  ) {}

  async checkout(customerId: number, createOrderDto: CreateOrderDto) {
    // 👇 1. OBTENER EL EMAIL DEL CLIENTE (Nuevo)
    const customer = await this.prisma.user.findUnique({ where: { id: customerId } });

    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

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

      const newOrder = await tx.order.create({
        data: {
          customerId,
          addressId: createOrderDto.addressId,
          totalAmount,
          notes: createOrderDto.notes,
          status: 'PENDIENTE',
          items: { create: orderItemsData },
        },
        include: {
          items: { include: { product: true } },
          address: true,
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return newOrder;
    });

    // Si el método de pago es MOCKPAY, generamos la URL de checkout
    let checkoutUrl = null;
    if (createOrderDto.paymentMethod === PaymentMethodOrder.MOCKPAY) {
      checkoutUrl = await this.mockPayService.createPayment(
        order.totalAmount,
        `ORD-${order.id}`,
        customer?.email || 'cliente@ejemplo.com' // 👈 2. AGREGADO EL 3ER ARGUMENTO
      );
    }

    return {
      order,
      checkout_url: checkoutUrl,
    };
  }

  // ✅ MÉTODO CORREGIDO PARA COINCIDIR CON LA DOCUMENTACIÓN REAL DE MOCKPAY
 async handlePaymentWebhook(webhookData: any) {
    // 👇 AGREGAR ESTA VALIDACIÓN AL INICIO
    if (!webhookData || Object.keys(webhookData).length === 0) {
      console.log('⚠️ Webhook recibido sin datos');
      throw new BadRequestException('No se recibieron datos del webhook');
    }

    console.log('🔔 Webhook recibido de MockPay:', JSON.stringify(webhookData, null, 2));

    // MockPay envía el order_id DENTRO de metadata
    const orderIdStr = webhookData.metadata?.order_id?.replace('ORD-', '');
    const orderId = parseInt(orderIdStr, 10);

    if (!orderId || isNaN(orderId)) {
      throw new BadRequestException('ID de orden inválido en el webhook');
    }

    // Verificar el evento o el status (MockPay usa ambos formatos)
    const isPaymentSuccess = 
      webhookData.event === 'payment.succeeded' || 
      webhookData.status === 'SUCCEEDED';

    const isPaymentFailed = 
      webhookData.event === 'payment.failed' || 
      webhookData.status === 'FAILED';

    if (isPaymentSuccess) {
      console.log(`✅ Pago exitoso para la orden ${orderId}`);
      return this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAGADO' },
      });
    }

    if (isPaymentFailed) {
      console.log(`❌ Pago fallido para la orden ${orderId}. Razón: ${webhookData.failure_reason}`);
      
      // Revertir el stock si el pago falló para que el producto vuelva a estar disponible
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (order) {
        for (const item of order.items) {
          await this.prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELADO' },
      });
    }

    throw new BadRequestException('Evento de webhook no reconocido');
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

  // ✅ NUEVO MÉTODO: Checkout exclusivo para MockPay
  async checkoutMockPay(customerId: number, createOrderDto: CreateOrderDto) {
    const customer = await this.prisma.user.findUnique({ where: { id: customerId } });
    
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

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

      const newOrder = await tx.order.create({
        data: {
          customerId,
          addressId: createOrderDto.addressId,
          totalAmount,
          notes: createOrderDto.notes,
          status: 'PENDIENTE',
          items: { create: orderItemsData },
        },
        include: {
          items: { include: { product: true } },
          address: true,
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return newOrder;
    });

    // Generamos la URL de pago con MockPay
    const checkoutUrl = await this.mockPayService.createPayment(
      order.totalAmount,
      `ORD-${order.id}`,
      customer?.email || 'cliente@ejemplo.com'
    );

    return {
      order,
      checkout_url: checkoutUrl,
      message: 'Orden creada exitosamente. Redirige al cliente a checkout_url para completar el pago.'
    };
  }
}