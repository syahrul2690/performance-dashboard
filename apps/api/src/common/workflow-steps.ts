import { Role } from '@prisma/client';

export const UNIT_NAMES: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
  UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};
export const uname = (u: string) => UNIT_NAMES[u] ?? u;

export const RPC_BIDANG = 'Perencanaan & Project Control';
export const OMP_BIDANG = 'Operasi Manajemen Proyek';

// Langkah alur (urut). Tiap langkah dipegang oleh peran + lingkup (bidang/unit).
export interface Step {
  role: Role;
  bidang?: string;
  unit?: string;
  label: string;
}

// Mesin alur. Indeks 0 = PIC/Staff penyusun; 1..n = jenjang review hingga SM RPC.
// Persetujuan GM dilakukan terpisah pada level BUNDLE.
//   mode 'realisasi': UPMK punya segmen internal (Staff/ASMAN/MUP) → bidang KI → RPC.
//   mode 'km': KM disusun Kantor Induk → selalu rantai bidang KI (tanpa segmen internal UPMK).
export function buildSteps(unitCode: string, bidang: string, mode: 'realisasi' | 'km' = 'realisasi'): Step[] {
  const isUPMK = mode === 'realisasi' && unitCode !== 'KP';
  const steps: Step[] = [];

  if (isUPMK) {
    steps.push({ role: Role.STAFF, unit: unitCode, label: `Staff Kinerja ${uname(unitCode)}` });
    steps.push({ role: Role.ASMAN, unit: unitCode, label: `ASMAN ${uname(unitCode)}` });
    steps.push({ role: Role.MANAJER, unit: unitCode, label: `Manajer (MUP) ${uname(unitCode)}` });
    if (bidang === OMP_BIDANG) steps.push({ role: Role.ASMAN, bidang, unit: 'KP', label: `ASMAN ${bidang}` });
    steps.push({ role: Role.MANAJER, bidang, unit: 'KP', label: `Manajer ${bidang}` });
    steps.push({ role: Role.SRMANAJER, bidang, unit: 'KP', label: `SM ${bidang}` });
  } else {
    steps.push({ role: Role.STAFF, bidang, unit: 'KP', label: `Staff Kinerja ${bidang}` });
    if (bidang === OMP_BIDANG) steps.push({ role: Role.ASMAN, bidang, unit: 'KP', label: `ASMAN ${bidang}` });
    steps.push({ role: Role.MANAJER, bidang, unit: 'KP', label: `Manajer ${bidang}` });
    steps.push({ role: Role.SRMANAJER, bidang, unit: 'KP', label: `SM ${bidang}` });
  }

  // Segmen konsolidasi RPC (kecuali dokumen bidang RPC sendiri — agar tidak dobel).
  const isOwnRpc = !isUPMK && bidang === RPC_BIDANG;
  if (!isOwnRpc) {
    steps.push({ role: Role.STAFF, bidang: RPC_BIDANG, unit: 'KP', label: 'Staff Kinerja Perencanaan (RPC)' });
    steps.push({ role: Role.MANAJER, bidang: RPC_BIDANG, unit: 'KP', label: 'Manajer Perencanaan' });
    steps.push({ role: Role.SRMANAJER, bidang: RPC_BIDANG, unit: 'KP', label: 'SM Perencanaan & Project Control' });
  }
  return steps;
}

export function stepMatches(step: Step | undefined, user: { role: Role; bidang?: string | null; unit?: string | null }): boolean {
  if (!step) return false;
  if (user.role !== step.role) return false;
  if (step.bidang && user.bidang !== step.bidang) return false;
  if (step.unit && user.unit !== step.unit) return false;
  return true;
}

const SLA_DAYS_PER_STEP = 2;
export function slaRemainingDays(r: { submittedAt: Date }): number {
  const deadline = new Date(r.submittedAt).getTime() + SLA_DAYS_PER_STEP * 86400000;
  return Math.ceil((deadline - Date.now()) / 86400000);
}
