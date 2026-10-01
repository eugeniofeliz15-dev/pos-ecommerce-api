import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  // Helper para filtrar solo registros no eliminados
  getNotDeletedFilter() {
    return { deletedAt: null };
  }
}