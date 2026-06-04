import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';

const UNIT_NAMES: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
  UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};

const RPC_BIDANG = 'Perencanaan & Project Control';
const OMP_BIDANG = 'Operasi Manajemen Proyek';
const ROLE_LABEL: Record<Role, string> = {
  STAFF: 'Staff', ASMAN: 'ASMAN', MANAJER: 'Manajer', SRMANAJER: 'Senior Manajer', GM: 'General Manager',
};

// Langkah alur (urut). Tiap langkah dipegang oleh peran + lingkup (bidang/unit).
interface Step {
  role: Role;
  bidang?: string;  // lingkup bidang Kantor Induk (mis. OMP/QA-QC/KKU/RPC)
  unit?: string;    // lingkup unit (KP atau UPMKx)
  label: string;
}

const uname = (u: string) => UNIT_NAMES[u] ?? u;

// Mesin alur: bangun urutan langkah berdasarkan unit + bidang.
// Indeks 0 = PIC/Staff (penyusun). Indeks 1..n = jenjang review hingga SM RPC.
// Persetujuan GM dilakukan terpisah pada level BUNDLE periode.
function buildSteps(unitCode: string, bidang: string): Step[] {
  const isUPMK = unitCode !== 'KP';
  const steps: Step[] = [];

  if (isUPMK) {
    // Segmen internal UPMK
    steps.push({ role: Role.STAFF, unit: unitCode, label: `Staff Kinerja ${uname(unitCode)}` });
    steps.push({ role: Role.ASMAN, unit: unitCode, label: `ASMAN ${uname(unitCode)}` });
    steps.push({ role: Role.MANAJER, unit: unitCode, label: `Manajer (MUP) ${uname(unitCode)}` });
    // Segmen Bidang Kantor Induk terkait (auto sesuai bidang KPI)
    if (bidang === OMP_BIDANG) steps.push({ role: Role.ASMAN, bidang, unit: 'KP', label: `ASMAN ${bidang}` });
    steps.push({ role: Role.MANAJER, bidang, unit: 'KP', label: `Manajer ${bidang}` });
    steps.push({ role: Role.SRMANAJER, bidang, unit: 'KP', label: `SM ${bidang}` });
  } else {
    // Segmen bidang Kantor Induk sendiri
    steps.push({ role: Role.STAFF, bidang, unit: 'KP', label: `Staff Kinerja ${bidang}` });
    if (bidang === OMP_BIDANG) steps.push({ role: Role.ASMAN, bidang, unit: 'KP', label: `ASMAN ${bidang}` });
    steps.push({ role: Role.MANAJER, bidang, unit: 'KP', label: `Manajer ${bidang}` });
    steps.push({ role: Role.SRMANAJER, bidang, unit: 'KP', label: `SM ${bidang}` });
  }

  // Segmen konsolidasi Perencanaan & Project Control (RPC).
  // Untuk realisasi bidang RPC sendiri, segmen ini menyatu dengan rantai bidangnya (tidak dobel).
  const isOwnRpc = !isUPMK && bidang === RPC_BIDANG;
  if (!isOwnRpc) {
    steps.push({ role: Role.STAFF, bidang: RPC_BIDANG, unit: 'KP', label: 'Staff Kinerja Perencanaan (RPC)' });
    steps.push({ role: Role.MANAJER, bidang: RPC_BIDANG, unit: 'KP', label: 'Manajer Perencanaan' });
    steps.push({ role: Role.SRMANAJER, bidang: RPC_BIDANG, unit: 'KP', label: 'SM Perencanaan & Project Control' });
  }
  return steps;
}

// Apakah user berhak memegang langkah ini?
function stepMatches(step: Step | undefined, user: { role: Role; bidang?: string | null; unit?: string | null }): boolean {
  if (!step) return false;
  if (user.role !== step.role) return false;
  if (step.bidang && user.bidang !== step.bidang) return false;
  if (step.unit && user.unit !== step.unit) return false;
  return true;
}

