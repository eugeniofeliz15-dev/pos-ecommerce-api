import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaginationDto } from '../common/pagination.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto, cashierId: number) {
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const saleItemsData = [];

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
          unitPrice: product.salePrice,
          subtotal: subtotal,
        });
      }

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

      for (const item of createSaleDto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return sale;
    });
  }

  async findAll(paginationDto: PaginationDto, date?: string) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

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

    const [data, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: { include: { product: true } },
          cashier: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}