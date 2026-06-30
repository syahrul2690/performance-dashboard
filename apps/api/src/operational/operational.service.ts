import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
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

  async refreshFromRealisasi(periodId: string): Promise<void> {
    const num = (v: unknown): number => {
      if (v == null) return 0;
      const n = parseFloat(String(v).replace(',', '.').replace(/[^0-9.-]/g, ''));
      return Number.isFinite(n) ? n : 0;
    };
    const r2 = (n: number) => Math.round(n * 100) / 100;
    const UNIT_NAMES: Record<string, string> = {
      KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
      UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
    };

    // KP records only for kpis/kepatuhan
    const kpRecords = await this.prisma.inputRealisasi.findMany({
      where: { periodId, status: 'approved', unitCode: 'KP' },
    });
    if (kpRecords.length === 0) return;

    const allItems = kpRecords.flatMap(r =>
      Object.values((r.values ?? {}) as Record<string, Record<string, unknown>>)
        .map(it => ({ it, bidang: r.bidang }))
    );
    const regularItems = allItems.filter(({ it }) => num(it['bobot']) > 0);
    const pengurangItems = allItems.filter(({ it }) => num(it['bobot']) < 0);

    // Get existing snapshot as base
    const existing = await this.prisma.operationalSnapshot.findUnique({ where: { periodId } });
    let base: Record<string, unknown>;
    if (existing?.data) {
      base = existing.data as Record<string, unknown>;
    } else {
      const active = await this.prisma.period.findFirst({ where: { isActive: true } });
      const fallback = active && active.id !== periodId
        ? await this.prisma.operationalSnapshot.findUnique({ where: { periodId: active.id } })
        : null;
      base = (fallback?.data ?? {}) as Record<string, unknown>;
    }
    const existingKpis = (base.kpis ?? []) as Record<string, unknown>[];

    // Build kpis from positive-bobot items
    let kpiNo = 1;
    const kpis = regularItems.map(({ it, bidang }) => {
      const name = String(it['indikator'] ?? '');
      const nameLow = name.toLowerCase();
      const existingKpi = existingKpis.find(k => {
        const kname = String(k['name'] ?? '').toLowerCase();
        return kname.length > 8 && nameLow.slice(0, 20).includes(kname.slice(0, 12));
      });
      const bobot = num(it['bobot']);
      const target = num(it['target2'] ?? it['target']);
      const actual = num(it['realisasi']);
      const satuan = String(it['satuan'] ?? '');
      const isInverse = satuan.toLowerCase() === 'hari kerja';
      const achievement = target > 0 && actual > 0
        ? (isInverse ? Math.min((target / actual) * 100, 110) : Math.min((actual / target) * 100, 110))
        : 0;
      const nilai = r2((achievement / 100) * bobot);
      const prevSpark = (existingKpi?.['sparkline'] ?? Array(12).fill(0)) as number[];
      const no = kpiNo++;
      return {
        id:          existingKpi?.['id'] ?? `k${no}`,
        no,
        name,
        category:    existingKpi?.['category'] ?? (bobot >= 7 ? 'KPI' : 'PI'),
        unit:        satuan,
        target:      r2(target),
        actual:      r2(actual),
        achievement: r2(achievement),
        status:      achievement >= 100 ? 'success' : achievement >= 90 ? 'warning' : 'danger',
        isInverse,
        polaritas:   isInverse ? 'LB' : 'HB',
        bobot,
        nilai,
        bu:          bidang,
        owner:       existingKpi?.['owner'] ?? bidang,
        basis:       existingKpi?.['basis'] ?? null,
        sparkline:   [...prevSpark.slice(-11), r2(actual)],
        commentary:  existingKpi?.['commentary'] ?? '',
        rootCause:   existingKpi?.['rootCause'] ?? '',
        actionPlan:  existingKpi?.['actionPlan'] ?? '',
      };
    });

    // Build kepatuhan from negative-bobot items
    const existingKepatuhan = (base.kepatuhan ?? []) as Record<string, unknown>[];
    const SUB = 'abcdefghij';
    const kepatuhan = pengurangItems.map(({ it }, idx) => {
      const fullName = String(it['indikator'] ?? '');
      const name = fullName.replace(/^Pengurang\s*[-–:]\s*/i, '');
      const applied = num(it['realisasi']);
      return {
        no:         existingKepatuhan[idx]?.['no'] ?? `12${SUB[idx] ?? idx}`,
        name,
        maxPenalty: num(it['bobot']),
        applied:    r2(applied),
        target:     existingKepatuhan[idx]?.['target'] ?? String(it['target'] ?? '—'),
        status:     applied === 0 ? 'success' : 'danger',
      };
    });

    // Summary totals
    const kpiGroup = kpis.filter(k => k.category === 'KPI');
    const piGroup  = kpis.filter(k => k.category === 'PI');
    const kpiBobot = r2(kpiGroup.reduce((s, k) => s + k.bobot, 0));
    const kpiNilai = r2(kpiGroup.reduce((s, k) => s + k.nilai, 0));
    const piBobot  = r2(piGroup.reduce((s, k) => s + k.bobot, 0));
    const piNilai  = r2(piGroup.reduce((s, k) => s + k.nilai, 0));
    const kepatuhanPenalty = r2(kepatuhan.reduce((s, k) => s + k.applied, 0));
    const totalNilai = r2(kpiNilai + piNilai + kepatuhanPenalty);

    // buComparison from all approved units
    const allRecords = await this.prisma.inputRealisasi.findMany({
      where: { periodId, status: 'approved' },
    });
    const byUnit: Record<string, typeof allRecords> = {};
    for (const r of allRecords) (byUnit[r.unitCode] ??= []).push(r);
    const unitScoreMap: Record<string, number> = {};
    for (const [code, records] of Object.entries(byUnit)) {
      let total = 0;
      for (const r of records) {
        for (const it of Object.values((r.values ?? {}) as Record<string, Record<string, unknown>>)) {
          const bobot = num(it['bobot']);
          const target = num(it['target2'] ?? it['target']);
          const actual = num(it['realisasi']);
          const satuan = String(it['satuan'] ?? '').toLowerCase();
          if (bobot > 0 && target > 0 && actual > 0) {
            const inv = satuan === 'hari kerja';
            const capaian = inv ? Math.min((target / actual) * 100, 110) : Math.min((actual / target) * 100, 110);
            total += (capaian / 100) * bobot;
          }
        }
      }
      unitScoreMap[code] = r2(total);
    }
    const existingBuComp = (base.buComparison ?? {}) as Record<string, unknown>;
    const buComparison = {
      ...existingBuComp,
      rows: Object.entries(unitScoreMap)
        .map(([code, score]) => ({ bu: UNIT_NAMES[code] ?? code, code, score }))
        .sort((a, b) => b.score - a.score),
    };

    const newData: Record<string, unknown> = {
      ...base,
      kpis,
      kepatuhan,
      summary: {
        kpiBobot, kpiNilai, piBobot, piNilai,
        totalBobot: r2(kpiBobot + piBobot),
        totalNilai, kepatuhanPenalty,
        status: totalNilai >= 100 ? 'Baik' : totalNilai >= 90 ? 'Hati-hati' : 'Perhatian',
      },
      buComparison,
    };

    await this.prisma.operationalSnapshot.upsert({
      where:  { periodId },
      update: { data: newData as unknown as Prisma.InputJsonValue },
      create: { periodId, data: newData as unknown as Prisma.InputJsonValue },
    });
    await this.cache.del(`operational:${periodId}`);
    await this.cache.del('operational:active');
  }
}
