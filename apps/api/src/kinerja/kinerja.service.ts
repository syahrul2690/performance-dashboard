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

  // Rekap kinerja dari REALISASI yang sudah DISETUJUI final (status approved).
  async getRekap(periodId?: string) {
    const cacheKey = `kinerja:${periodId || 'active'}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const period = periodId
      ? await this.prisma.period.findUnique({ where: { id: periodId } })
      : await this.prisma.period.findFirst({ where: { isActive: true } });

    if (!period) {
      return { period: null, hasData: false, overall: null, units: [] as UnitRekap[] };
    }

    const realisasi = await this.prisma.inputRealisasi.findMany({
      where: { periodId: period.id, status: 'approved' },
      orderBy: { unitCode: 'asc' },
    });

    const units: UnitRekap[] = realisasi.map((r) => {
      const entries = Object.values((r.values ?? {}) as Record<string, Record<string, unknown>>);
      let totalBobot = 0;
      let totalNilai = 0;
      const kpis: KpiRekap[] = entries.map((it) => {
        const target = num(it.target);
        const real = num(it.realisasi);
        const bobot = num(it.bobot);
        const capaian = target > 0 ? (real / target) * 100 : 0;
        const nilai = (capaian / 100) * bobot;
        totalBobot += bobot;
        totalNilai += nilai;
        return {
          indikator: String(it.indikator ?? '—'),
          satuan: String(it.satuan ?? ''),
          bobot: round2(bobot),
          target: round2(target),
          realisasi: round2(real),
          capaian: round2(capaian),
          nilai: round2(nilai),
        };
      });
      const score = round2(totalNilai);
      const status = score >= 100 ? 'Baik' : score >= 90 ? 'Hati-hati' : 'Tertinggal';
      return {
        code: r.unitCode,
        name: UNIT_NAMES[r.unitCode] ?? r.unitCode,
        score,
        totalBobot: round2(totalBobot),
        status,
        submitter: r.submitter,
        reviewer: r.reviewer ?? null,
        kpis,
      };
    });

    const overall = units.length
      ? round2(units.reduce((s, u) => s + u.score, 0) / units.length)
      : null;

    const result = {
      period,
      hasData: units.length > 0,
      overall,
      units: units.sort((a, b) => b.score - a.score),
    };
    await this.cache.set(cacheKey, result);
    return result;
  }
}
