import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetaService {
  constructor(private prisma: PrismaService) {}

  async getActivePeriod() {
    return this.prisma.period.findFirst({ where: { isActive: true } });
  }

  async getPeriods() {
    return this.prisma.period.findMany({ orderBy: { yearMonth: 'desc' } });
  }

  async getRoleVariants() {
    return this.prisma.roleVariant.findMany({
      orderBy: [{ tier: 'asc' }, { label: 'asc' }],
    });
  }
}
