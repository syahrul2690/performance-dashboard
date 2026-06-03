import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';

const UNIT_NAMES: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
  UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};

// Jenjang persetujuan realisasi: Staff(1) → Asman(2) → Manajer(3) → Sr.Manajer(4) → GM(5, final)
const ROLE_TO_STAGE: Record<Role, number> = {
  STAFF: 1, ASMAN: 2, MANAJER: 3, SRMANAJER: 4, GM: 5,
};
const STAGE_TO_ROLE: Record<number, Role> = {
  2: Role.ASMAN, 3: Role.MANAJER, 4: Role.SRMANAJER, 5: Role.GM,
};
const STAGE_LABEL: Record<number, string> = {
  1: 'Staff', 2: 'Asisten Manajer', 3: 'Manajer Bidang', 4: 'Senior Manajer', 5: 'General Manager',
};
const FINAL_STAGE = 5;

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

  // Staff submit realisasi → masuk tahap 2 (Asman), notifikasi ke Asman.
  async submit(user: User, unitCode: string, values: Record<string, unknown>) {
    const period = await this.prisma.period.findFirst({ where: { isActive: true } });
    if (!period) throw new BadRequestException('Tidak ada periode aktif');

    const existing = await this.prisma.inputRealisasi.findUnique({
      where: { periodId_unitCode: { periodId: period.id, unitCode } },
    });
    const baseHistory = existing && Array.isArray(existing.history) ? (existing.history as object[]) : [];
    const history = [...baseHistory, { stage: 1, actor: user.name, role: user.role, action: 'submitted', ts: new Date().toISOString() }];

    const result = await this.prisma.inputRealisasi.upsert({
      where: { periodId_unitCode: { periodId: period.id, unitCode } },
      update: {
        values: values as object, submitter: user.name, submitterId: user.id,
        status: 'submitted', currentStage: 2, history,
        reviewer: null, reviewNote: null, reviewedAt: null, submittedAt: new Date(),
      },
      create: {
        periodId: period.id, unitCode, submitter: user.name, submitterId: user.id,
        values: values as object, status: 'submitted', currentStage: 2, history,
      },
    });

    await this.notifyStage(2, result, user.name);
    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: 'realisasi.submit', entity: 'InputRealisasi', targetId: result.id },
    });
    await this.cache.del(`realisasi:${unitCode}`);
    return result;
  }

  private async notifyStage(stage: number, realisasi: { id: string; unitCode: string }, actorName: string) {
    const role = STAGE_TO_ROLE[stage];
    if (!role) return;
    const recipients = await this.prisma.user.findMany({ where: { role, isActive: true } });
    if (recipients.length === 0) return;
    const unitLabel = UNIT_NAMES[realisasi.unitCode] ?? realisasi.unitCode;
    await this.prisma.notification.createMany({
      data: recipients.map((u) => ({
        userId: u.id,
        type: 'approval',
        title: 'Realisasi Kinerja Menunggu Review',
        msg: `${actorName} mengirim Realisasi Kinerja ${unitLabel} untuk review ${STAGE_LABEL[stage]}.`,
        route: '/approvals',
        targetId: realisasi.id,
        unread: true,
      })),
    });
  }

  // Hapus realisasi — oleh pengirim sendiri (atau GM), selama belum disetujui final.
  async delete(user: User, id: string) {
    const r = await this.prisma.inputRealisasi.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Realisasi tidak ditemukan');
    if (r.status === 'approved') throw new ForbiddenException('Realisasi yang sudah disetujui final tidak dapat dihapus');
    const isOwner = r.submitterId && r.submitterId === user.id;
    if (!isOwner && user.role !== Role.GM) {
      throw new ForbiddenException('Hanya pengirim atau GM yang dapat menghapus realisasi ini');
    }
    await this.prisma.inputRealisasi.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: 'realisasi.delete', entity: 'InputRealisasi', targetId: id },
    });
    await this.cache.del(`realisasi:${r.unitCode}`);
    await this.cache.del('kinerja:active');
    await this.cache.del(`kinerja:${r.periodId}`);
    return { success: true };
  }

  // Daftar realisasi menunggu review pada TAHAP user
  async getReviewList(user: User) {
    if (user.role === Role.STAFF) throw new ForbiddenException('Tidak berwenang me-review');
    const stage = ROLE_TO_STAGE[user.role];
    return this.prisma.inputRealisasi.findMany({
      where: { status: 'submitted', currentStage: stage },
      orderBy: { submittedAt: 'desc' },
    });
  }

  // Review berjenjang (hybrid): approve naik tahap hingga GM; reject ke konseptor / mundur 1 tahap.
  async review(
    user: User,
    id: string,
    action: 'approve' | 'reject',
    note?: string,
    returnTo: 'konseptor' | 'previous' = 'konseptor',
  ) {
    if (user.role === Role.STAFF) throw new ForbiddenException('Tidak berwenang me-review');
    if (action !== 'approve' && action !== 'reject') throw new BadRequestException('Aksi tidak valid');

    const r = await this.prisma.inputRealisasi.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Realisasi tidak ditemukan');
    if (r.status !== 'submitted') throw new ForbiddenException('Realisasi tidak dalam status menunggu review');
    if (action === 'reject' && !note) throw new BadRequestException('Catatan wajib diisi saat menolak');

    const userStage = ROLE_TO_STAGE[user.role];
    if (r.currentStage !== userStage) {
      throw new ForbiddenException(`Realisasi ini menunggu review ${STAGE_LABEL[r.currentStage] ?? 'tahap lain'}, bukan tahap Anda`);
    }

    const baseHistory = Array.isArray(r.history) ? (r.history as object[]) : [];

    if (action === 'reject') {
      const prevStage = userStage - 1;
      const oneStep = returnTo === 'previous' && prevStage >= 2;

      if (oneStep) {
        const history = [...baseHistory, { stage: userStage, actor: user.name, role: user.role, action: 'returned_step', toStage: prevStage, note, ts: new Date().toISOString() }];
        const result = await this.prisma.inputRealisasi.update({
          where: { id },
          data: { status: 'submitted', currentStage: prevStage, history, reviewer: user.name, reviewNote: note ?? null, reviewedAt: new Date() },
        });
        await this.notifyStage(prevStage, result, user.name);
        await this.prisma.auditLog.create({ data: { actor: user.name, userId: user.id, action: 'realisasi.return_step', entity: 'InputRealisasi', targetId: id, note } });
        await this.cache.del(`realisasi:${r.unitCode}`);
    await this.cache.del('kinerja:active');
    await this.cache.del(`kinerja:${r.periodId}`);
        return result;
      }

      const history = [...baseHistory, { stage: userStage, actor: user.name, role: user.role, action: 'returned', note, ts: new Date().toISOString() }];
      const result = await this.prisma.inputRealisasi.update({
        where: { id },
        data: { status: 'rejected', currentStage: 1, history, reviewer: user.name, reviewNote: note ?? null, reviewedAt: new Date() },
      });
      if (r.submitterId) {
        await this.prisma.notification.create({
          data: {
            userId: r.submitterId, type: 'alert', title: 'Realisasi Dikembalikan ke Konseptor',
            msg: `${user.name} (${STAGE_LABEL[userStage]}) mengembalikan Realisasi Kinerja untuk revisi: ${note}`,
            route: '/input-realisasi', targetId: id, unread: true,
          },
        });
      }
      await this.prisma.auditLog.create({ data: { actor: user.name, userId: user.id, action: 'realisasi.reject', entity: 'InputRealisasi', targetId: id, note } });
      await this.cache.del(`realisasi:${r.unitCode}`);
    await this.cache.del('kinerja:active');
    await this.cache.del(`kinerja:${r.periodId}`);
      return result;
    }

    // approve
    const isFinal = userStage >= FINAL_STAGE;
    const nextStage = isFinal ? userStage : userStage + 1;
    const history = [...baseHistory, { stage: userStage, actor: user.name, role: user.role, action: 'approved', note, ts: new Date().toISOString() }];

    const result = await this.prisma.inputRealisasi.update({
      where: { id },
      data: {
        status: isFinal ? 'approved' : 'submitted',
        currentStage: nextStage,
        history,
        reviewer: user.name, reviewNote: note ?? null, reviewedAt: new Date(),
      },
    });

    if (isFinal) {
      if (r.submitterId) {
        await this.prisma.notification.create({
          data: {
            userId: r.submitterId, type: 'success', title: 'Realisasi Disetujui (Final)',
            msg: `Realisasi Kinerja ${UNIT_NAMES[r.unitCode] ?? r.unitCode} telah disetujui penuh hingga ${STAGE_LABEL[FINAL_STAGE]} oleh ${user.name}.`,
            route: '/input-realisasi', targetId: id, unread: true,
          },
        });
      }
    } else {
      await this.notifyStage(nextStage, result, user.name);
    }

    await this.prisma.auditLog.create({ data: { actor: user.name, userId: user.id, action: 'realisasi.approve', entity: 'InputRealisasi', targetId: id, note } });
    await this.cache.del(`realisasi:${r.unitCode}`);
    await this.cache.del('kinerja:active');
    await this.cache.del(`kinerja:${r.periodId}`);
    return result;
  }
}
