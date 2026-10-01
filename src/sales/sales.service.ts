import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto, cashierId: number) {
    // Usamos una transacción interactiva para garantizar atomicidad
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const saleItemsData = [];

      // 1. Validar stock y calcular totales
      for (const item of createSaleDto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        
        if (!product) {
          throw new NotFoundException(`Producto con ID ${item.productId} no encontrado`);
        }
        
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`
          );
        }

        const subtotal = product.salePrice * item.quantity;
        totalAmount += subtotal;

        saleItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.salePrice, // Guardamos el precio histórico
          subtotal: subtotal,
        });
      }

      // 2. Crear la Venta y sus Detalles
      const sale = await tx.sale.create({
        data: {
          cashierId,
          totalAmount,
          paymentMethod: createSaleDto.paymentMethod,
          items: {
            create: saleItemsData,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
          cashier: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      // 3. Descontar el Stock de cada producto
      for (const item of createSaleDto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return sale;
    });
  }

  async findAll(date?: string) {
    // Filtro opcional por día (formato YYYY-MM-DD)
    const where: any = {};
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      where.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    return this.prisma.sale.findMany({
      where,
      include: {
        items: { include: { product: true } },
        cashier: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}