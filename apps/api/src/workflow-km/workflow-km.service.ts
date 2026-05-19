import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class WorkflowKmService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getUsulan() {
    const cached = await this.cache.get('wkm:usulan');
    if (cached) return cached;

    const docs = await this.prisma.kMDocument.findMany({
      where: { tipe: { in: ['WF1', 'WF1B', 'WF2'] } },
      include: { reviews: { orderBy: { createdAt: 'desc' }, take: 5 } },
      orderBy: { createdAt: 'desc' },
    });

    await this.cache.set('wkm:usulan', docs);
    return docs;
  }

  async getRealisasi() {
    const cached = await this.cache.get('wkm:realisasi');
    if (cached) return cached;

    const docs = await this.prisma.kMDocument.findMany({
      where: { tipe: 'WF3' },
      include: { reviews: { orderBy: { createdAt: 'desc' }, take: 5 } },
      orderBy: { createdAt: 'desc' },
    });

    await this.cache.set('wkm:realisasi', docs);
    return docs;
  }

  async review(docId: string, action: 'approve' | 'return', note: string, user: User) {
    const doc = await this.prisma.kMDocument.findUnique({ where: { docId } });
    if (!doc) throw new NotFoundException('Document not found');

    const nextStatus = action === 'approve'
      ? this.nextStatus(doc.status)
      : 'RETURNED' as const;

    const updated = await this.prisma.kMDocument.update({
      where: { docId },
      data: { status: nextStatus },
    });

    await this.prisma.kMReview.create({
      data: { docId, actor: user.name, action, note },
    });

    await this.prisma.auditLog.create({
      data: {
        actor: user.name, userId: user.id,
        action: `km.${action}`, entity: 'KMDocument', targetId: docId, note,
      },
    });

    await this.cache.del('wkm:usulan');
    await this.cache.del('wkm:realisasi');

    return updated;
  }

  private nextStatus(current: string): 'IN_REVIEW_C1' | 'IN_REVIEW_C2' | 'IN_REVIEW_SM' | 'APPROVED' | 'RETURNED' {
    const flow: Record<string, 'IN_REVIEW_C1' | 'IN_REVIEW_C2' | 'IN_REVIEW_SM' | 'APPROVED' | 'RETURNED'> = {
      IN_REVIEW_C1: 'IN_REVIEW_C2',
      IN_REVIEW_C2: 'IN_REVIEW_SM',
      IN_REVIEW_SM: 'APPROVED',
      APPROVED: 'APPROVED',
      RETURNED: 'RETURNED',
    };
    return flow[current] ?? 'IN_REVIEW_C1';
  }
}
