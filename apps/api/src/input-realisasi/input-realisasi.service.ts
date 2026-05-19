import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class InputRealisasiService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getHistory(unitCode?: string, periodId?: string) {
    return this.prisma.inputRealisasi.findMany({
      where: {
        ...(unitCode ? { unitCode } : {}),
        ...(periodId ? { periodId } : {}),
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async submit(user: User, unitCode: string, values: Record<string, unknown>) {
    const period = await this.prisma.period.findFirst({ where: { isActive: true } });
    if (!period) throw new Error('No active period');

    const result = await this.prisma.inputRealisasi.upsert({
      where: { periodId_unitCode: { periodId: period.id, unitCode } },
      update: { values: values as object, submitter: user.name, status: 'submitted', submittedAt: new Date() },
      create: { periodId: period.id, unitCode, submitter: user.name, values: values as object, status: 'submitted' },
    });

    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: 'realisasi.submit', entity: 'InputRealisasi', targetId: result.id },
    });

    await this.cache.del(`realisasi:${unitCode}`);
    return result;
  }
}
