import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return this.prisma.product.create({
      data: createProductDto,
      include: { category: true },
    });
  }

  async findAll() {
    // Devuelve todos los productos (para uso interno/admin)
    return this.prisma.product.findMany({
      include: { category: true },
    });
  }

  async findAllForWeb() {
    // Regla de negocio: El cliente web NO debe ver productos con stock 0
    return this.prisma.product.findMany({
      where: { stock: { gt: 0 } }, 
      include: { category: true },
    });
  }
}