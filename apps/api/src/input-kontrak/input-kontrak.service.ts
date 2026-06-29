import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import * as XLSX from 'xlsx';
import { Step, buildSteps, stepMatches, stepRecipientWhere, slaRemainingDays, uname } from '../common/workflow-steps';

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

  // Registri KM yang sudah DISETUJUI penuh (final oleh GM).
  // KM bersifat TAHUNAN: acuan realisasi dicocokkan per-tahun (bukan per-bulan),
  // sehingga realisasi bulan apa pun pada tahun yg sama memakai KM tahun itu.
  async getApproved(unitCode?: string, year?: string) {
    let periodIdsInYear: string[] | undefined;
    if (year) {
      const periods = await this.prisma.period.findMany({
        where: { yearMonth: { startsWith: `${year}-` } },
        select: { id: true },
      });
      periodIdsInYear = periods.map((p) => p.id);
    }
    return this.prisma.kontrakManajemen.findMany({
      where: {
        status: 'approved',
        ...(unitCode ? { unitCode } : {}),
        ...(periodIdsInYear ? { periodId: { in: periodIdsInYear } } : {}),
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
    // Hanya Kantor Induk yang membuat KM (termasuk KM untuk UPMK). UPMK hanya mengisi realisasi.
    if (user.unit !== 'KP') throw new ForbiddenException('Kontrak Manajemen hanya dapat dibuat oleh Kantor Induk');
    // KM untuk unit UPMK: Staff RPC dapat memilih bidang mana pun (setiap KPI UPMK punya bidang penanggung jawab tersendiri).
    // KM untuk KP sendiri: bidang harus cocok dengan bidang user.
    const isUpmkKm = unitCode !== 'KP';
    if (user.role !== Role.GM && user.bidang && !isUpmkKm && bidang !== user.bidang) {
      throw new ForbiddenException('Anda hanya dapat menyusun Kontrak Manajemen pada bidang Anda');
    }
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

  // Notifikasi ke pemegang langkah berjalan.
  private async notifyStep(kontrakId: string, steps: Step[], stepIndex: number, unitCode: string, bidang: string, actorName: string) {
    const step = steps[stepIndex];
    if (!step) return;
    const recipients = await this.prisma.user.findMany({ where: stepRecipientWhere(step) });
    if (recipients.length === 0) return;
    await this.prisma.notification.createMany({
      data: recipients.map((u) => ({
        userId: u.id, type: 'approval', title: 'Usulan Kontrak Manajemen Menunggu Review',
        msg: `${actorName} meneruskan usulan KM ${uname(unitCode)} — ${bidang} untuk review: ${step.label}.`,
        route: '/approvals?type=km', targetId: kontrakId, unread: true,
      })),
    });
  }

  // Submit untuk review → mulai jenjang alur (rantai bidang KI → RPC).
  async submit(user: User, id: string) {
    if (user.unit !== 'KP') throw new ForbiddenException('Kontrak Manajemen hanya dapat dikirim oleh Kantor Induk');
    const kontrak = await this.prisma.kontrakManajemen.findUnique({ where: { id } });
    if (!kontrak) throw new NotFoundException('Kontrak tidak ditemukan');

    // KM selalu rantai bidang KI (mode 'km'), termasuk KM untuk UPMK.
    const steps = buildSteps(kontrak.unitCode, kontrak.bidang, 'km');
    if (!stepMatches(steps[0], user)) {
      throw new ForbiddenException('Hanya PIC/Staff Kinerja bidang terkait yang dapat mengirim KM ini');
    }
    const history = [
      ...(Array.isArray(kontrak.history) ? (kontrak.history as object[]) : []),
      { stepIndex: 0, actor: user.name, role: user.role, action: 'submitted', label: steps[0].label, ts: new Date().toISOString() },
    ];
    const result = await this.prisma.kontrakManajemen.update({
      where: { id },
      data: {
        status: 'submitted', steps: steps as object, currentStepIndex: 1, currentStage: 1,
        history, reviewer: null, reviewNote: null, reviewedAt: null,
        submitter: user.name, submitterId: user.id, submittedAt: new Date(),
      },
    });
    await this.notifyStep(id, steps, 1, kontrak.unitCode, kontrak.bidang, user.name);
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

  // Daftar usulan KM yang menunggu review pada LANGKAH milik user.
  async getReviewList(user: User) {
    const submitted = await this.prisma.kontrakManajemen.findMany({
      where: { status: 'submitted' },
      orderBy: { submittedAt: 'desc' },
    });
    return submitted
      .filter((k) => {
        const steps = (k.steps as unknown as Step[]) ?? [];
        return stepMatches(steps[k.currentStepIndex], user);
      })
      .map((k) => {
        const steps = (k.steps as unknown as Step[]) ?? [];
        return { ...k, stepLabel: steps[k.currentStepIndex]?.label ?? '—', slaRemainingDays: slaRemainingDays(k) };
      });
  }

  // Review berjenjang mengikuti `steps` (rantai bidang KI → RPC). GM menyetujui via BUNDLE tahunan.
  async review(
    user: User,
    id: string,
    action: 'approve' | 'reject',
    note?: string,
    returnTo: 'konseptor' | 'previous' = 'konseptor',
  ) {
    if (action !== 'approve' && action !== 'reject') throw new BadRequestException('Aksi tidak valid');
    const k = await this.prisma.kontrakManajemen.findUnique({ where: { id } });
    if (!k) throw new NotFoundException('Kontrak tidak ditemukan');
    if (k.status !== 'submitted') throw new ForbiddenException('Kontrak tidak dalam status menunggu review');
    if (!note?.trim()) throw new BadRequestException('Catatan/komentar wajib diisi saat menyetujui atau menolak');

    const steps = (k.steps as unknown as Step[]) ?? [];
    const curIdx = k.currentStepIndex;
    if (!stepMatches(steps[curIdx], user)) {
      throw new ForbiddenException(`Usulan ini menunggu langkah "${steps[curIdx]?.label ?? 'lain'}", bukan langkah Anda`);
    }
    const baseHistory = Array.isArray(k.history) ? (k.history as object[]) : [];

    if (action === 'reject') {
      const toPrev = returnTo === 'previous' && curIdx - 1 >= 1;
      const newIdx = toPrev ? curIdx - 1 : 0;
      const history = [...baseHistory, { stepIndex: curIdx, actor: user.name, role: user.role, action: toPrev ? 'returned_step' : 'returned', toStepIndex: newIdx, label: steps[curIdx]?.label, note, ts: new Date().toISOString() }];
      const result = await this.prisma.kontrakManajemen.update({
        where: { id },
        data: { status: toPrev ? 'submitted' : 'rejected', currentStepIndex: newIdx, currentStage: newIdx, history, reviewer: user.name, reviewNote: note, reviewedAt: new Date() },
      });
      if (toPrev) {
        await this.notifyStep(id, steps, newIdx, k.unitCode, k.bidang, user.name);
      } else if (k.submitterId) {
        await this.prisma.notification.create({
          data: {
            userId: k.submitterId, type: 'alert', title: 'Usulan KM Dikembalikan ke Konseptor',
            msg: `${user.name} (${steps[curIdx]?.label}) mengembalikan usulan KM ${uname(k.unitCode)} — ${k.bidang}: ${note}`,
            route: '/input-kontrak', targetId: id, unread: true,
          },
        });
      }
      await this.prisma.auditLog.create({ data: { actor: user.name, userId: user.id, action: toPrev ? 'kontrak.return_step' : 'kontrak.reject', entity: 'KontrakManajemen', targetId: id, note } });
      await this.cache.del(`kontrak:${k.unitCode}`);
      return result;
    }

    // approve → maju
    const nextIdx = curIdx + 1;
    const chainDone = nextIdx >= steps.length;
    const history = [...baseHistory, { stepIndex: curIdx, actor: user.name, role: user.role, action: 'approved', label: steps[curIdx]?.label, note, ts: new Date().toISOString() }];
    const result = await this.prisma.kontrakManajemen.update({
      where: { id },
      data: {
        status: chainDone ? 'ready' : 'submitted',
        currentStepIndex: chainDone ? steps.length : nextIdx,
        currentStage: chainDone ? steps.length : nextIdx,
        history, reviewer: user.name, reviewNote: note, reviewedAt: new Date(),
      },
    });
    if (chainDone) {
      // Reset bundle scope yang relevan ke 'open' agar GM bisa menyahkan ulang.
      const period = await this.prisma.period.findUnique({ where: { id: k.periodId }, select: { yearMonth: true } });
      const yr = period?.yearMonth.slice(0, 4);
      if (yr) {
        const scope = k.unitCode === 'KP' ? 'KP' : 'UPMK';
        await this.prisma.kMBundle.updateMany({ where: { year: yr, scope, status: { in: ['rejected', 'approved'] } }, data: { status: 'open' } });
      }
      const gms = await this.prisma.user.findMany({ where: { role: Role.GM, isActive: true } });
      if (gms.length) {
        await this.prisma.notification.createMany({
          data: gms.map((g) => ({
            userId: g.id, type: 'approval', title: 'KM Siap Masuk Bundle Tahunan',
            msg: `KM ${uname(k.unitCode)} — ${k.bidang} lolos hingga SM Perencanaan & PC, siap dikonsolidasi tahunan.`,
            route: '/approvals?type=km-bundle', targetId: id, unread: true,
          })),
        });
      }
    } else {
      await this.notifyStep(id, steps, nextIdx, k.unitCode, k.bidang, user.name);
    }
    await this.prisma.auditLog.create({ data: { actor: user.name, userId: user.id, action: 'kontrak.approve', entity: 'KontrakManajemen', targetId: id, note } });
    await this.cache.del(`kontrak:${k.unitCode}`);
    return result;
  }

  // Edit KPI items oleh reviewer pada langkah aktif (status=submitted, stepMatches user).
  async updateKpiItems(user: User, id: string, kpiItems: object[]) {
    const km = await this.prisma.kontrakManajemen.findUnique({ where: { id } });
    if (!km) throw new NotFoundException('Kontrak tidak ditemukan');
    if (km.status !== 'submitted') throw new ForbiddenException('Hanya KM yang sedang direview yang dapat diedit');
    const steps = (km.steps as unknown as Step[]) ?? [];
    if (!stepMatches(steps[km.currentStepIndex], user)) {
      throw new ForbiddenException('KM ini bukan pada langkah Anda');
    }
    const history = [
      ...(Array.isArray(km.history) ? (km.history as object[]) : []),
      { stepIndex: km.currentStepIndex, actor: user.name, role: user.role, action: 'edited', ts: new Date().toISOString() },
    ];
    const result = await this.prisma.kontrakManajemen.update({ where: { id }, data: { kpiItems: kpiItems as object, history } });
    await this.prisma.auditLog.create({
      data: { actor: user.name, userId: user.id, action: 'kontrak.edit', entity: 'KontrakManajemen', targetId: id },
    });
    await this.cache.del(`kontrak:${km.unitCode}`);
    return result;
  }

  // ===== BUNDLE KM tahunan (persetujuan akhir GM, sekali untuk seluruh KM tahun tsb) =====
  private async periodIdsForYear(year: string) {
    const periods = await this.prisma.period.findMany({ where: { yearMonth: { startsWith: `${year}-` } }, select: { id: true } });
    return periods.map((p) => p.id);
  }
  private async resolveYear(year?: string) {
    if (year) return year;
    const active = await this.prisma.period.findFirst({ where: { isActive: true } });
    return active ? active.yearMonth.slice(0, 4) : String(new Date().getFullYear());
  }

  async getBundle(scope: 'KP' | 'UPMK' = 'KP', year?: string) {
    const yr = await this.resolveYear(year);
    const pids = await this.periodIdsForYear(yr);
    const unitFilter = scope === 'KP' ? { unitCode: 'KP' } : { unitCode: { not: 'KP' } };
    const components = await this.prisma.kontrakManajemen.findMany({
      where: { periodId: { in: pids }, status: { in: ['submitted', 'ready', 'approved'] }, ...unitFilter },
      orderBy: [{ unitCode: 'asc' }, { bidang: 'asc' }],
    });
    const bundle = await this.prisma.kMBundle.findUnique({ where: { year_scope: { year: yr, scope } } });
    const readyCount = components.filter((c) => c.status === 'ready').length;
    const submittedCount = components.filter((c) => c.status === 'submitted').length;
    const canApprove = readyCount > 0 && submittedCount === 0;
    // effectiveStatus: 'approved' bila semua komponen sudah disahkan (meski belum ada bundle record
    // untuk scope ini — misal UPMK yang disahkan lewat bundle lama sebelum fitur pisah scope).
    const allApproved = components.length > 0 && components.every((c) => c.status === 'approved');
    const effectiveStatus = readyCount > 0 ? 'open' : allApproved ? 'approved' : (bundle?.status ?? 'open');
    return {
      year: yr, scope, status: effectiveStatus, reviewer: bundle?.reviewer ?? null,
      reviewNote: bundle?.reviewNote ?? null, reviewedAt: bundle?.reviewedAt ?? null,
      total: components.length, readyCount, canApprove,
      components: components.map((c) => ({
        id: c.id, unitCode: c.unitCode, bidang: c.bidang, status: c.status,
        submitter: c.submitter, holder: c.holder, kpiItems: c.kpiItems, history: c.history,
      })),
    };
  }

  async reviewBundle(user: User, scope: 'KP' | 'UPMK', action: 'approve' | 'reject', note: string, year?: string) {
    if (user.role !== Role.GM) throw new ForbiddenException('Hanya General Manager yang menyetujui bundle KM');
    if (!note?.trim()) throw new BadRequestException('Catatan/komentar wajib diisi');
    const yr = await this.resolveYear(year);
    const pids = await this.periodIdsForYear(yr);
    const unitFilter = scope === 'KP' ? { unitCode: 'KP' } : { unitCode: { not: 'KP' } };
    const scopeLabel = scope === 'KP' ? 'Kantor Induk' : 'UPMK';
    const components = await this.prisma.kontrakManajemen.findMany({ where: { periodId: { in: pids }, status: { in: ['submitted', 'ready'] }, ...unitFilter } });
    if (components.length === 0) throw new BadRequestException(`Tidak ada KM ${scopeLabel} yang siap dikonsolidasi pada tahun ini`);

    if (action === 'approve') {
      if (!components.every((c) => c.status === 'ready')) throw new ForbiddenException(`Masih ada KM ${scopeLabel} yang belum lolos sampai SM Perencanaan & PC`);
      await this.prisma.kontrakManajemen.updateMany({ where: { periodId: { in: pids }, status: 'ready', ...unitFilter }, data: { status: 'approved', reviewer: user.name, reviewedAt: new Date() } });
    } else {
      // GM tolak bundle → kembalikan tiap komponen 'ready' ke langkah Manajer Perencanaan.
      for (const c of components.filter((x) => x.status === 'ready')) {
        const cSteps = (c.steps as unknown as Step[]) ?? [];
        let idx = cSteps.findIndex((s) => s.variant === 'man_perencanaan');
        if (idx < 0) idx = Math.max(0, cSteps.length - 2); // fallback: 1 langkah sebelum SM
        const baseHist = Array.isArray(c.history) ? (c.history as object[]) : [];
        const history = [...baseHist, {
          stepIndex: cSteps.length, actor: user.name, role: user.role,
          action: 'bundle_returned', toStepIndex: idx, label: cSteps[idx]?.label ?? 'Manajer Perencanaan',
          note, ts: new Date().toISOString(),
        }];
        await this.prisma.kontrakManajemen.update({
          where: { id: c.id },
          data: { status: 'submitted', currentStepIndex: idx, currentStage: idx, history, reviewer: user.name, reviewNote: note, reviewedAt: new Date() },
        });
      }
    }
    const bundle = await this.prisma.kMBundle.upsert({
      where: { year_scope: { year: yr, scope } },
      update: { status: action === 'approve' ? 'approved' : 'rejected', reviewer: user.name, reviewNote: note, reviewedAt: new Date() },
      create: { year: yr, scope, status: action === 'approve' ? 'approved' : 'rejected', reviewer: user.name, reviewNote: note, reviewedAt: new Date() },
    });
    if (action === 'approve') {
      const submitterIds = [...new Set(components.map((c) => c.submitterId).filter(Boolean))] as string[];
      if (submitterIds.length) {
        await this.prisma.notification.createMany({
          data: submitterIds.map((sid) => ({
            userId: sid, type: 'success', title: 'Bundle KM Disetujui GM',
            msg: `Kontrak Manajemen tahun ${yr} disahkan penuh oleh ${user.name}.`,
            route: '/input-kontrak', unread: true,
          })),
        });
      }
    } else {
      // Notifikasi ke Manajer Perencanaan (penerima limpahan tolakan bundle GM).
      const manPer = await this.prisma.user.findMany({ where: { isActive: true, roleVariant: { code: 'man_perencanaan' } } });
      if (manPer.length) {
        await this.prisma.notification.createMany({
          data: manPer.map((u) => ({
            userId: u.id, type: 'alert', title: 'Bundle KM Dikembalikan GM',
            msg: `${user.name} menolak bundle KM tahun ${yr}. Komponen dikembalikan ke Manajer Perencanaan untuk ditinjau: ${note}`,
            route: '/approvals?type=km', unread: true,
          })),
        });
      }
    }
    await this.prisma.auditLog.create({ data: { actor: user.name, userId: user.id, action: `kontrak.bundle.${action}`, entity: 'KMBundle', targetId: bundle.id, note } });
    for (const c of components) await this.cache.del(`kontrak:${c.unitCode}`);
    return bundle;
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
