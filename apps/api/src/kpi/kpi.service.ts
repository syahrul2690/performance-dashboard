import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

let _cache: Record<string, unknown> | null = null;

function loadKpiData() {
  if (_cache) return _cache;
  const p = path.join(__dirname, '../../prisma/seed-data.json');
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  _cache = raw.KPI_DEEPDIVE_DATA as Record<string, unknown>;
  return _cache;
}

@Injectable()
export class KpiService {
  getDeepDive(kpiId: string) {
    const data = loadKpiData();
    const entry = data[kpiId];
    if (!entry) throw new NotFoundException(`No deep-dive data for KPI: ${kpiId}`);
    return entry;
  }

  listKpiIds() {
    return Object.keys(loadKpiData());
  }
}
