import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

const UNIT_NAMES: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
  UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};

const num = (v: unknown): number => {
  if (v == null) return 0;
  const n = parseFloat(String(v).replace(',', '.').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const round2 = (n: number) => Math.round(n * 100) / 100;

interface KpiRekap {
  indikator: string;
  satuan: string;
  bobot: number;
  target: number;
  realisasi: number;
  capaian: number; // %
  nilai: number;   // capaian/100 * bobot
}

interface UnitRekap {
  code: string;
  name: string;
  score: number;       // total nilai (≈ skor 0..>100 bila Σbobot=100)
  totalBobot: number;
  status: string;      // Baik | Hati-hati | Tertinggal
  submitter: string;
  reviewer: string | null;
  kpis: KpiRekap[];
}

@Injectable()
export class KinerjaService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  // Periode terbaru (by yearMonth) yang memiliki realisasi DISETUJUI.
  // Dipakai dashboard sebagai default agar realisasi terbaru langsung terlihat.
  async getLatestPeriodWithData() {
    const approved = await this.prisma.inputRealisasi.findMany({
      where: { status: 'approved' },
      select: { periodId: true },
    });
    if (approved.length === 0) return null;
    const ids = [...new Set(approved.map((a) => a.periodId))];
    const periods = await this.prisma.period.findMany({
      where: { id: { in: ids } },
      orderBy: { yearMonth: 'desc' },
    });
    return periods[0] ?? null;
  }

  // Rekap kinerja dari REALISASI yang sudah DISETUJUI final (status approved).
  // mode: 'Bulan' = periode terpilih saja; 'Semester' = rata-rata Jan–Jun / Jul–Des;
  //       'Tahun' = rata-rata seluruh bulan tahun berjalan. Agregasi = rata-rata realisasi
  //       bulanan per indikator, lalu dijumlahkan menjadi skor unit.
  async getRekap(periodId?: string, mode: 'Bulan' | 'Semester' | 'Tahun' = 'Bulan') {
    const cacheKey = `kinerja:${periodId || 'active'}:${mode}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const period = periodId
      ? await this.prisma.period.findUnique({ where: { id: periodId } })
      : await this.prisma.period.findFirst({ where: { isActive: true } });

    if (!period) {
      return { period: null, mode, hasData: false, overall: null, units: [] as UnitRekap[] };
    }

    // Tentukan kumpulan periode dalam cakupan mode.
    const year = period.yearMonth.slice(0, 4);
    const month = parseInt(period.yearMonth.slice(5, 7), 10);
    let scopePeriodIds: string[] = [period.id];
    if (mode === 'Tahun' || mode === 'Semester') {
      const yearPeriods = await this.prisma.period.findMany({
        where: { yearMonth: { startsWith: `${year}-` } },
        select: { id: true, yearMonth: true },
      });
      const inScope = yearPeriods.filter((p) => {
        if (mode === 'Tahun') return true;
        const m = parseInt(p.yearMonth.slice(5, 7), 10);
        return month <= 6 ? m <= 6 : m >= 7; // semester sesuai bulan terpilih
      });
      scopePeriodIds = inScope.map((p) => p.id);
    }

    const realisasi = await this.prisma.inputRealisasi.findMany({
      where: { periodId: { in: scopePeriodIds }, status: 'approved' },
      orderBy: { unitCode: 'asc' },
    });

    // Kelompokkan per unit (gabung semua bidang & semua bulan dalam cakupan).
    const byUnit: Record<string, typeof realisasi> = {};
    for (const r of realisasi) (byUnit[r.unitCode] ||= []).push(r);

    const units: UnitRekap[] = Object.entries(byUnit).map(([code, records]) => {
      // Kumpulkan realisasi bulanan per indikator (key: bidang|indikator).
      const kpiMap = new Map<string, { indikator: string; satuan: string; bobot: number; target: number; reals: number[] }>();
      let lastSubmitter = '';
      let lastReviewer: string | null = null;
      for (const r of records) {
        lastSubmitter = r.submitter;
        lastReviewer = r.reviewer ?? lastReviewer;
        const entries = Object.values((r.values ?? {}) as Record<string, Record<string, unknown>>);
        for (const it of entries) {
          const indikator = String(it.indikator ?? '—');
          const key = `${r.bidang}|${indikator}`;
          const e = kpiMap.get(key) ?? { indikator, satuan: String(it.satuan ?? ''), bobot: num(it.bobot), target: num(it.target), reals: [] };
          e.reals.push(num(it.realisasi));
          kpiMap.set(key, e);
        }
      }
      let totalBobot = 0;
      let totalNilai = 0;
      const kpis: KpiRekap[] = [...kpiMap.values()].map((e) => {
        const avgReal = e.reals.length ? e.reals.reduce((a, b) => a + b, 0) / e.reals.length : 0;
        const capaian = e.target > 0 ? (avgReal / e.target) * 100 : 0;
        const nilai = (capaian / 100) * e.bobot;
        totalBobot += e.bobot;
        totalNilai += nilai;
        return {
          indikator: e.indikator,
          satuan: e.satuan,
          bobot: round2(e.bobot),
          target: round2(e.target),
          realisasi: round2(avgReal),
          capaian: round2(capaian),
          nilai: round2(nilai),
        };
      });
      const score = round2(totalNilai);
      const status = score >= 100 ? 'Baik' : score >= 90 ? 'Hati-hati' : 'Tertinggal';
      return {
        code,
        name: UNIT_NAMES[code] ?? code,
        score,
        totalBobot: round2(totalBobot),
        status,
        submitter: lastSubmitter,
        reviewer: lastReviewer,
        kpis,
      };
    });

    const overall = units.length
      ? round2(units.reduce((s, u) => s + u.score, 0) / units.length)
      : null;

    const result = {
      period,
      mode,
      monthsIncluded: scopePeriodIds.length,
      hasData: units.length > 0,
      overall,
      units: units.sort((a, b) => b.score - a.score),
    };
    await this.cache.set(cacheKey, result);
    return result;
  }
}
