import { Controller, Get, Post, Body, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaginationDto } from '../common/pagination.dto';

@ApiTags('Sales (POS)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Roles('ADMINISTRADOR', 'CAJERO')
  @ApiOperation({ summary: 'Procesar una venta de mostrador (POS)' })
  @ApiBody({ type: CreateSaleDto })
  @Post()
  create(@Body() createSaleDto: CreateSaleDto, @Req() req: any) {
    return this.salesService.create(createSaleDto, req.user.id);
  }

  @Roles('ADMINISTRADOR', 'CAJERO')
  @ApiOperation({ summary: 'Historial de ventas (Filtrable por fecha)' })
  @ApiQuery({ name: 'date', required: false, description: 'Filtrar por fecha (YYYY-MM-DD)' })
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Query('date') date?: string) {
    return this.salesService.findAll(paginationDto, date);
  }
}