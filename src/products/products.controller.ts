import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/pagination.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Ruta pública para la web (solo stock > 0)
  @ApiOperation({ summary: 'Catálogo público (Web)' })
  @Get('web')
  findAllForWeb(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAllForWeb(paginationDto);
  }

  // Ruta protegida: Ver inventario completo (con costPrice)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR', 'CAJERO')
  @ApiOperation({ summary: 'Inventario completo (Admin/Cajero)' })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  // Ruta protegida: Ver un producto por ID
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR', 'CAJERO')
  @ApiOperation({ summary: 'Ver producto por ID' })
  @ApiParam({ name: 'id', example: 1 })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(parseInt(id));
  }

  // Ruta protegida: Crear producto (Solo Admin)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Crear producto (Solo Admin)' })
  @ApiBody({ type: CreateProductDto })
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // Ruta protegida: Actualizar producto (Solo Admin)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Actualizar producto (Solo Admin)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateProductDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(parseInt(id), updateProductDto);
  }

  // Ruta protegida: Eliminar producto (Soft Delete - Solo Admin)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar producto (Soft Delete - Solo Admin)' })
  @ApiParam({ name: 'id', example: 1 })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(parseInt(id));
  }
}