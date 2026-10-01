import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Ruta pública para la web (solo stock > 0)
  @ApiOperation({ summary: 'Catálogo público (Web)' })
  @Get('web')
  findAllForWeb() {
    return this.productsService.findAllForWeb();
  }

  // Ruta protegida: Ver inventario completo (con costPrice)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR', 'CAJERO')
  @ApiOperation({ summary: 'Inventario completo (Admin/Cajero)' })
  @Get()
  findAll() {
    return this.productsService.findAll();
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
}