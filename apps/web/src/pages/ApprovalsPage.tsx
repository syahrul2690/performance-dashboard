import { useEffect, useState, Fragment, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { approvals as approvalsApi, inputKontrak, inputRealisasi, meta as metaApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { usePeriod } from '../context/PeriodContext';
import { useNotif } from '../context/NotifContext';
import type { Report, KontrakManajemen, RealisasiKinerja } from '../lib/types';
import { CheckCircle, XCircle, Clock, CalendarClock, FileText, UsersRound, FileSignature, ChevronDown, ClipboardCheck, Timer, MessageSquare, Pencil, Layers } from 'lucide-react';
import { SkeletonTable, EmptyState, ErrorState } from '../components/LoadState';

// Badge SLA approval (Task 6): hari tersisa hingga deadline tahap berjalan.
function SlaBadge({ days }: { days?: number | null }) {
  if (days === undefined || days === null) return <span style={{ color: 'var(--color-text-subtle)' }}>—</span>;
  const overdue = days < 0;
  const urgent = days <= 1;
  const color = overdue ? 'var(--color-danger)' : urgent ? 'var(--color-warning)' : 'var(--color-success)';
  const bg = overdue ? 'var(--color-danger-tint)' : urgent ? 'var(--color-warning-tint)' : 'var(--color-success-tint)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 8, whiteSpace: 'nowrap' }}>
      <Timer size={11} />
      {overdue ? `Telat ${Math.abs(days)} hari` : days === 0 ? 'Jatuh tempo hari ini' : `${days} hari lagi`}
    </span>
  );
}

// Timeline komentar/persetujuan dari history JSON (Task 4 — traceability).
type HistEntry = { stage?: number; actor?: string; role?: string; action?: string; note?: string; ts?: string; toStage?: number };
const ACTION_LABEL: Record<string, string> = {
  submitted: 'Diajukan', approved: 'Disetujui', returned: 'Dikembalikan ke konseptor', returned_step: 'Dikembalikan 1 tahap',
};
function ApprovalTimeline({ history }: { history: unknown }) {
  const entries = Array.isArray(history) ? (history as HistEntry[]) : [];
  if (entries.length === 0) return <div style={{ fontSize: 11, color: 'var(--color-text-muted)', padding: 'var(--space-3)' }}>Belum ada riwayat persetujuan.</div>;
  return (
    <div style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {entries.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 11, alignItems: 'flex-start' }}>
          <MessageSquare size={12} style={{ marginTop: 2, color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600 }}>
              {ACTION_LABEL[e.action ?? ''] ?? e.action ?? '—'} · {e.actor ?? '—'}
              {e.role ? <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}> ({e.role})</span> : null}
              {e.ts ? <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}> · {new Date(e.ts).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span> : null}
            </div>
            {e.note ? <div style={{ color: 'var(--color-text-muted)', marginTop: 1 }}>“{e.note}”</div> : <div style={{ color: 'var(--color-text-subtle)', fontStyle: 'italic', marginTop: 1 }}>(tanpa komentar)</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// Kartu yang bisa dilipat (fold-up): klik header untuk buka/tutup isi.
function FoldCard({
  title, icon, right, accent, defaultOpen = true, children, id, highlight = false,
}: {
  title: string;
  icon?: ReactNode;
  right?: ReactNode;
  accent?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  id?: string;
  highlight?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className={`card p-0${highlight ? ' notif-highlight' : ''}`} style={{ marginBottom: 'var(--space-6)', ...(accent ? { borderTop: `3px solid ${accent}` } : {}) }}>
      <button
        type="button"
        className="card-header compact fold-card-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="card-title">{icon}{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {right}
          <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: 'var(--color-text-muted)' }} />
        </div>
      </button>
      {open && children}
    </div>
  );
}

const STAGES = ['', 'Staff', 'Asman', 'Manajer', 'Sr. Manajer', 'GM'];
// Jenjang persetujuan usulan Kontrak Manajemen: Staff → Asman → Manajer → Sr. Manajer → GM (final)

const DOC_STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', submitted: 'Menunggu Review', ready: 'Siap Konsolidasi', approved: 'Disetujui', rejected: 'Dikembalikan',
};
const DOC_STATUS_PILL: Record<string, string> = {
  draft: 'in-review', submitted: 'needs-revision', ready: 'at-risk', approved: 'completed', rejected: 'delayed',
};
const UNIT_NAMES: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
  UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};

const FASE_ACCENT =['var(--color-accent)', 'var(--color-info)', 'var(--color-warning)', 'var(--color-success)', 'var(--color-text-muted)'];

const WORKFLOW_STATIC = [
  { stage: 1, fase: 'Input Data', deadline: 'Tgl 1-3', slaHours: 48, action: 'Staff input realisasi KPI/PI bulanan ke sistem', role: 'STAFF', checklist: ['Isi semua field realisasi', 'Lampirkan dokumen pendukung', 'Submit sebelum deadline'] },
  { stage: 2, fase: 'Review Asman', deadline: 'Tgl 4', slaHours: 24, action: 'Asisten Manajer verifikasi kelengkapan data', role: 'ASMAN', checklist: ['Cek kesesuaian data dengan dokumen', 'Validasi perhitungan nilai', 'Approve atau kembalikan'] },
  { stage: 3, fase: 'Approve Manajer', deadline: 'Tgl 5', slaHours: 24, action: 'Manajer Bidang tanda tangan laporan unit', role: 'MANAJER', checklist: ['Review analisis dan narasi', 'Pastikan target vs realisasi akurat', 'Sign off laporan'] },
  { stage: 4, fase: 'Review Sr. Manajer', deadline: 'Tgl 6', slaHours: 12, action: 'Senior Manajer review laporan konsolidasi', role: 'SRMANAJER', checklist: ['Evaluasi kinerja lintas bidang', 'Berikan rekomendasi perbaikan', 'Eskalasi ke GM'] },
  { stage: 5, fase: 'Approve GM', deadline: 'Tgl 7', slaHours: 12, action: 'General Manager final approval & publikasi', role: 'GM', checklist: ['Final review eksekutif', 'Tanda tangan digital', 'Publikasi ke dashboard'] },
];

