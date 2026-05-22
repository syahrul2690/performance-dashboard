import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class InputKontrakService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getList(unitCode?: string, periodId?: string) {
    return this.prisma.kontrakManajemen.findMany({
      where: {
        ...(unitCode ? { unitCode } : {}),
        ...(periodId ? { periodId } : {}),
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getById(id: string) {
    return this.prisma.kontrakManajemen.findUnique({ where: { id } });
  }

  async save(user: User, unitCode: string, bidang: string, holder: string, kpiItems: object) {
    const period = await this.prisma.period.findFirst({ where: { isActive: true } });
    if (!period) throw new Error('No active period');

    const result = await this.prisma.kontrakManajemen.upsert({
      where: { periodId_unitCode: { periodId: period.id, unitCode } },
      update: { bidang, holder, kpiItems: kpiItems as object, submitter: user.name, status: 'draft', submittedAt: new Date() },
      create: { periodId: period.id, unitCode, bidang, holder, kpiItems: kpiItems as object, submitter: user.name, status: 'draft' },
    });

    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: 'kontrak.save', entity: 'KontrakManajemen', targetId: result.id },
    });

    await this.cache.del(`kontrak:${unitCode}`);
    return result;
  }

  async submit(user: User, id: string) {
    const kontrak = await this.prisma.kontrakManajemen.findUnique({ where: { id } });
    if (!kontrak) throw new Error('Kontrak not found');

    const result = await this.prisma.kontrakManajemen.update({
      where: { id },
      data: { status: 'submitted', submitter: user.name },
    });

    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: 'kontrak.submit', entity: 'KontrakManajemen', targetId: id },
    });

    await this.cache.del(`kontrak:${kontrak.unitCode}`);
    return result;
  }

  async delete(user: User, id: string) {
    const kontrak = await this.prisma.kontrakManajemen.findUnique({ where: { id } });
    if (!kontrak) throw new Error('Kontrak not found');
    if (kontrak.status === 'submitted') throw new Error('Cannot delete submitted kontrak');

    await this.prisma.kontrakManajemen.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: 'kontrak.delete', entity: 'KontrakManajemen', targetId: id },
    });

    await this.cache.del(`kontrak:${kontrak.unitCode}`);
    return { success: true };
  }
}
