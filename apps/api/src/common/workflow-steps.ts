import { Role, Prisma } from '@prisma/client';

export const UNIT_NAMES: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
  UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};
export const uname = (u: string) => UNIT_NAMES[u] ?? u;

export const RPC_BIDANG = 'Perencanaan & Project Control';
export const OMP_BIDANG = 'Operasi Manajemen Proyek';
export const QAQC_BIDANG = 'QA/QC';
export const KKU_BIDANG = 'Keuangan, Komunikasi & Umum';

// Langkah alur. Langkah ASMAN/Manajer/SM dicocokkan ke JABATAN spesifik (roleVariant.code);
// langkah Staff (PIC) dicocokkan ke (role + bidang/unit).
export interface Step {
  role: Role;
  variant?: string; // kode jabatan (roleVariant) — pembeda sub-posisi dalam satu bidang
  bidang?: string;
  unit?: string;
  label: string;
}

// User minimal untuk pencocokan langkah (req.user menyertakan roleVariant).
export type WorkflowUser = { role: Role; bidang?: string | null; unit?: string | null; roleVariant?: { code: string } | null };

// Rantai sub-jabatan dalam-bidang (sesudah Staff PIC, sebelum konsolidasi RPC).
const KI_CHAIN: Record<string, Step[]> = {
  [OMP_BIDANG]: [
    { role: Role.ASMAN, variant: 'asman_elektromekanik', label: 'ASMAN Elektromekanik' },
    { role: Role.ASMAN, variant: 'asman_jaringan', label: 'ASMAN Jaringan' },
    { role: Role.MANAJER, variant: 'man_operasi_pembangkit', label: 'Manajer Operasi Proyek Pembangkit' },
    { role: Role.MANAJER, variant: 'man_operasi_jaringan', label: 'Manajer Operasi Proyek Jaringan' },
    { role: Role.SRMANAJER, variant: 'sm_omp', label: 'SM Operasi Manajemen Proyek' },
  ],
  [QAQC_BIDANG]: [
    { role: Role.MANAJER, variant: 'man_qaqc_pembangkit', label: 'Manajer QA/QC Pembangkit' },
    { role: Role.MANAJER, variant: 'man_qaqc_jaringan', label: 'Manajer QA/QC Jaringan' },
    { role: Role.SRMANAJER, variant: 'sm_qaqc', label: 'SM QA/QC' },
  ],
  [RPC_BIDANG]: [
    { role: Role.MANAJER, variant: 'man_project_control', label: 'Manajer Project Control' },
    { role: Role.MANAJER, variant: 'man_perencanaan', label: 'Manajer Perencanaan' },
    { role: Role.SRMANAJER, variant: 'sm_pc', label: 'SM Perencanaan & Project Control' },
  ],
  [KKU_BIDANG]: [
    { role: Role.MANAJER, variant: 'man_keuangan', label: 'Manajer Keuangan' },
    { role: Role.MANAJER, variant: 'man_akuntansi', label: 'Manajer Akuntansi' },
    { role: Role.MANAJER, variant: 'man_aset_properti', label: 'Manajer Aset & Properti' },
    { role: Role.SRMANAJER, variant: 'sm_kku', label: 'SM Keuangan, Komunikasi & Umum' },
  ],
};

// Konsolidasi RPC (ringkas) untuk dokumen bidang LAIN: Staff RPC → MAN Perencanaan → SM RPC.
const RPC_TAIL: Step[] = [
  { role: Role.STAFF, bidang: RPC_BIDANG, unit: 'KP', label: 'Staff Kinerja Perencanaan (RPC)' },
  { role: Role.MANAJER, variant: 'man_perencanaan', bidang: RPC_BIDANG, unit: 'KP', label: 'Manajer Perencanaan (RPC)' },
  { role: Role.SRMANAJER, variant: 'sm_pc', bidang: RPC_BIDANG, unit: 'KP', label: 'SM Perencanaan & Project Control' },
];

// Mesin alur. Indeks 0 = PIC/Staff penyusun; 1..n = jenjang review hingga SM RPC.
//   mode 'realisasi': UPMK punya segmen internal (Staff/ASMAN/MUP) → rantai bidang KI penuh → RPC.
//   mode 'km': KM disusun Kantor Induk → selalu rantai bidang KI.
export function buildSteps(unitCode: string, bidang: string, mode: 'realisasi' | 'km' = 'realisasi'): Step[] {
  const isUPMK = mode === 'realisasi' && unitCode !== 'KP';
  let chain = (KI_CHAIN[bidang] ?? []).map((s) => ({ ...s, bidang, unit: 'KP' }));
  // Dokumen UPMK ber-bidang RPC: cukup Manajer Perencanaan (lewati Manajer Project Control).
  if (bidang === RPC_BIDANG && unitCode !== 'KP') {
    chain = chain.filter((s) => s.variant !== 'man_project_control');
  }
  const steps: Step[] = [];

  if (isUPMK) {
    steps.push({ role: Role.STAFF, unit: unitCode, label: `Staff Kinerja ${uname(unitCode)}` });
    steps.push({ role: Role.ASMAN, unit: unitCode, label: `ASMAN ${uname(unitCode)}` });
    steps.push({ role: Role.MANAJER, unit: unitCode, label: `Manajer (MUP) ${uname(unitCode)}` });
    steps.push(...chain); // rantai bidang KI penuh
  } else {
    steps.push({ role: Role.STAFF, bidang, unit: 'KP', label: `Staff Kinerja ${bidang}` });
    steps.push(...chain);
  }

  // Konsolidasi RPC — dilewati bila dokumen sudah bidang RPC (rantai sudah berakhir di SM RPC).
  if (bidang !== RPC_BIDANG) steps.push(...RPC_TAIL);
  return steps;
}

export function stepMatches(step: Step | undefined, user: WorkflowUser): boolean {
  if (!step) return false;
  if (step.variant) return user.roleVariant?.code === step.variant; // pencocokan by jabatan
  if (user.role !== step.role) return false;
  if (step.bidang && user.bidang !== step.bidang) return false;
  if (step.unit && user.unit !== step.unit) return false;
  return true;
}

// Klausa Prisma untuk mencari penerima notifikasi langkah.
export function stepRecipientWhere(step: Step): Prisma.UserWhereInput {
  if (step.variant) return { isActive: true, roleVariant: { code: step.variant } };
  return {
    role: step.role, isActive: true,
    ...(step.bidang ? { bidang: step.bidang } : {}),
    ...(step.unit ? { unit: step.unit } : {}),
  };
}

const SLA_DAYS_PER_STEP = 2;
export function slaRemainingDays(r: { submittedAt: Date }): number {
  const deadline = new Date(r.submittedAt).getTime() + SLA_DAYS_PER_STEP * 86400000;
  return Math.ceil((deadline - Date.now()) / 86400000);
}
