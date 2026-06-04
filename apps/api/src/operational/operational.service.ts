import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OperationalService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getData(periodId?: string) {
    const cacheKey = `operational:${periodId || 'active'}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const period = periodId
      ? await this.prisma.period.findUnique({ where: { id: periodId } })
      : await this.prisma.period.findFirst({ where: { isActive: true } });

    if (!period) return null;

    let snap = await this.prisma.operationalSnapshot.findUnique({ where: { periodId: period.id } });
    // Fallback baseline ke snapshot periode aktif bila periode terpilih belum punya snapshot.
    if (!snap) {
      const active = await this.prisma.period.findFirst({ where: { isActive: true } });
      if (active && active.id !== period.id) {
        snap = await this.prisma.operationalSnapshot.findUnique({ where: { periodId: active.id } });
      }
    }
    const result = { period, data: snap?.data ?? null };
    await this.cache.set(cacheKey, result);
    return result;
  }
}
