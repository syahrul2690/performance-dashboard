import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import * as XLSX from 'xlsx';

const UNIT_NAMES: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
  UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};

// Jenjang persetujuan usulan KM: Staff(1) → Asman(2) → Manajer(3) → Sr.Manajer(4) → GM(5, final)
const ROLE_TO_STAGE: Record<Role, number> = {
  STAFF: 1, ASMAN: 2, MANAJER: 3, SRMANAJER: 4, GM: 5,
};
const STAGE_TO_ROLE: Record<number, Role> = {
  2: Role.ASMAN, 3: Role.MANAJER, 4: Role.SRMANAJER, 5: Role.GM,
};
const STAGE_LABEL: Record<number, string> = {
  1: 'Staff', 2: 'Asisten Manajer', 3: 'Manajer Bidang', 4: 'Senior Manajer', 5: 'General Manager',
};
const FINAL_STAGE = 5; // General Manager = persetujuan akhir

@Injectable()
export class InputKontrakService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getList(unitCode?: string, periodId?: string) {
    return this.prisma.kontrakManajemen.findMany({
      where: {
        ...(unitCode ? { unitCode } : {}),
        ...(periodId ? { periodId } : {}),
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getById(id: string) {
    return this.prisma.kontrakManajemen.findUnique({ where: { id } });
  }

  // Registri KM yang sudah DISETUJUI penuh (final oleh GM). Untuk arsip (Opsi A)
  // dan acuan Input Realisasi per unit (Opsi B).
  async getApproved(unitCode?: string, periodId?: string) {
    return this.prisma.kontrakManajemen.findMany({
      where: {
        status: 'approved',
        ...(unitCode ? { unitCode } : {}),
        ...(periodId ? { periodId } : {}),
      },
      orderBy: [{ unitCode: 'asc' }, { reviewedAt: 'desc' }],
    });
  }

  // Save: create a NEW kontrak, or update an existing one when `id` is given.
  // Tidak lagi menimpa kontrak lain pada unit/periode yang sama.
  async save(
    user: User,
    id: string | undefined,
    unitCode: string,
    bidang: string,
    holder: string,
    kpiItems: object,
  ) {
    const period = await this.prisma.period.findFirst({ where: { isActive: true } });
    if (!period) throw new BadRequestException('Tidak ada periode aktif');

    let result;
    if (id) {
      const existing = await this.prisma.kontrakManajemen.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Kontrak tidak ditemukan');
      if (existing.status === 'submitted' || existing.status === 'approved') {
        throw new ForbiddenException('Kontrak yang sudah dikirim tidak dapat diubah');
      }
      result = await this.prisma.kontrakManajemen.update({
        where: { id },
        data: { bidang, holder, kpiItems: kpiItems as object, submitter: user.name, submitterId: user.id },
      });
    } else {
      result = await this.prisma.kontrakManajemen.create({
        data: {
          periodId: period.id, unitCode, bidang, holder,
          kpiItems: kpiItems as object, submitter: user.name, submitterId: user.id, status: 'draft',
        },
      });
    }

    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: id ? 'kontrak.update' : 'kontrak.create', entity: 'KontrakManajemen', targetId: result.id },
    });
    await this.cache.del(`kontrak:${unitCode}`);
    return result;
  }

  // Notifikasi push ke semua user pada tahap tertentu (Asman/Manajer/Sr.Manajer)
  private async notifyStage(stage: number, kontrak: { id: string; bidang: string; unitCode: string }, actorName: string) {
    const role = STAGE_TO_ROLE[stage];
    if (!role) return;
    const recipients = await this.prisma.user.findMany({ where: { role, isActive: true } });
    if (recipients.length === 0) return;
    const unitLabel = UNIT_NAMES[kontrak.unitCode] ?? kontrak.unitCode;
    await this.prisma.notification.createMany({
      data: recipients.map((u) => ({
        userId: u.id,
        type: 'approval',
        title: 'Usulan Kontrak Manajemen Menunggu Review',
        msg: `${actorName} meneruskan usulan KM "${kontrak.bidang}" (${unitLabel}) untuk review ${STAGE_LABEL[stage]}.`,
        route: '/approvals',
        targetId: kontrak.id,
        unread: true,
      })),
    });
  }

