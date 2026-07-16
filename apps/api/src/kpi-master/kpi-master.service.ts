import { Injectable, Inject, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { CHECKER_ROLES, APPROVER_ROLES } from '../common/workflow-steps';

export interface AssignmentInput {
  unitCode: string;
  bidang: string;
  holder?: string;
  bobotKm?: string;
  target?: string;
  target2?: string;
  persenAgregasi?: number; // bobot rollup ke parent (0-100), diinput RPC Perencanaan
}
export interface SaveMasterInput {
  id?: string;
  kmType?: string; // 'draft' | 'final'
  indikator: string;
  formula?: string;
  satuan?: string;
  targetParent?: string;
  assignments: AssignmentInput[];
  defaultCheckerIds?: string[]; // default alur reviewer (Fase C) — diwariskan ke picker submit
  defaultApproverId?: string;
  aggregationMethod?: string; // 'weighted' | 'sum' (Fase E) — dipilih per-KPI
}

// Item yang disebar (fan-out) ke kpiItems dokumen KM. Bentuknya kompatibel dengan
// KpiItem existing (indikator/formula/satuan/bobot/target/target2) + tautan masterKpiId.
type FannedItem = {
  masterKpiId: string;
  indikator: string; formula: string; satuan: string;
  bobot: string; target: string; target2: string;
};

@Injectable()
export class KpiMasterService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  // Default: sembunyikan versi 'superseded' (riwayat) — hanya tampilkan versi yang masih
  // hidup (berlaku sekarang ATAU pending berlaku bulan berikutnya). includeSuperseded=true
  // untuk melihat seluruh riwayat versi.
  async list(year?: string, kmType?: string, includeSuperseded = false) {
    const activePeriod = await this.prisma.period.findFirst({ where: { isActive: true } });
    const masters = await this.prisma.kpiMaster.findMany({
      where: {
        ...(year ? { year } : {}), ...(kmType ? { kmType } : {}),
        ...(includeSuperseded ? {} : { status: { not: 'superseded' } }),
      },
      include: { assignments: { orderBy: [{ unitCode: 'asc' }, { bidang: 'asc' }] } },
      orderBy: { createdAt: 'desc' },
    });
    return masters.map((m) => this.withVersionFlags(m, activePeriod?.yearMonth));
  }

  private withVersionFlags<T extends { effectiveMonth: string; status: string }>(m: T, activeYearMonth?: string) {
    const isPending = !!activeYearMonth && m.effectiveMonth > activeYearMonth;
    return { ...m, isPending, isCurrent: m.status === 'active' && !isPending };
  }

  // Default reviewer (Fase C) untuk dokumen KM: cari masterKpiId pertama pada kpiItems
  // dokumen tsb, lalu ambil defaultCheckerIds/defaultApproverId master-nya. Dipakai
  // frontend untuk pre-fill ReviewerPickerModal — submitter tetap bisa mengubahnya.
  async getDefaultsForKm(kmId: string) {
    const km = await this.prisma.kontrakManajemen.findUnique({ where: { id: kmId } });
    if (!km) return { checkerIds: [], approverId: null };
    const items = (Array.isArray(km.kpiItems) ? km.kpiItems : []) as Record<string, unknown>[];
    const masterId = items.map((it) => it['masterKpiId']).find((v) => typeof v === 'string') as string | undefined;
    if (!masterId) return { checkerIds: [], approverId: null };
    const master = await this.prisma.kpiMaster.findUnique({ where: { id: masterId } });
    if (!master) return { checkerIds: [], approverId: null };
    return { checkerIds: master.defaultCheckerIds, approverId: master.defaultApproverId };
  }

  async getById(id: string) {
    const m = await this.prisma.kpiMaster.findUnique({
      where: { id },
      include: { assignments: { orderBy: [{ unitCode: 'asc' }, { bidang: 'asc' }] } },
    });
    if (!m) throw new NotFoundException('KPI master tidak ditemukan');
    const activePeriod = await this.prisma.period.findFirst({ where: { isActive: true } });
    return this.withVersionFlags(m, activePeriod?.yearMonth);
  }

  // Rollup: gulung realisasi tiap assignment (child) menjadi nilai parent. Realisasi
  // diambil dari InputRealisasi yang APPROVED pada periode terkait — dicari item dengan
  // masterKpiId yang cocok (masterKpiId ikut tersalin ke realisasi karena fan-out
  // menyisipkannya di kpiItems KM). Metode agregasi (Fase E) dipilih per-KPI:
  //   'weighted' — rata-rata tertimbang pakai persenAgregasi (Σ=100% jadi syarat lengkap).
  //   'sum'      — jumlah polos tiap kontribusi (cocok utk KPI penalti/pengurang lintas
  //                bidang); tidak ada syarat Σ=100%, selalu dianggap "lengkap".
  async getRollup(id: string, periodId?: string) {
    const master = await this.getById(id);
    const period = periodId
      ? await this.prisma.period.findUnique({ where: { id: periodId } })
      : await this.prisma.period.findFirst({ where: { isActive: true } });
    if (!period) throw new BadRequestException('Periode tidak ditemukan');

    const num = (v: unknown): number => {
      if (v == null) return 0;
      const n = parseFloat(String(v).replace(',', '.').replace(/[^0-9.-]/g, ''));
      return Number.isFinite(n) ? n : 0;
    };
    const r2 = (n: number) => Math.round(n * 100) / 100;
    const isSum = master.aggregationMethod === 'sum';

    const totalPersen = r2(master.assignments.reduce((s, a) => s + a.persenAgregasi, 0));
    let nilaiParent = 0;
    const breakdown: Array<{
      unitCode: string; bidang: string; persenAgregasi: number;
      realisasi: number | null; kontribusi: number; hasData: boolean;
    }> = [];

    for (const a of master.assignments) {
      const record = await this.prisma.inputRealisasi.findFirst({
        where: { periodId: period.id, unitCode: a.unitCode, bidang: a.bidang, status: 'approved' },
      });
      const values = (record?.values ?? {}) as Record<string, Record<string, unknown>>;
      const item = Object.values(values).find((it) => it['masterKpiId'] === master.id);
      const realisasi = item ? num(item['realisasi']) : null;
      const kontribusi = realisasi == null ? 0 : isSum ? r2(realisasi) : r2((realisasi * a.persenAgregasi) / 100);
      nilaiParent += kontribusi;
      breakdown.push({
        unitCode: a.unitCode, bidang: a.bidang, persenAgregasi: a.persenAgregasi,
        realisasi, kontribusi, hasData: realisasi != null,
      });
    }

    return {
      masterId: master.id, indikator: master.indikator, targetParent: master.targetParent,
      periodId: period.id, periodLabel: period.label,
      aggregationMethod: master.aggregationMethod,
      totalPersen, nilaiParent: r2(nilaiParent),
      isFullyConfigured: isSum || Math.abs(totalPersen - 100) < 0.01,
      breakdown,
    };
  }

  // Buat/ubah definisi KPI parent + assignment-nya, lalu sebar (fan-out) ke dokumen KM.
  async save(user: User, dto: SaveMasterInput) {
    if (user.unit !== 'KP') throw new ForbiddenException('KPI Master hanya dapat disusun oleh Kantor Induk');
    if (!dto.indikator?.trim()) throw new BadRequestException('Nama indikator wajib diisi');
    if (!Array.isArray(dto.assignments) || dto.assignments.length === 0) {
      throw new BadRequestException('Pilih minimal satu unit/bidang untuk di-assign');
    }
    for (const a of dto.assignments) {
      if (!a.unitCode?.trim() || !a.bidang?.trim()) throw new BadRequestException('Setiap assignment wajib punya unit & bidang');
    }
    // Cegah duplikat (unit,bidang) dalam satu master.
    const keys = new Set<string>();
    for (const a of dto.assignments) {
      const k = `${a.unitCode}||${a.bidang}`;
      if (keys.has(k)) throw new BadRequestException(`Assignment ganda untuk ${a.unitCode} — ${a.bidang}`);
      keys.add(k);
    }
    // Metode agregasi (Fase E) — dipilih per-KPI. 'sum' = jumlah polos tiap kontribusi
    // (KPI penalti/pengurang, tanpa syarat Σ=100%). 'weighted' = rata-rata tertimbang
    // pakai persenAgregasi (Σ=100% wajib bila diisi) — perilaku Fase B, default.
    const aggregationMethod = dto.aggregationMethod === 'sum' ? 'sum' : 'weighted';
    if (aggregationMethod === 'weighted') {
      const totalPersen = dto.assignments.reduce((s, a) => s + (Number(a.persenAgregasi) || 0), 0);
      const anyPersenSet = dto.assignments.some((a) => Number(a.persenAgregasi) > 0);
      if (anyPersenSet && Math.abs(totalPersen - 100) > 0.01) {
        throw new BadRequestException(`Total bobot agregasi harus 100%, saat ini ${totalPersen}%`);
      }
    }

    // Default alur reviewer (Fase C): opsional — bila diisi, harus resolve ke user aktif
    // dengan role yang sesuai (Checker=ASMAN/Manajer, Approver=SRManajer/GM). Ini hanya
    // DEFAULT untuk mengisi picker submit; submitter tetap bisa mengubahnya.
    const defaultCheckerIds = (dto.defaultCheckerIds ?? []).filter(Boolean);
    const defaultApproverId = dto.defaultApproverId?.trim() || null;
    if (defaultCheckerIds.length > 0 || defaultApproverId) {
      const ids = [...defaultCheckerIds, ...(defaultApproverId ? [defaultApproverId] : [])];
      const users = await this.prisma.user.findMany({ where: { id: { in: ids }, isActive: true } });
      for (const cid of defaultCheckerIds) {
        const u = users.find((x) => x.id === cid);
        if (!u || !CHECKER_ROLES.includes(u.role)) throw new BadRequestException('Default Checker harus user aktif berperan ASMAN/Manajer');
      }
      if (defaultApproverId) {
        const u = users.find((x) => x.id === defaultApproverId);
        if (!u || !APPROVER_ROLES.includes(u.role)) throw new BadRequestException('Default Approver harus user aktif berperan Sr. Manajer/GM');
      }
    }

    const activePeriod = await this.prisma.period.findFirst({ where: { isActive: true } });
    if (!activePeriod) throw new BadRequestException('Tidak ada periode aktif');
    const kmType = dto.kmType === 'final' ? 'final' : 'draft';

    // ===== Versioning (Fase D) =====
    // Master BARU: berlaku langsung mulai periode aktif.
    // Master EDIT, versi SEDANG BERLAKU (effectiveMonth <= periode aktif): tidak diubah di
    //   tempat — dibuat VERSI BARU berlaku bulan BERIKUTNYA; versi lama ditandai 'superseded'
    //   tanpa disentuh datanya (periode berjalan tetap memakai definisi lama).
    // Master EDIT, versi PENDING (effectiveMonth > periode aktif, belum berlaku): masih boleh
    //   diedit langsung di tempat karena belum pernah "hidup" di periode manapun.
    let master;
    let targetPeriodId: string;
    let supersedeId: string | null = null;

    if (dto.id) {
      const existing = await this.prisma.kpiMaster.findUnique({ where: { id: dto.id } });
      if (!existing) throw new NotFoundException('KPI master tidak ditemukan');
      if (existing.status === 'superseded') {
        throw new BadRequestException('Versi KPI ini sudah digantikan versi yang lebih baru — edit versi terbaru sebagai gantinya');
      }
      const isPending = existing.effectiveMonth > activePeriod.yearMonth;

      if (isPending) {
        const targetPeriod = await this.prisma.period.findUnique({ where: { yearMonth: existing.effectiveMonth } });
        if (!targetPeriod) throw new BadRequestException(`Periode ${existing.effectiveMonth} tidak ditemukan`);
        master = await this.prisma.kpiMaster.update({
          where: { id: dto.id },
          data: {
            indikator: dto.indikator.trim(), formula: dto.formula ?? '', satuan: dto.satuan ?? '',
            targetParent: dto.targetParent ?? '', kmType, defaultCheckerIds, defaultApproverId, aggregationMethod,
          },
        });
        await this.prisma.kpiAssignment.deleteMany({ where: { kpiMasterId: master.id } });
        targetPeriodId = targetPeriod.id;
      } else {
        const nextMonth = this.incrementYearMonth(activePeriod.yearMonth);
        const nextPeriod = await this.prisma.period.findUnique({ where: { yearMonth: nextMonth } });
        if (!nextPeriod) throw new BadRequestException(`Periode ${nextMonth} belum tersedia di sistem — tidak dapat membuat versi baru`);
        master = await this.prisma.kpiMaster.create({
          data: {
            year: nextPeriod.yearMonth.slice(0, 4), kmType, indikator: dto.indikator.trim(), formula: dto.formula ?? '',
            satuan: dto.satuan ?? '', targetParent: dto.targetParent ?? '', createdBy: user.name, createdById: user.id,
            defaultCheckerIds, defaultApproverId, aggregationMethod,
            effectiveMonth: nextMonth, version: existing.version + 1, previousVersionId: existing.id,
          },
        });
        supersedeId = existing.id;
        targetPeriodId = nextPeriod.id;
      }
    } else {
      master = await this.prisma.kpiMaster.create({
        data: {
          year: activePeriod.yearMonth.slice(0, 4), kmType, indikator: dto.indikator.trim(), formula: dto.formula ?? '',
          satuan: dto.satuan ?? '', targetParent: dto.targetParent ?? '', createdBy: user.name, createdById: user.id,
          defaultCheckerIds, defaultApproverId, aggregationMethod, effectiveMonth: activePeriod.yearMonth, version: 1,
        },
      });
      targetPeriodId = activePeriod.id;
    }

    await this.prisma.kpiAssignment.createMany({
      data: dto.assignments.map((a) => ({
        kpiMasterId: master.id, unitCode: a.unitCode, bidang: a.bidang,
        holder: a.holder ?? '', bobotKm: a.bobotKm ?? '', target: a.target ?? '', target2: a.target2 ?? '',
        persenAgregasi: Number(a.persenAgregasi) || 0,
      })),
    });

    const assignments = await this.prisma.kpiAssignment.findMany({ where: { kpiMasterId: master.id } });
    const fanOut = await this.fanOut(master, assignments, targetPeriodId);

    if (supersedeId) {
      await this.prisma.kpiMaster.update({ where: { id: supersedeId }, data: { status: 'superseded' } });
    }

    await this.prisma.auditLog.create({
      data: {
        actor: user.name, userId: user.id, action: dto.id ? 'kpi_master.update' : 'kpi_master.create',
        entity: 'KpiMaster', targetId: master.id,
        note: supersedeId
          ? `KPI "${master.indikator}" diedit — versi baru (v${master.version}) berlaku mulai ${master.effectiveMonth}, versi lama diarsipkan`
          : `KPI "${master.indikator}" di-assign ke ${assignments.length} unit/bidang (${fanOut.docsAffected} dokumen KM diperbarui)`,
      },
    });
    for (const a of assignments) await this.cache.del(`kontrak:${a.unitCode}`);
    return this.getById(master.id);
  }

  private incrementYearMonth(ym: string): string {
    const [y, m] = ym.split('-').map(Number);
    const ny = m === 12 ? y + 1 : y;
    const nm = m === 12 ? 1 : m + 1;
    return `${ny}-${String(nm).padStart(2, '0')}`;
  }

  async delete(user: User, id: string) {
    if (user.unit !== 'KP') throw new ForbiddenException('Hanya Kantor Induk yang dapat menghapus KPI Master');
    const master = await this.prisma.kpiMaster.findUnique({ where: { id } });
    if (!master) throw new NotFoundException('KPI master tidak ditemukan');

    // Hapus item yang sudah disebar dari dokumen KM DRAFT (dokumen submitted/approved tak disentuh).
    const removed = await this.removeFannedItems(id, master.kmType);
    await this.prisma.kpiMaster.delete({ where: { id } }); // cascade menghapus assignments

    // Bila yang dihapus adalah versi baru hasil edit, versi sebelumnya kembali jadi versi berlaku.
    if (master.previousVersionId) {
      await this.prisma.kpiMaster.update({ where: { id: master.previousVersionId }, data: { status: 'active' } }).catch(() => {});
    }

    await this.prisma.auditLog.create({
      data: {
        actor: user.name, userId: user.id, action: 'kpi_master.delete', entity: 'KpiMaster', targetId: id,
        note: `KPI "${master.indikator}" (v${master.version}) dihapus (${removed} item dibersihkan dari dokumen KM draft)`,
      },
    });
    return { success: true, docsCleaned: removed };
  }

  // ===== Fan-out: sinkronkan item KPI ke dokumen KM DRAFT per-(unit,bidang) =====
  private async fanOut(
    master: { id: string; kmType: string; indikator: string; formula: string; satuan: string; createdBy: string; createdById: string | null },
    assignments: Array<{ unitCode: string; bidang: string; holder: string; bobotKm: string; target: string; target2: string }>,
    periodId: string,
  ): Promise<{ docsAffected: number }> {
    const assignedKeys = new Set(assignments.map((a) => `${a.unitCode}||${a.bidang}`));
    let docsAffected = 0;

    // 1. Bersihkan item KPI ini dari dokumen KM draft yang (unit,bidang)-nya tak lagi di-assign.
    const draftKms = await this.prisma.kontrakManajemen.findMany({
      where: { periodId, kmType: master.kmType, status: 'draft' },
    });
    for (const km of draftKms) {
      const items = (Array.isArray(km.kpiItems) ? km.kpiItems : []) as Record<string, unknown>[];
      const hasMaster = items.some((it) => it['masterKpiId'] === master.id);
      const key = `${km.unitCode}||${km.bidang}`;
      if (hasMaster && !assignedKeys.has(key)) {
        const filtered = items.filter((it) => it['masterKpiId'] !== master.id);
        await this.prisma.kontrakManajemen.update({ where: { id: km.id }, data: { kpiItems: filtered as object } });
        docsAffected++;
      }
    }

    // 2. Sisipkan/perbarui item KPI di dokumen KM draft tiap (unit,bidang) yang di-assign.
    for (const a of assignments) {
      const item: FannedItem = {
        masterKpiId: master.id,
        indikator: master.indikator, formula: master.formula, satuan: master.satuan,
        bobot: a.bobotKm, target: a.target, target2: a.target2,
      };
      const existingKm = await this.prisma.kontrakManajemen.findFirst({
        where: { periodId, unitCode: a.unitCode, bidang: a.bidang, kmType: master.kmType, status: 'draft' },
        orderBy: { updatedAt: 'desc' },
      });
      if (!existingKm) {
        await this.prisma.kontrakManajemen.create({
          data: {
            periodId, unitCode: a.unitCode, bidang: a.bidang, kmType: master.kmType,
            holder: a.holder || master.createdBy, kpiItems: [item] as object, status: 'draft',
            submitter: master.createdBy, submitterId: master.createdById,
          },
        });
        docsAffected++;
      } else {
        const items = (Array.isArray(existingKm.kpiItems) ? existingKm.kpiItems : []) as Record<string, unknown>[];
        const idx = items.findIndex((it) => it['masterKpiId'] === master.id);
        if (idx >= 0) items[idx] = item as unknown as Record<string, unknown>;
        else items.push(item as unknown as Record<string, unknown>);
        await this.prisma.kontrakManajemen.update({
          where: { id: existingKm.id },
          data: { kpiItems: items as object, ...(a.holder ? { holder: a.holder } : {}) },
        });
        docsAffected++;
      }
    }
    return { docsAffected };
  }

  private async removeFannedItems(masterId: string, kmType: string): Promise<number> {
    const draftKms = await this.prisma.kontrakManajemen.findMany({ where: { kmType, status: 'draft' } });
    let cleaned = 0;
    for (const km of draftKms) {
      const items = (Array.isArray(km.kpiItems) ? km.kpiItems : []) as Record<string, unknown>[];
      if (items.some((it) => it['masterKpiId'] === masterId)) {
        const filtered = items.filter((it) => it['masterKpiId'] !== masterId);
        await this.prisma.kontrakManajemen.update({ where: { id: km.id }, data: { kpiItems: filtered as object } });
        cleaned++;
      }
    }
    return cleaned;
  }

  // Helper konstanta role (dipakai controller bila perlu guard tambahan).
  static isAuthor(user: User): boolean {
    return user.unit === 'KP' && (user.role === Role.STAFF || user.role === Role.GM);
  }
}
