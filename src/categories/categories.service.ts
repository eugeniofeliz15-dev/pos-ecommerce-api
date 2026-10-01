import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });
    if (existing) throw new ConflictException('La categoría ya existe');

    return this.prisma.category.create({ data: createCategoryDto });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: { products: true },
    });
  }
}