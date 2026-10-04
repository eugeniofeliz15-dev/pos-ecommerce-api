import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Listar categorías' })
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @ApiOperation({ summary: 'Obtener categoría por ID' })
  @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Crear categoría (Solo Admin)' })
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      default: {
        summary: 'Ejemplo de categoría',
        value: {
          name: 'Electrónica',
          description: 'Productos tecnológicos y gadgets',
        }
      }
    }
  })
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Actualizar categoría (Solo Admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    type: UpdateCategoryDto,
    examples: {
      default: {
        summary: 'Ejemplo de actualización',
        value: {
          name: 'Electrónica y Tecnología',
          description: 'Actualizado: Productos tecnológicos, gadgets y accesorios',
        }
      }
    }
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar categoría - Soft Delete (Solo Admin)' })
  @ApiParam({ name: 'id', type: Number })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}