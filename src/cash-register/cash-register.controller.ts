import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CashRegisterService } from './cash-register.service';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';

@ApiTags('Cash Register (Caja)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cash-register')
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @Roles('ADMINISTRADOR', 'CAJERO')
  @ApiOperation({ summary: 'Abrir caja (Registrar monto inicial)' })
  @ApiBody({ type: OpenCashRegisterDto })
  @Post('open')
  open(@Body() openDto: OpenCashRegisterDto, @Req() req: any) {
    return this.cashRegisterService.open(req.user.id, openDto);
  }

  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Cerrar caja y conciliar efectivo' })
  @ApiBody({ type: CloseCashRegisterDto })
  @Post('close')
  close(@Body() closeDto: CloseCashRegisterDto, @Req() req: any) {
    return this.cashRegisterService.close(req.user.id, closeDto);
  }

  @Roles('ADMINISTRADOR', 'CAJERO')
  @ApiOperation({ summary: 'Ver estado actual de la caja' })
  @Get('status')
  getStatus() {
    return this.cashRegisterService.getCurrentStatus();
  }
}