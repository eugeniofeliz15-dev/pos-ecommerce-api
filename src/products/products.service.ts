import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return this.prisma.product.create({
      data: createProductDto,
      include: { category: true },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const whereClause = { deletedAt: null }; // <-- Solo productos no eliminados

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: { category: true },
      }),
      this.prisma.product.count({ where: whereClause }),
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

  async findAllForWeb(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const whereClause = { 
      stock: { gt: 0 },
      deletedAt: null, // <-- Solo productos activos
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: { category: true },
      }),
      this.prisma.product.count({ where: whereClause }),
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

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Verifica que existe y no está eliminado

    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId, deletedAt: null },
      });
      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { category: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Verifica que existe y no está eliminado

    // SOFT DELETE: En lugar de borrar, marcamos deletedAt
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}