export function ApprovalsPage() {
  const { user } = useAuth();
  const { refresh: refreshNotif } = useNotif();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review usulan Kontrak Manajemen (untuk Asman ke atas)
  // Reviewer = bukan Staff penyusun. PENGECUALIAN: Staff Kinerja Perencanaan (RPC) adalah
  // konsolidator pada workflow (langkah Staff RPC), sehingga butuh fungsi review/teruskan.
  const canReview = !!user && (user.role !== 'STAFF' || user.bidang === 'Perencanaan & Project Control');
  const [kmList, setKmList] = useState<KontrakManajemen[]>([]);
  const [kmNote, setKmNote] = useState('');
  const [kmTarget, setKmTarget] = useState<string | null>(null);
  const [kmExpanded, setKmExpanded] = useState<string | null>(null);
  const [kmBusy, setKmBusy] = useState(false);

  // Review Realisasi Kinerja Bulanan (untuk Asman ke atas)
  const [realList, setRealList] = useState<RealisasiKinerja[]>([]);
  const [realNote, setRealNote] = useState('');
  const [realTarget, setRealTarget] = useState<string | null>(null);
  const [realExpanded, setRealExpanded] = useState<string | null>(null);
  const [realBusy, setRealBusy] = useState(false);
  // B2-5: edit nilai realisasi saat review (per layer)
  const [realEditId, setRealEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Semua dokumen yang diinput manual (KM + Realisasi) — untuk kartu ringkasan & registri
  const [allKm, setAllKm] = useState<KontrakManajemen[]>([]);
  const [allReal, setAllReal] = useState<RealisasiKinerja[]>([]);
  const [periodMap, setPeriodMap] = useState<Record<string, string>>({});

  // Task 10: highlight kartu sesuai notifikasi yang diklik (realisasi = prioritas utama).
  const [searchParams] = useSearchParams();
  const focusType = searchParams.get('type');
  const focusId = searchParams.get('focus');
  const [highlight, setHighlight] = useState<'real' | 'km' | null>(null);
  // Task 4: ekspansi riwayat komentar pada kartu "Semua Dokumen Persetujuan".
  const [docExpanded, setDocExpanded] = useState<string | null>(null);

  // B4: Bundle konsolidasi realisasi periode (persetujuan GM sekali).
  const { periodId } = usePeriod();
  type BundleData = {
    period?: { label?: string } | null; status: string; total: number; readyCount: number; canApprove: boolean;
    components: Array<{ id: string; unitCode: string; bidang: string; status: string; submitter: string }>;
  };
  const [bundle, setBundle] = useState<BundleData | null>(null);
  const [bundleNote, setBundleNote] = useState('');
  const [bundleBusy, setBundleBusy] = useState(false);
  const loadBundle = () => {
    inputRealisasi.bundle(periodId || undefined).then((d) => setBundle(d as BundleData)).catch(() => {});
  };
  // Bundle KM tahunan (GM)
  type KmBundleComp = { id: string; unitCode: string; bidang: string; status: string; submitter: string; holder?: string; kpiItems?: Record<string, string>[]; history?: unknown };
  type KmBundleData = {
    year?: string; status: string; total: number; readyCount: number; canApprove: boolean;
    components: KmBundleComp[];
  };
  const [kmBundle, setKmBundle] = useState<KmBundleData | null>(null);
  const [kmBundleNote, setKmBundleNote] = useState('');
  const [kmBundleBusy, setKmBundleBusy] = useState(false);
  const [kmBundleExpanded, setKmBundleExpanded] = useState<string | null>(null);
  const loadKmBundle = () => {
    inputKontrak.bundle().then((d) => setKmBundle(d as KmBundleData)).catch(() => {});
  };

  const load = () => {
    approvalsApi.reports()
      .then(setReports)
      .catch((e) => setError(e?.message ?? 'Gagal memuat data'))
      .finally(() => setLoading(false));
  };

  const loadKm = () => {
    if (!canReview) return;
    inputKontrak.reviewList().then((d) => setKmList(d as KontrakManajemen[])).catch(() => {});
  };

  const loadReal = () => {
    if (!canReview) return;
    inputRealisasi.reviewList().then((d) => setRealList(d as RealisasiKinerja[])).catch(() => {});
  };

  // Semua dokumen KM + Realisasi (lintas unit) untuk kartu ringkasan & registri
  const loadDocs = () => {
    inputKontrak.list().then((d) => setAllKm(d as KontrakManajemen[])).catch(() => {});
    inputRealisasi.history().then((d) => setAllReal(d as RealisasiKinerja[])).catch(() => {});
    metaApi.periods()
      .then((ps) => {
        const map: Record<string, string> = {};
        (ps as Array<{ id: string; label: string }>).forEach((p) => { map[p.id] = p.label; });
        setPeriodMap(map);
      })
      .catch(() => {});
  };

  useEffect(() => { load(); loadKm(); loadReal(); loadDocs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadBundle(); loadKmBundle(); }, [periodId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKmBundleReview = async (action: 'approve' | 'reject') => {
    if (!kmBundleNote.trim()) { alert('Catatan/komentar wajib diisi'); return; }
    setKmBundleBusy(true);
    try {
      await inputKontrak.reviewBundle(action, kmBundleNote);
      setKmBundleNote('');
      loadKmBundle(); loadKm(); refreshNotif();
    } catch (e) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal memproses bundle KM');
    } finally {
      setKmBundleBusy(false);
    }
  };

  const handleBundleReview = async (action: 'approve' | 'reject') => {
    if (!bundleNote.trim()) { alert('Catatan/komentar wajib diisi'); return; }
    setBundleBusy(true);
    try {
      await inputRealisasi.reviewBundle(action, bundleNote, periodId || undefined);
      setBundleNote('');
      loadBundle(); loadReal(); refreshNotif();
    } catch (e) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal memproses bundle');
    } finally {
      setBundleBusy(false);
    }
  };

  // Saat tiba dari notifikasi: tentukan kartu yang di-highlight & scroll ke sana.
  // Prioritas: Realisasi Kinerja Bulanan; fallback ke Usulan KM yang menunggu.
  useEffect(() => {
    if (loading || (!focusType && !focusId)) return;
    const inReal = focusType === 'realisasi' || realList.some((r) => r.id === focusId);
    const inKm = focusType === 'km' || kmList.some((k) => k.id === focusId);
    const target: 'real' | 'km' | null = inReal
      ? 'real'
      : inKm
        ? 'km'
        : realList.length > 0 ? 'real' : kmList.length > 0 ? 'km' : null;
    if (!target) return;
    setHighlight(target);
    const el = document.getElementById(target === 'real' ? 'card-realisasi' : 'card-km');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const t = setTimeout(() => setHighlight(null), 4000);
    return () => clearTimeout(t);
  }, [loading, focusType, focusId, realList, kmList]);

  const handleRealReview = async (id: string, action: 'approve' | 'reject', returnTo?: 'konseptor' | 'previous') => {
    // Task 3: komentar wajib untuk setiap keputusan (setujui maupun kembalikan).
    if (!realNote.trim()) { alert('Catatan/komentar wajib diisi saat menyetujui atau mengembalikan realisasi'); return; }
    setRealBusy(true);
    try {
      await inputRealisasi.review(id, action, realNote, returnTo);
      setRealTarget(null); setRealNote('');
      loadReal();
      refreshNotif();
    } catch (e) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal memproses review');
    } finally {
      setRealBusy(false);
    }
  };

  const startEditReal = (rl: RealisasiKinerja) => {
    const ev: Record<string, string> = {};
    Object.entries(rl.values ?? {}).forEach(([key, v]) => {
      ev[key] = String((v as { realisasi?: unknown })?.realisasi ?? '');
    });
    setEditValues(ev);
    setRealEditId(rl.id);
    setRealExpanded(rl.id);
  };

  const saveEditReal = async (rl: RealisasiKinerja) => {
    const merged: Record<string, unknown> = {};
    Object.entries(rl.values ?? {}).forEach(([key, v]) => {
      merged[key] = { ...(v as object), realisasi: editValues[key] ?? (v as { realisasi?: unknown })?.realisasi };
    });
    setRealBusy(true);
    try {
      await inputRealisasi.updateValues(rl.id, merged);
      setRealEditId(null);
      loadReal();
    } catch (e) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan perubahan');
    } finally {
      setRealBusy(false);
    }
  };

  const handleKmReview = async (id: string, action: 'approve' | 'reject', returnTo?: 'konseptor' | 'previous') => {
    // Task 3: komentar wajib untuk setiap keputusan (setujui maupun kembalikan).
    if (!kmNote.trim()) { alert('Catatan/komentar wajib diisi saat menyetujui atau mengembalikan usulan'); return; }
    setKmBusy(true);
    try {
      await inputKontrak.review(id, action, kmNote, returnTo);
      setKmTarget(null); setKmNote('');
      loadKm();
      refreshNotif();
    } catch (e) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal memproses review');
    } finally {
      setKmBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-header"><h1 className="page-title">Persetujuan</h1></div>
        <div className="kpi-strip-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="metric-card" style={{ minHeight: 80 }}>
              <div className="skeleton-line skeleton" style={{ width: '60%', height: 12 }} />
              <div className="skeleton-line skeleton" style={{ width: '30%', height: 28, marginTop: 8 }} />
            </div>
          ))}
        </div>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  if (error) return <ErrorState title="Gagal memuat laporan" message={error} />;

  // B2-4: dokumen di-scope ke bidang user (GM / tanpa bidang = lintas-bidang).
  // Role konsolidasi RPC (SO RPC, Manajer Perencanaan, SM RPC) boleh melihat lintas bidang & UPMK.
  const isGM = user?.role === 'GM';
  const myBidang = user?.bidang ?? null;
  const vc = user?.roleVariant?.code;
  const isRpcKonsolidasi = vc === 'man_perencanaan' || vc === 'sm_pc'
    || (user?.role === 'STAFF' && myBidang === 'Perencanaan & Project Control');
  const scopeByBidang = isGM || isRpcKonsolidasi || !myBidang;
  const scopeKm = scopeByBidang ? allKm : allKm.filter((k) => k.bidang === myBidang);
  const scopeReal = scopeByBidang ? allReal : allReal.filter((r) => (r as RealisasiKinerja & { bidang?: string }).bidang === myBidang);

  // Ringkasan dari dokumen yang DIINPUT manual ke sistem (Kontrak Manajemen + Realisasi Kinerja)
  const docs: Array<{ status: string }> = [...scopeKm, ...scopeReal];
  const totalDoc = docs.length;
  const approvedDoc = docs.filter((d) => d.status === 'approved').length;
  const pendingDoc = docs.filter((d) => d.status === 'submitted').length;
  const myTasks = kmList.length + realList.length;

  // Registri semua dokumen persetujuan nyata (KM + Realisasi) lintas unit
  const stepInfo = (rec: { steps?: unknown; currentStepIndex?: number }) => {
    const steps = (rec.steps as { label: string }[] | undefined) ?? [];
    const idx = rec.currentStepIndex ?? 0;
    return { stepLabel: steps[idx]?.label ?? '—', stepIndex: idx, stepCount: steps.length };
  };
  const docRows = [
    ...scopeKm.map((k) => ({ id: k.id, jenis: 'Kontrak Manajemen', detail: k.bidang, unitCode: k.unitCode, periodId: k.periodId, status: k.status, reviewer: k.reviewer, history: (k as KontrakManajemen & { history?: unknown }).history, ...stepInfo(k as KontrakManajemen & { steps?: unknown; currentStepIndex?: number }) })),
    ...scopeReal.map((r) => ({ id: r.id, jenis: 'Realisasi Kinerja', detail: (r as RealisasiKinerja & { bidang?: string }).bidang ?? '', unitCode: r.unitCode, periodId: r.periodId, status: r.status, reviewer: r.reviewer, history: (r as RealisasiKinerja & { history?: unknown }).history, ...stepInfo(r as RealisasiKinerja & { steps?: unknown; currentStepIndex?: number }) })),
  ];
  const nextApproverLabel = (status: string, stepLabel: string): string => {
    if (status === 'approved') return '✓ Disahkan GM';
    if (status === 'ready') return 'Menunggu konsolidasi & GM';
    if (status === 'rejected') return 'Dikembalikan ke konseptor';
    if (status === 'submitted') return stepLabel || '—';
    return '—';
  };

  return (
    <div className="page approvals-page">
      <div className="kpi-strip-grid">
        {[
          { label: 'Total Dokumen', value: totalDoc, color: 'var(--color-accent)' },
          { label: 'Sudah Disetujui', value: approvedDoc, color: 'var(--color-success)' },
          { label: 'Menunggu Review', value: pendingDoc, color: 'var(--color-warning)' },
          { label: 'Tugas Saya', value: myTasks, color: 'var(--color-info)' },
        ].map((k, i) => (
          <div key={i} className="metric-card" style={{ borderTop: `3px solid ${k.color}` }}>
            <div className="metric-label">{k.label}</div>
            <div className="metric-value" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Review Usulan Kontrak Manajemen — hanya untuk Asman ke atas */}
      {canReview && (
        <FoldCard
          id="card-km"
          highlight={highlight === 'km'}
          accent="var(--color-accent)"
          icon={<FileSignature size={14} />}
          title="Usulan Kontrak Manajemen Menunggu Review"
          right={<span className="status-pill" style={{ background: 'var(--color-accent-tint)', color: 'var(--color-accent)', fontWeight: 'bold' }}>{kmList.length} Usulan</span>}
        >
          {kmList.length === 0 ? (
            <div className="card-body"><EmptyState title="Tidak ada usulan" message="Belum ada usulan kontrak manajemen yang menunggu review." /></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table compact">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Bidang</th>
                    <th>Pengirim</th>
                    <th>KPI</th>
                    <th>Jenjang Persetujuan</th>
                    <th>SLA</th>
                    <th>Tanggal</th>
                    <th style={{ width: 260 }}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {kmList.map((k) => {
                    const kk = k as KontrakManajemen & { steps?: { label: string }[]; currentStepIndex?: number; stepLabel?: string };
                    const ksteps = kk.steps ?? [];
                    const kci = kk.currentStepIndex ?? 0;
                    const kIsLast = kci >= ksteps.length - 1;
                    const kPrev = ksteps[kci - 1]?.label;
                    return (
                    <Fragment key={k.id}>
                      <tr>
                        <td style={{ fontWeight: 600 }}>{UNIT_NAMES[k.unitCode] ?? k.unitCode}</td>
                        <td>{k.bidang}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{k.submitter}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setKmExpanded(kmExpanded === k.id ? null : k.id)}
                          >
                            {k.kpiItems.length} indikator <ChevronDown size={12} style={{ transform: kmExpanded === k.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                          </button>
                        </td>
                        <td style={{ minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                            {ksteps.map((_, idx) => (
                              <div key={idx} title={ksteps[idx]?.label} style={{
                                width: 16, height: 16, borderRadius: '50%', fontSize: 8, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: idx < kci ? 'var(--color-success)' : idx === kci ? 'var(--color-accent)' : 'var(--color-surface-2)',
                                color: idx <= kci ? '#fff' : 'var(--color-text-muted)',
                              }}>{idx < kci ? '✓' : idx + 1}</div>
                            ))}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--color-accent)', fontWeight: 600 }}>
                            Langkah {kci}/{ksteps.length - 1}: {kk.stepLabel ?? ksteps[kci]?.label ?? '—'}
                          </div>
                        </td>
                        <td><SlaBadge days={(k as KontrakManajemen & { slaRemainingDays?: number }).slaRemainingDays} /></td>
                        <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(k.submittedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </td>
                        <td>
                          {kmTarget === k.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                              <textarea
                                className="form-textarea"
                                style={{ fontSize: 'var(--text-xs)', minHeight: 48 }}
                                placeholder="Catatan/komentar (wajib untuk setiap keputusan)"
                                value={kmNote}
                                onChange={(e) => setKmNote(e.target.value)}
                              />
                              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: '#fff' }} disabled={kmBusy} onClick={() => handleKmReview(k.id, 'approve')}>
                                  <CheckCircle size={12} /> {kIsLast ? 'Setujui (Selesai → Bundle)' : 'Setujui & Teruskan'}
                                </button>
                                <button className="btn btn-sm" style={{ background: 'var(--color-danger)', color: '#fff' }} disabled={kmBusy} onClick={() => handleKmReview(k.id, 'reject', 'konseptor')} title="Kembalikan ke konseptor untuk revisi">
                                  <XCircle size={12} /> Kembalikan ke Konseptor
                                </button>
                                {kci >= 2 && (
                                  <button className="btn btn-sm" style={{ background: 'var(--color-warning)', color: '#fff' }} disabled={kmBusy} onClick={() => handleKmReview(k.id, 'reject', 'previous')}>
                                    <XCircle size={12} /> Kembalikan ke {kPrev ?? 'langkah sebelumnya'}
                                  </button>
                                )}
                                <button className="btn btn-ghost btn-sm" onClick={() => { setKmTarget(null); setKmNote(''); }}>Batal</button>
                              </div>
                            </div>
                          ) : (
                            <button className="btn btn-secondary btn-sm" onClick={() => { setKmTarget(k.id); setKmNote(''); }}>
                              <Clock size={12} /> Tinjau
                            </button>
                          )}
                        </td>
                      </tr>
                      {kmExpanded === k.id && (
                        <tr>
                          <td colSpan={8} style={{ background: 'var(--color-surface-2)', padding: 0 }}>
                            <table className="data-table compact" style={{ margin: 0 }}>
                              <thead>
                                <tr>
                                  <th>No</th><th>Indikator Kinerja</th><th>Formula</th><th>Satuan</th>
                                  <th className="num">Bobot</th><th>Target Sem I</th>{`Target Tahun ${new Date().getFullYear()}`}
                                </tr>
                              </thead>
                              <tbody>
                                {(k.kpiItems as Record<string, string>[]).map((it, idx) => (
                                  <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{it.indikator}</td>
                                    <td>{it.formula}</td>
                                    <td>{it.satuan}</td>
                                    <td className="num">{it.bobot}</td>
                                    <td>{it.target}</td>
                                    <td>{it.target2}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </FoldCard>
      )}

      {/* Bundle Konsolidasi KM Tahunan — persetujuan akhir GM */}
      {canReview && kmBundle && (
        <FoldCard
          accent="var(--color-accent)"
          icon={<Layers size={14} />}
          title={`Konsolidasi Kontrak Manajemen Tahunan${kmBundle.year ? ' — ' + kmBundle.year : ''}`}
          right={<span className="status-pill" style={{ fontWeight: 700 }}>{kmBundle.readyCount}/{kmBundle.total} siap</span>}
        >
          <div className="table-wrap">
            <table className="data-table compact">
              <thead><tr><th>Unit</th><th>Bidang</th><th>Penyusun</th><th>Status</th><th>Review</th></tr></thead>
              <tbody>
                {kmBundle.components.length === 0 && (
                  <tr><td colSpan={5}><EmptyState title="Belum ada KM" message="Belum ada KM yang masuk konsolidasi tahun ini." /></td></tr>
                )}
                {kmBundle.components.map((c) => (
                  <Fragment key={c.id}>
                  <tr>
                    <td style={{ fontWeight: 600 }}>{UNIT_NAMES[c.unitCode] ?? c.unitCode}</td>
                    <td style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{c.bidang}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{c.submitter}</td>
                    <td>
                      <span className={`status-pill ${c.status === 'approved' ? 'completed' : c.status === 'ready' ? 'at-risk' : 'in-review'}`} style={{ fontSize: 10 }}>
                        {c.status === 'ready' ? 'Siap (lolos SM RPC)' : c.status === 'approved' ? 'Disahkan GM' : c.status === 'submitted' ? 'Dalam proses review' : c.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setKmBundleExpanded(kmBundleExpanded === c.id ? null : c.id)} title="Tinjau detail KPI & riwayat">
                        <ClipboardCheck size={12} /> {(c.kpiItems?.length ?? 0)} KPI
                        <ChevronDown size={12} style={{ transform: kmBundleExpanded === c.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                      </button>
                    </td>
                  </tr>
                  {kmBundleExpanded === c.id && (
                    <tr>
                      <td colSpan={5} style={{ background: 'var(--color-surface-2)', padding: 0 }}>
                        <div style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 11, color: 'var(--color-text-muted)' }}>
                          Penanggung Jawab: <strong style={{ color: 'var(--color-text)' }}>{c.holder ?? '—'}</strong>
                        </div>
                        <table className="data-table compact" style={{ margin: 0 }}>
                          <thead><tr><th>No</th><th>Indikator Kinerja</th><th>Formula</th><th>Satuan</th><th className="num">Bobot</th><th>Target Sem I</th><th>{`Target ${new Date().getFullYear()}`}</th></tr></thead>
                          <tbody>
                            {(c.kpiItems ?? []).map((it, idx) => (
                              <tr key={idx}>
                                <td>{idx + 1}</td><td>{it.indikator}</td><td>{it.formula}</td><td>{it.satuan}</td>
                                <td className="num">{it.bobot}</td><td>{it.target}</td><td>{it.target2}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {user?.role === 'GM' && kmBundle.status !== 'approved' && (
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {!kmBundle.canApprove && kmBundle.total > 0 && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)' }}>
                  Belum semua KM "siap" — GM dapat mengesahkan setelah seluruh KM lolos hingga SM Perencanaan & PC.
                </div>
              )}
              <textarea className="form-textarea" style={{ fontSize: 'var(--text-xs)', minHeight: 48 }} placeholder="Catatan pengesahan/penolakan bundle KM (wajib)" value={kmBundleNote} onChange={(e) => setKmBundleNote(e.target.value)} />
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: '#fff' }} disabled={kmBundleBusy || !kmBundle.canApprove} onClick={() => handleKmBundleReview('approve')}>
                  <CheckCircle size={12} /> Sahkan Seluruh KM (Final)
                </button>
                <button className="btn btn-sm" style={{ background: 'var(--color-danger)', color: '#fff' }} disabled={kmBundleBusy || kmBundle.total === 0} onClick={() => handleKmBundleReview('reject')}>
                  <XCircle size={12} /> Kembalikan Seluruh Bundle
                </button>
              </div>
            </div>
          )}
          {kmBundle.status === 'approved' && (
            <div className="card-body" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)' }}>
              ✓ Bundle KM tahun ini telah disahkan penuh oleh General Manager.
            </div>
          )}
        </FoldCard>
      )}

      {/* Review Realisasi Kinerja Bulanan — hanya untuk Asman ke atas */}
      {canReview && (
        <FoldCard
          id="card-realisasi"
          highlight={highlight === 'real'}
          accent="var(--color-info)"
          icon={<ClipboardCheck size={14} />}
          title="Realisasi Kinerja Bulanan Menunggu Review"
          right={<span className="status-pill" style={{ background: 'var(--color-info-tint)', color: 'var(--color-info)', fontWeight: 'bold' }}>{realList.length} Realisasi</span>}
        >
          {realList.length === 0 ? (
            <div className="card-body"><EmptyState title="Tidak ada realisasi" message="Belum ada realisasi kinerja yang menunggu review Anda." /></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table compact">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Bidang</th>
                    <th>Pengirim</th>
                    <th>Indikator</th>
                    <th>Jenjang Persetujuan</th>
                    <th>SLA</th>
                    <th>Tanggal</th>
                    <th style={{ width: 260 }}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {realList.map((rl) => {
                    const entries = Object.values(rl.values ?? {});
                    const rr = rl as RealisasiKinerja & { steps?: { label: string }[]; currentStepIndex?: number; stepLabel?: string };
                    const steps = rr.steps ?? [];
                    const ci = rr.currentStepIndex ?? 0;
                    const stepCount = steps.length;
                    const isLastStep = ci >= stepCount - 1;
                    const prevLabel = steps[ci - 1]?.label;
                    return (
                      <Fragment key={rl.id}>
                        <tr>
                          <td style={{ fontWeight: 600 }}>{UNIT_NAMES[rl.unitCode] ?? rl.unitCode}</td>
                          <td style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{(rl as RealisasiKinerja & { bidang?: string }).bidang ?? '—'}</td>
                          <td style={{ color: 'var(--color-text-muted)' }}>{rl.submitter}</td>
                          <td>
                            <button className="btn btn-ghost btn-sm" onClick={() => setRealExpanded(realExpanded === rl.id ? null : rl.id)}>
                              {entries.length} indikator <ChevronDown size={12} style={{ transform: realExpanded === rl.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                            </button>
                          </td>
                          <td style={{ minWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                              {steps.map((_, idx) => (
                                <div key={idx} title={steps[idx]?.label} style={{
                                  width: 16, height: 16, borderRadius: '50%', fontSize: 8, fontWeight: 700,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: idx < ci ? 'var(--color-success)' : idx === ci ? 'var(--color-info)' : 'var(--color-surface-2)',
                                  color: idx <= ci ? '#fff' : 'var(--color-text-muted)',
                                }}>{idx < ci ? '✓' : idx + 1}</div>
                              ))}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--color-info)', fontWeight: 600 }}>
                              Langkah {ci}/{stepCount - 1}: {rr.stepLabel ?? steps[ci]?.label ?? '—'}
                            </div>
                          </td>
                          <td><SlaBadge days={(rl as RealisasiKinerja & { slaRemainingDays?: number }).slaRemainingDays} /></td>
                          <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                            {new Date(rl.submittedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                          </td>
                          <td>
                            {realTarget === rl.id ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <textarea
                                  className="form-textarea"
                                  style={{ fontSize: 'var(--text-xs)', minHeight: 48 }}
                                  placeholder="Catatan/komentar (wajib untuk setiap keputusan)"
                                  value={realNote}
                                  onChange={(e) => setRealNote(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                  <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: '#fff' }} disabled={realBusy} onClick={() => handleRealReview(rl.id, 'approve')}>
                                    <CheckCircle size={12} /> {isLastStep ? 'Setujui (Selesai → Bundle)' : 'Setujui & Teruskan'}
                                  </button>
                                  <button className="btn btn-sm" style={{ background: 'var(--color-danger)', color: '#fff' }} disabled={realBusy} onClick={() => handleRealReview(rl.id, 'reject', 'konseptor')}>
                                    <XCircle size={12} /> Kembalikan ke Konseptor
                                  </button>
                                  {ci >= 2 && (
                                    <button className="btn btn-sm" style={{ background: 'var(--color-warning)', color: '#fff' }} disabled={realBusy} onClick={() => handleRealReview(rl.id, 'reject', 'previous')}>
                                      <XCircle size={12} /> Kembalikan ke {prevLabel ?? 'langkah sebelumnya'}
                                    </button>
                                  )}
                                  <button className="btn btn-ghost btn-sm" onClick={() => { setRealTarget(null); setRealNote(''); }}>Batal</button>
                                </div>
                              </div>
                            ) : (
                              <button className="btn btn-secondary btn-sm" onClick={() => { setRealTarget(rl.id); setRealNote(''); }}>
                                <Clock size={12} /> Tinjau
                              </button>
                            )}
                          </td>
                        </tr>
                        {realExpanded === rl.id && (
                          <tr>
                            <td colSpan={8} style={{ background: 'var(--color-surface-2)', padding: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)' }}>
                                {realEditId === rl.id ? (
                                  <>
                                    <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: '#fff' }} disabled={realBusy} onClick={() => saveEditReal(rl)}>
                                      <CheckCircle size={12} /> Simpan Nilai
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setRealEditId(null)}>Batal Edit</button>
                                  </>
                                ) : (
                                  <button className="btn btn-secondary btn-sm" onClick={() => startEditReal(rl)} title="Edit nilai realisasi pada tahap Anda">
                                    <Pencil size={12} /> Edit Nilai
                                  </button>
                                )}
                              </div>
                              <table className="data-table compact" style={{ margin: 0 }}>
                                <thead>
                                  <tr><th>No</th><th>Indikator</th><th>Satuan</th><th className="num">Bobot</th><th className="num">Target</th><th className="num">Realisasi</th></tr>
                                </thead>
                                <tbody>
                                  {Object.entries(rl.values ?? {}).map(([key, vRaw], idx) => {
                                    const it = vRaw as { indikator?: string; satuan?: string; bobot?: unknown; target?: unknown; realisasi?: unknown };
                                    const editing = realEditId === rl.id;
                                    return (
                                      <tr key={key}>
                                        <td>{idx + 1}</td>
                                        <td>{it.indikator ?? '—'}</td>
                                        <td>{it.satuan ?? '—'}</td>
                                        <td className="num">{String(it.bobot ?? '—')}</td>
                                        <td className="num">{String(it.target ?? '—')}</td>
                                        <td className="num" style={{ fontWeight: 700 }}>
                                          {editing ? (
                                            <input
                                              type="text"
                                              className="form-input form-input-sm"
                                              style={{ width: 90, textAlign: 'right' }}
                                              value={editValues[key] ?? ''}
                                              onChange={(e) => setEditValues((v) => ({ ...v, [key]: e.target.value }))}
                                            />
                                          ) : (
                                            String(it.realisasi ?? '—')
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </FoldCard>
      )}

      {/* Bundle Konsolidasi Realisasi — persetujuan akhir GM (sekali untuk seluruh periode) */}
      {canReview && bundle && (
        <FoldCard
          accent="var(--color-brand, #125D72)"
          icon={<Layers size={14} />}
          title={`Konsolidasi Realisasi Periode${bundle.period?.label ? ' — ' + bundle.period.label : ''}`}
          right={<span className="status-pill" style={{ fontWeight: 700 }}>{bundle.readyCount}/{bundle.total} siap</span>}
        >
          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr><th>Unit</th><th>Bidang</th><th>Penyusun</th><th>Status</th></tr>
              </thead>
              <tbody>
                {bundle.components.length === 0 && (
                  <tr><td colSpan={4}><EmptyState title="Belum ada realisasi" message="Belum ada realisasi yang masuk konsolidasi periode ini." /></td></tr>
                )}
                {bundle.components.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{UNIT_NAMES[c.unitCode] ?? c.unitCode}</td>
                    <td style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{c.bidang}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{c.submitter}</td>
                    <td>
                      <span className={`status-pill ${c.status === 'approved' ? 'completed' : c.status === 'ready' ? 'at-risk' : 'in-review'}`} style={{ fontSize: 10 }}>
                        {c.status === 'ready' ? 'Siap (lolos SM RPC)' : c.status === 'approved' ? 'Disetujui GM' : c.status === 'submitted' ? 'Dalam proses review' : c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {user?.role === 'GM' && bundle.status !== 'approved' && (
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {!bundle.canApprove && bundle.total > 0 && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)' }}>
                  Belum semua komponen "siap" — GM dapat menyetujui setelah seluruh realisasi lolos hingga SM Perencanaan & PC.
                </div>
              )}
              <textarea
                className="form-textarea"
                style={{ fontSize: 'var(--text-xs)', minHeight: 48 }}
                placeholder="Catatan persetujuan/penolakan bundle (wajib)"
                value={bundleNote}
                onChange={(e) => setBundleNote(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: '#fff' }} disabled={bundleBusy || !bundle.canApprove} onClick={() => handleBundleReview('approve')}>
                  <CheckCircle size={12} /> Setujui Seluruh Bundle (Final)
                </button>
                <button className="btn btn-sm" style={{ background: 'var(--color-danger)', color: '#fff' }} disabled={bundleBusy || bundle.total === 0} onClick={() => handleBundleReview('reject')}>
                  <XCircle size={12} /> Kembalikan Seluruh Bundle
                </button>
              </div>
            </div>
          )}
          {bundle.status === 'approved' && (
            <div className="card-body" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)' }}>
              ✓ Bundle periode ini telah disetujui penuh oleh General Manager.
            </div>
          )}
        </FoldCard>
      )}

      {/* Workflow Timeline Card */}
      <FoldCard
        icon={<CalendarClock size={14} />}
        title="Timeline Pelaporan Bulanan"
        right={<span className="card-meta">5 Fase siklus bulanan</span>}
        defaultOpen={false}
      >
        <div className="card-body" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 'var(--space-5)', overflowX: 'auto', paddingBottom: 4 }}>
            {WORKFLOW_STATIC.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 80 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: FASE_ACCENT[i], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{w.stage}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: FASE_ACCENT[i], marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap' }}>{w.fase}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', whiteSpace: 'nowrap' }}>{w.deadline}</div>
                </div>
                {i < WORKFLOW_STATIC.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: `linear-gradient(to right, ${FASE_ACCENT[i]}, ${FASE_ACCENT[i + 1]})`, minWidth: 16 }} />
                )}
              </div>
            ))}
          </div>

          <div className="three-col-grid" style={{ marginBottom: 0 }}>
            {WORKFLOW_STATIC.map((w, i) => (
              <div key={i} style={{ border: '1px solid var(--color-border)', borderTop: `3px solid ${FASE_ACCENT[i]}`, borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: FASE_ACCENT[i], textTransform: 'uppercase', letterSpacing: '0.06em' }}>{w.fase} · {w.deadline}</span>
                  <span style={{ fontSize: 10, background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', padding: '1px 7px', borderRadius: 8 }}>SLA {w.slaHours}j</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>{w.action}</div>
                <div style={{ fontSize: 10, color: 'var(--color-accent)', marginBottom: 'var(--space-2)' }}>{STAGES[w.stage]}</div>
                <ul style={{ margin: 0, paddingLeft: 14, fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1.75 }}>
                  {w.checklist.map((c, ci) => <li key={ci}>{c}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </FoldCard>

      {/* Semua Dokumen Persetujuan — data nyata dari dokumen yang diinput */}
      <FoldCard
        icon={<FileText size={14} />}
        title="Semua Dokumen Persetujuan"
        right={<span className="card-meta">{docRows.length} dokumen · KM + Realisasi</span>}
      >
        <div className="table-wrap">
          <table className="data-table compact">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Jenis Dokumen</th>
                <th>Periode</th>
                <th>Jenjang</th>
                <th>Status</th>
                <th>Menunggu Review</th>
                <th>Komentar</th>
              </tr>
            </thead>
            <tbody>
              {docRows.map((d) => (
                <Fragment key={d.id}>
                <tr>
                  <td style={{ fontWeight: 600 }}>{UNIT_NAMES[d.unitCode] ?? d.unitCode}</td>
                  <td>
                    {d.jenis}
                    {d.detail ? <span style={{ color: 'var(--color-text-muted)' }}> · {d.detail}</span> : null}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{periodMap[d.periodId] ?? '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {d.status === 'approved' ? (
                      <span style={{ fontSize: 10, color: 'var(--color-success)', fontWeight: 600 }}>✓ Selesai ({d.stepCount}/{d.stepCount})</span>
                    ) : d.status === 'ready' ? (
                      <span style={{ fontSize: 10, color: 'var(--color-warning)', fontWeight: 600 }}>Lolos rantai → bundle</span>
                    ) : d.status === 'rejected' ? (
                      <span style={{ fontSize: 10, color: 'var(--color-danger)' }}>Dikembalikan</span>
                    ) : (
                      <span style={{ fontSize: 10, color: 'var(--color-accent)', fontWeight: 600 }}>Langkah {d.stepIndex}/{Math.max(0, d.stepCount - 1)}</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${DOC_STATUS_PILL[d.status] ?? 'in-review'}`} style={{ fontSize: 10 }}>
                      {DOC_STATUS_LABEL[d.status] ?? d.status}
                    </span>
                  </td>
                  <td style={{ color: d.status === 'approved' ? 'var(--color-success)' : 'var(--color-text-muted)', fontSize: 11 }}>
                    {nextApproverLabel(d.status, d.stepLabel)}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDocExpanded(docExpanded === d.id ? null : d.id)} title="Lihat riwayat persetujuan & komentar">
                      <MessageSquare size={12} /> {Array.isArray(d.history) ? (d.history as unknown[]).length : 0}
                      <ChevronDown size={12} style={{ transform: docExpanded === d.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                    </button>
                  </td>
                </tr>
                {docExpanded === d.id && (
                  <tr>
                    <td colSpan={7} style={{ background: 'var(--color-surface-2)', padding: 0 }}>
                      <ApprovalTimeline history={d.history} />
                    </td>
                  </tr>
                )}
                </Fragment>
              ))}
              {docRows.length === 0 && (
                <tr><td colSpan={7}><EmptyState title="Belum ada dokumen" message="Belum ada Kontrak Manajemen atau Realisasi yang diinput." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </FoldCard>

      {/* RACI Matrix */}
      <FoldCard
        icon={<UsersRound size={14} />}
        title="Matriks RACI"
        right={<span className="card-meta">R=Responsible · A=Accountable · C=Consulted · I=Informed</span>}
        defaultOpen={false}
      >
        <div className="table-wrap">
          <table className="data-table compact">
            <thead>
              <tr>
                <th>Aktivitas</th>
                <th style={{ textAlign: 'center' }}>Staff</th>
                <th style={{ textAlign: 'center' }}>Asman</th>
                <th style={{ textAlign: 'center' }}>Manajer</th>
                <th style={{ textAlign: 'center' }}>Sr. Manajer</th>
                <th style={{ textAlign: 'center' }}>GM</th>
              </tr>
            </thead>
            <tbody>
              {[
                { activity: 'Input Data Realisasi', values: ['R', 'I', 'I', 'I', 'I'] },
                { activity: 'Review Kelengkapan Data', values: ['C', 'R/A', 'I', 'I', 'I'] },
                { activity: 'Approval Laporan Bidang', values: ['I', 'C', 'R/A', 'I', 'I'] },
                { activity: 'Review Konsolidasi', values: ['I', 'I', 'C', 'R/A', 'I'] },
                { activity: 'Final Approval & Publikasi', values: ['I', 'I', 'I', 'C', 'R/A'] },
                { activity: 'Audit & Monitoring', values: ['I', 'I', 'C', 'C', 'A'] },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{row.activity}</td>
                  {row.values.map((v, vi) => (
                    <td key={vi} style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', width: 28, height: 20, borderRadius: 4, lineHeight: '20px', textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 700,
                        background: v.startsWith('R') ? 'var(--color-accent-tint)' : v === 'A' ? 'rgba(16,185,129,0.12)' : v === 'C' ? 'rgba(59,130,246,0.12)' : 'var(--color-surface-2)',
                        color: v.startsWith('R') ? 'var(--color-accent)' : v === 'A' ? 'var(--color-success)' : v === 'C' ? 'var(--color-info)' : 'var(--color-text-subtle)',
                      }}>
                        {v}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FoldCard>
    </div>
  );
}
