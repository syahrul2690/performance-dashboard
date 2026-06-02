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

  // Submit untuk review → buat notifikasi ke semua Asman.
  async submit(user: User, id: string) {
    const kontrak = await this.prisma.kontrakManajemen.findUnique({ where: { id } });
    if (!kontrak) throw new NotFoundException('Kontrak tidak ditemukan');

    const result = await this.prisma.kontrakManajemen.update({
      where: { id },
      data: { status: 'submitted', submitter: user.name, submitterId: user.id, submittedAt: new Date() },
    });

    // Notifikasi push ke semua Asman aktif
    const asmen = await this.prisma.user.findMany({ where: { role: Role.ASMAN, isActive: true } });
    const unitLabel = UNIT_NAMES[kontrak.unitCode] ?? kontrak.unitCode;
    if (asmen.length > 0) {
      await this.prisma.notification.createMany({
        data: asmen.map((a) => ({
          userId: a.id,
          type: 'approval',
          title: 'Usulan Kontrak Manajemen Baru',
          msg: `${user.name} (${unitLabel}) mengirim usulan KM "${kontrak.bidang}" menunggu review Anda.`,
          route: '/approvals',
          targetId: result.id,
          unread: true,
        })),
      });
    }

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

  // Daftar usulan yang menunggu review (untuk Asman ke atas)
  async getReviewList(user: User) {
    if (user.role === Role.STAFF) throw new ForbiddenException('Tidak berwenang me-review');
    return this.prisma.kontrakManajemen.findMany({
      where: { status: 'submitted' },
      orderBy: { submittedAt: 'desc' },
    });
  }

  // Review: approve / reject → notifikasi balik ke pengirim
  async review(user: User, id: string, action: 'approve' | 'reject', note?: string) {
    if (user.role === Role.STAFF) throw new ForbiddenException('Tidak berwenang me-review');
    if (action !== 'approve' && action !== 'reject') throw new BadRequestException('Aksi tidak valid');

    const kontrak = await this.prisma.kontrakManajemen.findUnique({ where: { id } });
    if (!kontrak) throw new NotFoundException('Kontrak tidak ditemukan');
    if (kontrak.status !== 'submitted') throw new ForbiddenException('Kontrak tidak dalam status menunggu review');
    if (action === 'reject' && !note) throw new BadRequestException('Catatan wajib diisi saat menolak');

    const result = await this.prisma.kontrakManajemen.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewer: user.name,
        reviewNote: note ?? null,
        reviewedAt: new Date(),
      },
    });

    if (kontrak.submitterId) {
      await this.prisma.notification.create({
        data: {
          userId: kontrak.submitterId,
          type: action === 'approve' ? 'success' : 'alert',
          title: action === 'approve' ? 'Usulan KM Disetujui' : 'Usulan KM Dikembalikan',
          msg: action === 'approve'
            ? `${user.name} menyetujui usulan KM "${kontrak.bidang}".`
            : `${user.name} mengembalikan usulan KM "${kontrak.bidang}": ${note}`,
          route: '/input-kontrak',
          targetId: id,
          unread: true,
        },
      });
    }

    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: `kontrak.${action}`, entity: 'KontrakManajemen', targetId: id, note },
    });
    await this.cache.del(`kontrak:${kontrak.unitCode}`);
    return result;
  }

  // Parse file Excel → kembalikan kpiItems untuk mengisi form.
  parseExcel(file?: { buffer: Buffer; originalname?: string }) {
    if (!file?.buffer) throw new BadRequestException('File tidak ditemukan');
    let rows: Record<string, unknown>[];
    try {
      const wb = XLSX.read(file.buffer, { type: 'buffer' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    } catch {
      throw new BadRequestException('File Excel tidak dapat dibaca');
    }

    const pick = (row: Record<string, unknown>, keys: string[]): string => {
      const lowerMap = new Map(Object.keys(row).map((k) => [k.toLowerCase().trim(), k]));
      for (const key of keys) {
        const found = lowerMap.get(key.toLowerCase());
        if (found != null && String(row[found]).trim() !== '') return String(row[found]).trim();
      }
      return '';
    };

    const kpiItems = rows
      .map((row) => ({
        indikator: pick(row, ['indikator kinerja', 'indikator', 'kpi', 'nama indikator']),
        formula: pick(row, ['formula', 'rumus', 'metode']),
        satuan: pick(row, ['satuan', 'unit']),
        bobot: pick(row, ['bobot', 'bobot (%)', 'weight']),
        target: pick(row, ['target semester i', 'target sem i', 'target semester 1', 'target sem 1', 'target']),
        target2: pick(row, ['target tahun', 'target tahunan', 'target 2026', 'target 2025', 'target (tahun)']),
      }))
      .filter((it) => it.indikator !== '');

    if (kpiItems.length === 0) {
      throw new BadRequestException('Tidak ada baris indikator yang terbaca. Pastikan ada kolom "Indikator Kinerja".');
    }
    return { kpiItems, count: kpiItems.length };
  }
}