// SLA per langkah (hari kalender) — reminder di level manajemen.
const SLA_DAYS_PER_STEP = 2;
function slaRemainingDays(r: { submittedAt: Date }): number {
  const deadline = new Date(r.submittedAt).getTime() + SLA_DAYS_PER_STEP * 86400000;
  return Math.ceil((deadline - Date.now()) / 86400000);
}

@Injectable()
export class InputRealisasiService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  private async invalidateKinerja(periodId: string, unitCode: string) {
    await this.cache.del(`realisasi:${unitCode}`);
    for (const m of ['Bulan', 'Semester', 'Tahun']) {
      await this.cache.del(`kinerja:active:${m}`);
      await this.cache.del(`kinerja:${periodId}:${m}`);
    }
  }

  async getHistory(unitCode?: string, periodId?: string) {
    return this.prisma.inputRealisasi.findMany({
      where: { ...(unitCode ? { unitCode } : {}), ...(periodId ? { periodId } : {}) },
      orderBy: { submittedAt: 'desc' },
    });
  }

  // PIC/Staff menyusun & submit realisasi (per unit, per bidang) → mulai jenjang alur.
  async submit(user: User, unitCode: string, bidang: string, values: Record<string, unknown>, periodId?: string) {
    if (!bidang) throw new BadRequestException('Bidang wajib diisi');

    const steps = buildSteps(unitCode, bidang);
    // Penyusun harus cocok dengan langkah-0 (PIC/Staff unit/bidang ybs).
    if (!stepMatches(steps[0], user)) {
      throw new ForbiddenException('Anda bukan PIC/Staff Kinerja untuk unit/bidang ini');
    }

    const period = periodId
      ? await this.prisma.period.findUnique({ where: { id: periodId } })
      : await this.prisma.period.findFirst({ where: { isActive: true } });
    if (!period) throw new BadRequestException(periodId ? 'Periode tidak ditemukan' : 'Tidak ada periode aktif');

    const existing = await this.prisma.inputRealisasi.findUnique({
      where: { periodId_unitCode_bidang: { periodId: period.id, unitCode, bidang } },
    });
    const baseHistory = existing && Array.isArray(existing.history) ? (existing.history as object[]) : [];
    const history = [...baseHistory, { stepIndex: 0, actor: user.name, role: user.role, action: 'submitted', label: steps[0].label, ts: new Date().toISOString() }];

    const result = await this.prisma.inputRealisasi.upsert({
      where: { periodId_unitCode_bidang: { periodId: period.id, unitCode, bidang } },
      update: {
        values: values as object, submitter: user.name, submitterId: user.id,
        status: 'submitted', steps: steps as object, currentStepIndex: 1, currentStage: 1,
        history, reviewer: null, reviewNote: null, reviewedAt: null, submittedAt: new Date(),
      },
      create: {
        periodId: period.id, unitCode, bidang, submitter: user.name, submitterId: user.id,
        values: values as object, status: 'submitted', steps: steps as object, currentStepIndex: 1, currentStage: 1, history,
      },
    });

    await this.notifyStep(result.id, steps, 1, unitCode, bidang, user.name);
    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: 'realisasi.submit', entity: 'InputRealisasi', targetId: result.id },
    });
    await this.invalidateKinerja(period.id, unitCode);
    return result;
  }

  private async notifyStep(realisasiId: string, steps: Step[], stepIndex: number, unitCode: string, bidang: string, actorName: string) {
    const step = steps[stepIndex];
    if (!step) return;
    const recipients = await this.prisma.user.findMany({
      where: {
        role: step.role, isActive: true,
        ...(step.bidang ? { bidang: step.bidang } : {}),
        ...(step.unit ? { unit: step.unit } : {}),
      },
    });
    if (recipients.length === 0) return;
    await this.prisma.notification.createMany({
      data: recipients.map((u) => ({
        userId: u.id, type: 'approval', title: 'Realisasi Kinerja Menunggu Review',
        msg: `${actorName} meneruskan Realisasi ${uname(unitCode)} — ${bidang} untuk review: ${step.label}.`,
        route: '/approvals?type=realisasi', targetId: realisasiId, unread: true,
      })),
    });
  }

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
    await this.invalidateKinerja(r.periodId, r.unitCode);
    return { success: true };
  }

  // Daftar realisasi yang menunggu review pada LANGKAH milik user.
  async getReviewList(user: User) {
    if (user.role === Role.STAFF) {
      // Staff bisa jadi penyusun langkah-0; tapi review (langkah ≥1) bukan untuk staff penyusun.
      // Tetap perbolehkan staff RPC (PIC Perencanaan) yang menjadi langkah konsolidasi.
    }
    const submitted = await this.prisma.inputRealisasi.findMany({
      where: { status: 'submitted' },
      orderBy: { submittedAt: 'desc' },
    });
    return submitted
      .filter((r) => {
        const steps = (r.steps as unknown as Step[]) ?? [];
        return stepMatches(steps[r.currentStepIndex], user);
      })
      .map((r) => {
        const steps = (r.steps as unknown as Step[]) ?? [];
        return { ...r, stepLabel: steps[r.currentStepIndex]?.label ?? '—', slaRemainingDays: slaRemainingDays(r) };
      });
  }

  // Reviewer pada langkahnya dapat mengedit nilai realisasi (revisi minor) sebelum menyetujui.
  async updateValues(user: User, id: string, values: Record<string, unknown>) {
    const r = await this.prisma.inputRealisasi.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Realisasi tidak ditemukan');
    if (r.status !== 'submitted') throw new ForbiddenException('Hanya realisasi yang sedang direview yang dapat diedit');
    const steps = (r.steps as unknown as Step[]) ?? [];
    if (!stepMatches(steps[r.currentStepIndex], user)) {
      throw new ForbiddenException('Realisasi ini bukan pada langkah Anda');
    }
    const baseHistory = Array.isArray(r.history) ? (r.history as object[]) : [];
    const history = [...baseHistory, { stepIndex: r.currentStepIndex, actor: user.name, role: user.role, action: 'edited', ts: new Date().toISOString() }];
    const result = await this.prisma.inputRealisasi.update({ where: { id }, data: { values: values as object, history } });
    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: 'realisasi.edit', entity: 'InputRealisasi', targetId: id },
    });
    await this.invalidateKinerja(r.periodId, r.unitCode);
    return result;
  }

  // Review berjenjang mengikuti `steps`:
  //  approve → maju 1 langkah; bila lewat langkah terakhir → status 'ready' (menunggu bundle GM)
  //  reject  → 'konseptor' (kembali ke penyusun) atau 'previous' (mundur 1 langkah)
  async review(
    user: User,
    id: string,
    action: 'approve' | 'reject',
    note?: string,
    returnTo: 'konseptor' | 'previous' = 'konseptor',
  ) {
    if (action !== 'approve' && action !== 'reject') throw new BadRequestException('Aksi tidak valid');
    const r = await this.prisma.inputRealisasi.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Realisasi tidak ditemukan');
    if (r.status !== 'submitted') throw new ForbiddenException('Realisasi tidak dalam status menunggu review');
    if (!note?.trim()) throw new BadRequestException('Catatan/komentar wajib diisi saat menyetujui atau menolak');

    const steps = (r.steps as unknown as Step[]) ?? [];
    const curIdx = r.currentStepIndex;
    if (!stepMatches(steps[curIdx], user)) {
      throw new ForbiddenException(`Realisasi ini menunggu langkah "${steps[curIdx]?.label ?? 'lain'}", bukan langkah Anda`);
    }
    const baseHistory = Array.isArray(r.history) ? (r.history as object[]) : [];

    if (action === 'reject') {
      const toPrev = returnTo === 'previous' && curIdx - 1 >= 1;
      const newIdx = toPrev ? curIdx - 1 : 0;
      const history = [...baseHistory, { stepIndex: curIdx, actor: user.name, role: user.role, action: toPrev ? 'returned_step' : 'returned', toStepIndex: newIdx, label: steps[curIdx]?.label, note, ts: new Date().toISOString() }];
      const result = await this.prisma.inputRealisasi.update({
        where: { id },
        data: {
          status: toPrev ? 'submitted' : 'rejected',
          currentStepIndex: newIdx, currentStage: newIdx,
          history, reviewer: user.name, reviewNote: note, reviewedAt: new Date(),
        },
      });
      if (toPrev) {
        await this.notifyStep(id, steps, newIdx, r.unitCode, r.bidang, user.name);
      } else if (r.submitterId) {
        await this.prisma.notification.create({
          data: {
            userId: r.submitterId, type: 'alert', title: 'Realisasi Dikembalikan ke Konseptor',
            msg: `${user.name} (${steps[curIdx]?.label}) mengembalikan Realisasi ${uname(r.unitCode)} — ${r.bidang}: ${note}`,
            route: '/input-realisasi', targetId: id, unread: true,
          },
        });
      }
      await this.prisma.auditLog.create({ data: { actor: user.name, userId: user.id, action: toPrev ? 'realisasi.return_step' : 'realisasi.reject', entity: 'InputRealisasi', targetId: id, note } });
      await this.invalidateKinerja(r.periodId, r.unitCode);
      return result;
    }

    // approve → maju
    const nextIdx = curIdx + 1;
    const chainDone = nextIdx >= steps.length;
    const history = [...baseHistory, { stepIndex: curIdx, actor: user.name, role: user.role, action: 'approved', label: steps[curIdx]?.label, note, ts: new Date().toISOString() }];
    const result = await this.prisma.inputRealisasi.update({
      where: { id },
      data: {
        status: chainDone ? 'ready' : 'submitted',
        currentStepIndex: chainDone ? steps.length : nextIdx,
        currentStage: chainDone ? steps.length : nextIdx,
        history, reviewer: user.name, reviewNote: note, reviewedAt: new Date(),
      },
    });
    if (chainDone) {
      // Lolos sampai SM RPC → siap masuk bundle periode. Beri tahu GM.
      const gms = await this.prisma.user.findMany({ where: { role: Role.GM, isActive: true } });
      if (gms.length) {
        await this.prisma.notification.createMany({
          data: gms.map((g) => ({
            userId: g.id, type: 'approval', title: 'Realisasi Siap Masuk Bundle',
            msg: `Realisasi ${uname(r.unitCode)} — ${r.bidang} telah lolos hingga SM Perencanaan & PC dan siap dikonsolidasi periode.`,
            route: '/approvals?type=realisasi', targetId: id, unread: true,
          })),
        });
      }
    } else {
      await this.notifyStep(id, steps, nextIdx, r.unitCode, r.bidang, user.name);
    }
    await this.prisma.auditLog.create({ data: { actor: user.name, userId: user.id, action: 'realisasi.approve', entity: 'InputRealisasi', targetId: id, note } });
    await this.invalidateKinerja(r.periodId, r.unitCode);
    return result;
  }

  // ===== BUNDLE periode (persetujuan akhir oleh GM, sekali untuk seluruh komponen) =====

  async getBundle(periodId?: string) {
    const period = periodId
      ? await this.prisma.period.findUnique({ where: { id: periodId } })
      : await this.prisma.period.findFirst({ where: { isActive: true } });
    if (!period) return { period: null, status: 'open', components: [], total: 0, readyCount: 0, canApprove: false };

    const components = await this.prisma.inputRealisasi.findMany({
      where: { periodId: period.id, status: { in: ['submitted', 'ready', 'approved'] } },
      orderBy: [{ unitCode: 'asc' }, { bidang: 'asc' }],
    });
    const bundle = await this.prisma.realisasiBundle.findUnique({ where: { periodId: period.id } });
    const readyCount = components.filter((c) => c.status === 'ready').length;
    const approvedCount = components.filter((c) => c.status === 'approved').length;
    const inflight = components.length;
    // GM dapat menyetujui bila ada komponen & SEMUA komponen in-flight sudah 'ready' (belum ada yg approved).
    const canApprove = inflight > 0 && components.every((c) => c.status === 'ready');
    return {
      period,
      status: bundle?.status ?? 'open',
      reviewer: bundle?.reviewer ?? null,
      reviewNote: bundle?.reviewNote ?? null,
      reviewedAt: bundle?.reviewedAt ?? null,
      total: inflight,
      readyCount,
      approvedCount,
      canApprove,
      components: components.map((c) => ({
        id: c.id, unitCode: c.unitCode, bidang: c.bidang, status: c.status,
        submitter: c.submitter, reviewer: c.reviewer,
      })),
    };
  }

  async reviewBundle(user: User, action: 'approve' | 'reject', note: string, periodId?: string) {
    if (user.role !== Role.GM) throw new ForbiddenException('Hanya General Manager yang menyetujui bundle realisasi');
    if (!note?.trim()) throw new BadRequestException('Catatan/komentar wajib diisi');
    const period = periodId
      ? await this.prisma.period.findUnique({ where: { id: periodId } })
      : await this.prisma.period.findFirst({ where: { isActive: true } });
    if (!period) throw new BadRequestException('Periode tidak ditemukan');

    const components = await this.prisma.inputRealisasi.findMany({
      where: { periodId: period.id, status: { in: ['submitted', 'ready'] } },
    });
    if (components.length === 0) throw new BadRequestException('Tidak ada realisasi yang siap dikonsolidasi pada periode ini');

    if (action === 'approve') {
      if (!components.every((c) => c.status === 'ready')) {
        throw new ForbiddenException('Masih ada komponen yang belum lolos sampai SM Perencanaan & PC');
      }
      await this.prisma.inputRealisasi.updateMany({
        where: { periodId: period.id, status: 'ready' },
        data: { status: 'approved', reviewer: user.name, reviewedAt: new Date() },
      });
    } else {
      // tolak seluruh bundle → kembalikan komponen 'ready' ke konseptor
      await this.prisma.inputRealisasi.updateMany({
        where: { periodId: period.id, status: 'ready' },
        data: { status: 'rejected', currentStepIndex: 0, currentStage: 0, reviewer: user.name, reviewNote: note, reviewedAt: new Date() },
      });
    }

    const bundle = await this.prisma.realisasiBundle.upsert({
      where: { periodId: period.id },
      update: { status: action === 'approve' ? 'approved' : 'rejected', reviewer: user.name, reviewNote: note, reviewedAt: new Date() },
      create: { periodId: period.id, status: action === 'approve' ? 'approved' : 'rejected', reviewer: user.name, reviewNote: note, reviewedAt: new Date() },
    });

    // Notifikasi penyusun
    const submitterIds = [...new Set(components.map((c) => c.submitterId).filter(Boolean))] as string[];
    if (submitterIds.length) {
      await this.prisma.notification.createMany({
        data: submitterIds.map((sid) => ({
          userId: sid, type: action === 'approve' ? 'success' : 'alert',
          title: action === 'approve' ? 'Bundle Realisasi Disetujui GM' : 'Bundle Realisasi Dikembalikan GM',
          msg: action === 'approve'
            ? `Realisasi periode ${period.label} disetujui penuh oleh ${user.name}.`
            : `Bundle realisasi periode ${period.label} dikembalikan oleh ${user.name}: ${note}`,
          route: action === 'approve' ? '/operational' : '/input-realisasi', unread: true,
        })),
      });
    }
    await this.prisma.auditLog.create({ data: { actor: user.name, userId: user.id, action: `realisasi.bundle.${action}`, entity: 'RealisasiBundle', targetId: bundle.id, note } });
    // Segarkan dashboard
    for (const m of ['Bulan', 'Semester', 'Tahun']) {
      await this.cache.del(`kinerja:active:${m}`);
      await this.cache.del(`kinerja:${period.id}:${m}`);
    }
    return bundle;
  }
}
