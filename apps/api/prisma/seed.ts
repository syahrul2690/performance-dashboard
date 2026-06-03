import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf8'),
);

const DATA = seedData.DATA as Record<string, unknown>;
const ROLES = seedData.ROLES as Record<string, { name: string; unit: string; email?: string }>;

const extra = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seed-extra.json'), 'utf8'),
) as {
  procBiz: object;
  organisasi: object;
  gcgEsg: object;
  peta: object;
  roleVariants: Array<{ code: string; label: string; tier: string; scope: string }>;
};

const ROLE_MAP: Record<string, Role> = {
  staff: Role.STAFF,
  asman: Role.ASMAN,
  manajer: Role.MANAJER,
  srmanajer: Role.SRMANAJER,
  gm: Role.GM,
};

// Varian peran representatif untuk tiap user demo
const REP_VARIANT: Record<string, string> = {
  staff: 'staff_general',
  asman: 'asman_generic',
  manajer: 'man_project_control',
  srmanajer: 'sm_pc',
  gm: 'gm_pusmanpro',
};

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Pusmanpro@2026';

async function main() {
  console.log('Seeding database…');

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Role variants catalog — taksonomi peran selaras prototipe
  for (const rv of extra.roleVariants) {
    await prisma.roleVariant.upsert({
      where: { code: rv.code },
      update: { label: rv.label, tier: ROLE_MAP[rv.tier], scope: rv.scope },
      create: { code: rv.code, label: rv.label, tier: ROLE_MAP[rv.tier], scope: rv.scope },
    });
  }
  console.log('  role_variants:', extra.roleVariants.length);

  // Users — one per role from ROLES constant
  for (const [roleKey, info] of Object.entries(ROLES)) {
    const email = info.email || `${roleKey}@pusmanpro.pln.co.id`;
    const variant = await prisma.roleVariant.findUnique({
      where: { code: REP_VARIANT[roleKey] },
    });
    await prisma.user.upsert({
      where: { email },
      update: { roleVariantId: variant?.id ?? null },
      create: {
        email,
        name: info.name,
        role: ROLE_MAP[roleKey],
        unit: info.unit || 'KP',
        passwordHash: hash,
        isActive: true,
        roleVariantId: variant?.id ?? null,
        prefs: { create: {} },
      },
    });
    console.log('  user:', email, ROLE_MAP[roleKey]);
  }

  // Period — Februari 2026 (active)
  const period = await prisma.period.upsert({
    where: { yearMonth: '2026-02' },
    update: { isActive: true },
    create: { yearMonth: '2026-02', label: 'Februari 2026', isActive: true },
  });
  console.log('  period:', period.label);

  // Domain snapshots — store the exact prototype DATA sections as JSON blobs
  const meta = { periodId: period.id };

  await prisma.executiveSnapshot.upsert({
    where: { periodId: period.id },
    update: { data: DATA.executive as object },
    create: { ...meta, data: DATA.executive as object },
  });

  await prisma.financialSnapshot.upsert({
    where: { periodId: period.id },
    update: { data: DATA.financial as object },
    create: { ...meta, data: DATA.financial as object },
  });

  await prisma.operationalSnapshot.upsert({
    where: { periodId: period.id },
    update: { data: DATA.operational as object },
    create: { ...meta, data: DATA.operational as object },
  });

  await prisma.strategicSnapshot.upsert({
    where: { periodId: period.id },
    update: { data: DATA.strategic as object },
    create: { ...meta, data: DATA.strategic as object },
  });

  await prisma.humanCapitalSnapshot.upsert({
    where: { periodId: period.id },
    update: { data: DATA.humanCapital as object },
    create: { ...meta, data: DATA.humanCapital as object },
  });

  await prisma.riskSnapshot.upsert({
    where: { periodId: period.id },
    update: { data: DATA.risk as object },
    create: { ...meta, data: DATA.risk as object },
  });

  // New sections ported from prototype
  await prisma.prosesBisnisSnapshot.upsert({
    where: { periodId: period.id },
    update: { data: extra.procBiz },
    create: { ...meta, data: extra.procBiz },
  });

  await prisma.organisasiSnapshot.upsert({
    where: { periodId: period.id },
    update: { data: extra.organisasi },
    create: { ...meta, data: extra.organisasi },
  });

  await prisma.gcgEsgSnapshot.upsert({
    where: { periodId: period.id },
    update: { data: extra.gcgEsg },
    create: { ...meta, data: extra.gcgEsg },
  });

  await prisma.petaSnapshot.upsert({
    where: { periodId: period.id },
    update: { data: extra.peta },
    create: { ...meta, data: extra.peta },
  });

  // Reports (approvals)
  const STATUS_MAP: Record<string, 'DRAFT' | 'IN_REVIEW' | 'NEEDS_REVISION' | 'APPROVED'> = {
    draft: 'DRAFT',
    in_review: 'IN_REVIEW',
    needs_revision: 'NEEDS_REVISION',
    approved: 'APPROVED',
    // Already uppercase passthrough
    DRAFT: 'DRAFT',
    IN_REVIEW: 'IN_REVIEW',
    NEEDS_REVISION: 'NEEDS_REVISION',
    APPROVED: 'APPROVED',
  };

  const approvals = DATA.approvals as { reports: Array<Record<string, unknown>> };
  for (const r of approvals.reports) {
    const unit = r.unit as string;
    const rawStatus = (r.status as string || 'draft').toLowerCase().replace(/-/g, '_');
    const status = STATUS_MAP[rawStatus] ?? 'DRAFT';
    const nextApproverRaw = r.nextApprover;
    const nextApprover = nextApproverRaw == null
      ? null
      : typeof nextApproverRaw === 'string'
        ? nextApproverRaw
        : ((nextApproverRaw as { name?: string }).name ?? null);

    await prisma.report.upsert({
      where: { unit_periodId: { unit, periodId: period.id } },
      update: { currentStage: r.currentStage as number, status, nextApprover, history: (r.history as object) || [] },
      create: { unit, periodId: period.id, currentStage: r.currentStage as number, status, nextApprover, history: (r.history as object) || [] },
    });
  }
  console.log('  reports:', approvals.reports.length);

  // KM Documents — from workflowKM.pendingApprovals
  const wkm = DATA.workflowKM as { pendingApprovals: Array<Record<string, unknown>> };
  const TIPE_MAP: Record<string, 'WF1' | 'WF1B' | 'WF2' | 'WF3'> = {
    'WF-1': 'WF1', 'WF-1b': 'WF1B', 'WF-2': 'WF2', 'WF-3': 'WF3',
    WF1: 'WF1', WF1B: 'WF1B', WF2: 'WF2', WF3: 'WF3',
  };
  let kmDocs = 0;
  for (const doc of (wkm.pendingApprovals ?? [])) {
    const docId = doc.docId as string;
    if (!docId) continue;
    const rawTipe = (doc.tipe as string || 'WF-1');
    const tipe = TIPE_MAP[rawTipe] ?? 'WF1';
    const slaRaw = doc.slaRemain as string | number | null | undefined;
    const slaRemain = typeof slaRaw === 'number' ? slaRaw : null;
    await prisma.kMDocument.upsert({
      where: { docId },
      update: {},
      create: {
        docId,
        tipe,
        bidangUnit: doc.bidangUnit as string || '',
        holder: doc.holder as string || '',
        status: 'IN_REVIEW_C1',
        deadline: doc.deadline ? new Date(doc.deadline as string) : null,
        slaRemain,
      },
    });
    kmDocs++;
  }
  console.log('  km_documents:', kmDocs);

  // Kontrak Manajemen — sample entries for demo
  const sampleKontrak = [
    {
      unitCode: 'KP',
      bidang: 'Bidang Teknik',
      holder: 'Ahmad Teknik',
      kpiItems: [
        { indikator: 'Progress Konstruksi Jaringan', target: '95', satuan: '%', bobot: '30' },
        { indikator: 'Availability Sistem', target: '99.5', satuan: '%', bobot: '25' },
        { indikator: 'Rasio Pemeliharaan', target: '1.2', satuan: '%', bobot: '20' },
      ],
      status: 'submitted',
      submitter: 'Staff Officer',
    },
    {
      unitCode: 'KP',
      bidang: 'Bidang Keuangan',
      holder: 'Siti Keuangan',
      kpiItems: [
        { indikator: 'Efisiensi Biaya Operasional', target: '85', satuan: '%', bobot: '35' },
        { indikator: 'Realisasi Anggaran', target: '90', satuan: '%', bobot: '30' },
      ],
      status: 'draft',
      submitter: 'Staff Officer',
    },
  ];

  const staffUser = await prisma.user.findFirst({ where: { role: Role.STAFF } });
  let kmCount = 0;
  for (const k of sampleKontrak) {
    // Idempotent: lewati bila kontrak dengan unit+bidang+periode yang sama sudah ada.
    const existing = await prisma.kontrakManajemen.findFirst({
      where: { periodId: period.id, unitCode: k.unitCode, bidang: k.bidang },
    });
    if (existing) continue;
    await prisma.kontrakManajemen.create({
      data: {
        periodId: period.id,
        unitCode: k.unitCode,
        bidang: k.bidang,
        holder: k.holder,
        kpiItems: k.kpiItems as object,
        status: k.status,
        currentStage: k.status === 'submitted' ? 2 : 1, // submitted → menunggu Asman
        submitter: k.submitter,
        submitterId: staffUser?.id ?? null,
      },
    });
    kmCount++;
  }
  console.log('  kontrak_manajemen:', kmCount);

  // Seed a few global notifications
  const gmUser = await prisma.user.findFirst({ where: { role: Role.GM } });
  if (gmUser) {
    const existing = await prisma.notification.count({ where: { userId: gmUser.id } });
    if (existing === 0) {
      await prisma.notification.createMany({
        data: [
          { userId: gmUser.id, type: 'approval', title: 'Laporan Siap Review', msg: 'UPMK I menunggu persetujuan GM', route: '/approvals', unread: true },
          { userId: gmUser.id, type: 'alert', title: 'KPI Di Bawah Target', msg: 'Progress konstruksi UPMK III 88.4%', route: '/operational', unread: true },
        ],
      });
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