  // Submit untuk review → masuk tahap 2 (Asman), notifikasi ke Asman.
  async submit(user: User, id: string) {
    const kontrak = await this.prisma.kontrakManajemen.findUnique({ where: { id } });
    if (!kontrak) throw new NotFoundException('Kontrak tidak ditemukan');

    const history = [
      ...(Array.isArray(kontrak.history) ? (kontrak.history as object[]) : []),
      { stage: 1, actor: user.name, role: user.role, action: 'submitted', ts: new Date().toISOString() },
    ];

    const result = await this.prisma.kontrakManajemen.update({
      where: { id },
      data: {
        status: 'submitted',
        currentStage: 2,
        history,
        reviewer: null, reviewNote: null, reviewedAt: null,
        submitter: user.name, submitterId: user.id, submittedAt: new Date(),
      },
    });

    await this.notifyStage(2, result, user.name);
    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: 'kontrak.submit', entity: 'KontrakManajemen', targetId: id },
    });
    await this.cache.del(`kontrak:${kontrak.unitCode}`);
    return result;
  }

  async delete(user: User, id: string) {
    const kontrak = await this.prisma.kontrakManajemen.findUnique({ where: { id } });
    if (!kontrak) throw new NotFoundException('Kontrak tidak ditemukan');
    if (kontrak.status === 'submitted' || kontrak.status === 'approved') {
      throw new ForbiddenException('Kontrak yang sudah dikirim tidak dapat dihapus');
    }

    await this.prisma.kontrakManajemen.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: 'kontrak.delete', entity: 'KontrakManajemen', targetId: id },
    });
    await this.cache.del(`kontrak:${kontrak.unitCode}`);
    return { success: true };
  }

  // Daftar usulan yang menunggu review pada TAHAP user (Asman/Manajer/Sr.Manajer)
  async getReviewList(user: User) {
    if (user.role === Role.STAFF) throw new ForbiddenException('Tidak berwenang me-review');
    const stage = ROLE_TO_STAGE[user.role];
    return this.prisma.kontrakManajemen.findMany({
      where: { status: 'submitted', currentStage: stage },
      orderBy: { submittedAt: 'desc' },
    });
  }

  // Review berjenjang (hybrid):
  //  - approve → naik ke tahap berikutnya hingga GM (final)
  //  - reject + returnTo='konseptor' → kembali ke Staff untuk revisi isi (restart)
  //  - reject + returnTo='previous'  → mundur 1 tahap ke approver sebelumnya (klarifikasi)
  async review(
    user: User,
    id: string,
    action: 'approve' | 'reject',
    note?: string,
    returnTo: 'konseptor' | 'previous' = 'konseptor',
  ) {
    if (user.role === Role.STAFF) throw new ForbiddenException('Tidak berwenang me-review');
    if (action !== 'approve' && action !== 'reject') throw new BadRequestException('Aksi tidak valid');

    const kontrak = await this.prisma.kontrakManajemen.findUnique({ where: { id } });
    if (!kontrak) throw new NotFoundException('Kontrak tidak ditemukan');
    if (kontrak.status !== 'submitted') throw new ForbiddenException('Kontrak tidak dalam status menunggu review');
    if (action === 'reject' && !note) throw new BadRequestException('Catatan wajib diisi saat menolak');

    const userStage = ROLE_TO_STAGE[user.role];
    if (kontrak.currentStage !== userStage) {
      throw new ForbiddenException(`Usulan ini menunggu review ${STAGE_LABEL[kontrak.currentStage] ?? 'tahap lain'}, bukan tahap Anda`);
    }

    const baseHistory = Array.isArray(kontrak.history) ? (kontrak.history as object[]) : [];

    if (action === 'reject') {
      const prevStage = userStage - 1;
      // "Kembalikan 1 tahap" hanya bermakna bila ada approver di bawahnya (prevStage >= 2).
      const oneStep = returnTo === 'previous' && prevStage >= 2;

      if (oneStep) {
        const history = [...baseHistory, { stage: userStage, actor: user.name, role: user.role, action: 'returned_step', toStage: prevStage, note, ts: new Date().toISOString() }];
        const result = await this.prisma.kontrakManajemen.update({
          where: { id },
          data: { status: 'submitted', currentStage: prevStage, history, reviewer: user.name, reviewNote: note ?? null, reviewedAt: new Date() },
        });
        // Notifikasi ke approver tahap sebelumnya untuk klarifikasi
        await this.notifyStage(prevStage, result, user.name);
        await this.prisma.auditLog.create({ data: { actor: user.name, userId: user.id, action: 'kontrak.return_step', entity: 'KontrakManajemen', targetId: id, note } });
        await this.cache.del(`kontrak:${kontrak.unitCode}`);
        return result;
      }

      // Kembalikan ke konseptor (Staff) → revisi isi, submit ulang restart dari Asman
      const history = [...baseHistory, { stage: userStage, actor: user.name, role: user.role, action: 'returned', note, ts: new Date().toISOString() }];
      const result = await this.prisma.kontrakManajemen.update({
        where: { id },
        data: { status: 'rejected', currentStage: 1, history, reviewer: user.name, reviewNote: note ?? null, reviewedAt: new Date() },
      });
      if (kontrak.submitterId) {
        await this.prisma.notification.create({
          data: {
            userId: kontrak.submitterId, type: 'alert', title: 'Usulan KM Dikembalikan ke Konseptor',
            msg: `${user.name} (${STAGE_LABEL[userStage]}) mengembalikan usulan KM "${kontrak.bidang}" untuk revisi: ${note}`,
            route: '/input-kontrak', targetId: id, unread: true,
          },
        });
      }
      await this.prisma.auditLog.create({ data: { actor: user.name, userId: user.id, action: 'kontrak.reject', entity: 'KontrakManajemen', targetId: id, note } });
      await this.cache.del(`kontrak:${kontrak.unitCode}`);
      return result;
    }

    // approve
    const isFinal = userStage >= FINAL_STAGE;
    const nextStage = isFinal ? userStage : userStage + 1;
    const history = [...baseHistory, { stage: userStage, actor: user.name, role: user.role, action: 'approved', note, ts: new Date().toISOString() }];

    const result = await this.prisma.kontrakManajemen.update({
      where: { id },
      data: {
        status: isFinal ? 'approved' : 'submitted',
        currentStage: nextStage,
        history,
        reviewer: user.name, reviewNote: note ?? null, reviewedAt: new Date(),
      },
    });

    if (isFinal) {
      // Final disetujui Sr.Manajer → notifikasi pengirim
      if (kontrak.submitterId) {
        await this.prisma.notification.create({
          data: {
            userId: kontrak.submitterId, type: 'success', title: 'Usulan KM Disetujui (Final)',
            msg: `Usulan KM "${kontrak.bidang}" telah disetujui penuh hingga ${STAGE_LABEL[FINAL_STAGE]} oleh ${user.name}.`,
            route: '/input-kontrak', targetId: id, unread: true,
          },
        });
      }
    } else {
      // Teruskan ke tahap berikutnya → notifikasi reviewer berikut
      await this.notifyStage(nextStage, result, user.name);
    }

    await this.prisma.auditLog.create({ data: { actor: user.name, userId: user.id, action: 'kontrak.approve', entity: 'KontrakManajemen', targetId: id, note } });
    await this.cache.del(`kontrak:${kontrak.unitCode}`);
    return result;
  }

  // Alias kolom yang dikenali (case-insensitive). Boleh ada baris judul di atas tabel.
  private static readonly COLUMN_ALIASES: Record<string, string[]> = {
    indikator: ['indikator kinerja', 'indikator', 'kpi', 'nama indikator', 'indikator kpi'],
    formula: ['formula', 'rumus', 'metode', 'cara hitung'],
    satuan: ['satuan', 'unit'],
    bobot: ['bobot', 'bobot (%)', 'bobot %', 'weight', 'persen'],
    target: ['target semester i', 'target sem i', 'target semester 1', 'target sem 1', 'target sem1', 'target s1', 'target semester'],
    target2: ['target tahun', 'target tahunan', 'target setahun', 'target ' + new Date().getFullYear(), 'target (tahun)', 'target akhir', 'target tahun ini'],
  };

  // Parse file Excel/CSV → kembalikan kpiItems untuk mengisi form.
  // Robust: mendeteksi baris header otomatis (mengabaikan baris judul/kop di atasnya).
  parseExcel(file?: { buffer: Buffer; originalname?: string }) {
    if (!file?.buffer) throw new BadRequestException('File tidak ditemukan. Pilih file Excel (.xlsx/.xls) atau CSV.');

    let grid: string[][];
    try {
      const wb = XLSX.read(file.buffer, { type: 'buffer' });
      if (!wb.SheetNames.length) throw new Error('no sheet');
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '', blankrows: false });
      grid = raw.map((r) => (Array.isArray(r) ? r.map((c) => String(c ?? '').trim()) : []));
    } catch {
      throw new BadRequestException('File tidak dapat dibaca. Pastikan formatnya .xlsx, .xls, atau .csv yang valid.');
    }

    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
    const matchKey = (cell: string): string | null => {
      const n = norm(cell);
      if (!n) return null;
      for (const [key, aliases] of Object.entries(InputKontrakService.COLUMN_ALIASES)) {
        if (aliases.some((a) => n === norm(a) || n.startsWith(norm(a)))) return key;
      }
      return null;
    };

    // Cari baris header: baris yang punya sel cocok "indikator".
    let headerRow = -1;
    const colMap: Record<string, number> = {};
    for (let i = 0; i < grid.length; i++) {
      const row = grid[i];
      const localMap: Record<string, number> = {};
      row.forEach((cell, idx) => {
        const key = matchKey(cell);
        if (key && localMap[key] === undefined) localMap[key] = idx;
      });
      if (localMap.indikator !== undefined) {
        headerRow = i;
        Object.assign(colMap, localMap);
        break;
      }
    }

    if (headerRow === -1) {
      throw new BadRequestException(
        'Kolom "Indikator Kinerja" tidak ditemukan. Pastikan baris header memuat kolom: ' +
        'Indikator Kinerja, Formula, Satuan, Bobot, Target Semester I, Target (tahun). ' +
        'Unduh Template untuk format yang benar.',
      );
    }

    const get = (row: string[], key: string) => {
      const idx = colMap[key];
      return idx === undefined ? '' : String(row[idx] ?? '').trim();
    };

    const kpiItems = grid
      .slice(headerRow + 1)
      .map((row) => ({
        indikator: get(row, 'indikator'),
        formula: get(row, 'formula'),
        satuan: get(row, 'satuan'),
        bobot: get(row, 'bobot'),
        target: get(row, 'target'),
        target2: get(row, 'target2'),
      }))
      .filter((it) => it.indikator !== '');

    if (kpiItems.length === 0) {
      throw new BadRequestException('Header ditemukan tetapi tidak ada baris indikator berisi data. Isi minimal satu indikator.');
    }
    return { kpiItems, count: kpiItems.length };
  }

  // Template Excel siap-isi (buffer .xlsx)
  buildTemplate(): Buffer {
    const header = ['Indikator Kinerja', 'Formula', 'Satuan', 'Bobot', 'Target Semester I', `Target ${new Date().getFullYear()}`];
    const example = ['Progress Konstruksi Jaringan', 'realisasi / rencana x 100', '%', '30', '50', '95'];
    const ws = XLSX.utils.aoa_to_sheet([header, example]);
    ws['!cols'] = [{ wch: 32 }, { wch: 26 }, { wch: 10 }, { wch: 8 }, { wch: 16 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kontrak Manajemen');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }
}
