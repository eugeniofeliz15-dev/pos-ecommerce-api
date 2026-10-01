import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';

@Injectable()
export class CashRegisterService {
  constructor(private prisma: PrismaService) {}

  async open(userId: number, openDto: OpenCashRegisterDto) {
    // Verificar si ya hay una caja abierta
    const openRegister = await this.prisma.cashRegister.findFirst({
      where: { status: 'ABIERTA' },
    });

    if (openRegister) {
      throw new BadRequestException('Ya existe una caja abierta. Debes cerrarla primero.');
    }

    return this.prisma.cashRegister.create({
      data: {
        openedById: userId,
        openingBalance: openDto.openingBalance,
        status: 'ABIERTA',
      },
    });
  }

async close(userId: number, closeDto: CloseCashRegisterDto) {
  // Buscar la caja abierta
  const openRegister = await this.prisma.cashRegister.findFirst({
    where: { status: 'ABIERTA' },
  });

  if (!openRegister) {
    throw new NotFoundException('No hay ninguna caja abierta para cerrar.');
  }

  // Calcular el total de ventas en EFECTIVO SOLO desde que se abrió la caja
  const cashSales = await this.prisma.sale.aggregate({
    where: {
      paymentMethod: 'EFECTIVO',
      createdAt: {
        gte: openRegister.openedAt, // Solo ventas desde la apertura
      },
    },
    _sum: { totalAmount: true },
  });

  const totalCashSales = cashSales._sum.totalAmount || 0;
  const expectedBalance = openRegister.openingBalance + totalCashSales;
  const difference = closeDto.closingBalance - expectedBalance;

  // Cerrar la caja
  return this.prisma.cashRegister.update({
    where: { id: openRegister.id },
    data: {
      closedById: userId,
      closingBalance: closeDto.closingBalance,
      expectedBalance: expectedBalance,
      difference: difference,
      status: 'CERRADA',
      closedAt: new Date(),
    },
  });
}

  async getCurrentStatus() {
    const register = await this.prisma.cashRegister.findFirst({
      where: { status: 'ABIERTA' },
      include: {
        openedBy: { select: { firstName: true, lastName: true } },
      },
    });

    if (!register) {
      return { status: 'CERRADA', message: 'No hay caja abierta en este momento.' };
    }

    return { status: 'ABIERTA', data: register };
  }
}