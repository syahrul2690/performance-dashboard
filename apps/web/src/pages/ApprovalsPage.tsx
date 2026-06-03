import { useEffect, useState, Fragment, type ReactNode } from 'react';
import { approvals as approvalsApi, inputKontrak, inputRealisasi, meta as metaApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';
import type { Report, KontrakManajemen, RealisasiKinerja } from '../lib/types';
import { CheckCircle, XCircle, Clock, CalendarClock, FileText, UsersRound, FileSignature, ChevronDown, ClipboardCheck } from 'lucide-react';
import { SkeletonTable, EmptyState, ErrorState } from '../components/LoadState';

// Kartu yang bisa dilipat (fold-up): klik header untuk buka/tutup isi.
function FoldCard({
  title, icon, right, accent, defaultOpen = true, children,
}: {
  title: string;
  icon?: ReactNode;
  right?: ReactNode;
  accent?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card p-0" style={{ marginBottom: 'var(--space-6)', ...(accent ? { borderTop: `3px solid ${accent}` } : {}) }}>
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
const KM_STAGES = ['Staff', 'Asman', 'Manajer', 'Sr. Manajer', 'GM'];
const KM_FINAL_STAGE = 5;

const DOC_STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', submitted: 'Menunggu Review', approved: 'Disetujui', rejected: 'Dikembalikan',
};
const DOC_STATUS_PILL: Record<string, string> = {
  draft: 'in-review', submitted: 'needs-revision', approved: 'completed', rejected: 'delayed',
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
  const canReview = !!user && user.role !== 'STAFF';
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

  // Semua dokumen yang diinput manual (KM + Realisasi) — untuk kartu ringkasan & registri
  const [allKm, setAllKm] = useState<KontrakManajemen[]>([]);
  const [allReal, setAllReal] = useState<RealisasiKinerja[]>([]);
  const [periodMap, setPeriodMap] = useState<Record<string, string>>({});

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

  const handleRealReview = async (id: string, action: 'approve' | 'reject', returnTo?: 'konseptor' | 'previous') => {
    if (action === 'reject' && !realNote) { alert('Isi catatan saat mengembalikan realisasi'); return; }
    setRealBusy(true);
    try {
      await inputRealisasi.review(id, action, realNote || undefined, returnTo);
      setRealTarget(null); setRealNote('');
      loadReal();
      refreshNotif();
    } catch (e) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal memproses review');
    } finally {
      setRealBusy(false);
    }
  };

  const handleKmReview = async (id: string, action: 'approve' | 'reject', returnTo?: 'konseptor' | 'previous') => {
    if (action === 'reject' && !kmNote) { alert('Isi catatan saat mengembalikan usulan'); return; }
    setKmBusy(true);
    try {
      await inputKontrak.review(id, action, kmNote || undefined, returnTo);
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

  // Ringkasan dari dokumen yang DIINPUT manual ke sistem (Kontrak Manajemen + Realisasi Kinerja)
  const docs: Array<{ status: string }> = [...allKm, ...allReal];
  const totalDoc = docs.length;
  const approvedDoc = docs.filter((d) => d.status === 'approved').length;
  const pendingDoc = docs.filter((d) => d.status === 'submitted').length;
  const myTasks = kmList.length + realList.length;

  // Registri semua dokumen persetujuan nyata (KM + Realisasi) lintas unit
  const docRows = [
    ...allKm.map((k) => ({ id: k.id, jenis: 'Kontrak Manajemen', detail: k.bidang, unitCode: k.unitCode, periodId: k.periodId, status: k.status, currentStage: k.currentStage, reviewer: k.reviewer })),
    ...allReal.map((r) => ({ id: r.id, jenis: 'Realisasi Kinerja', detail: '', unitCode: r.unitCode, periodId: r.periodId, status: r.status, currentStage: r.currentStage, reviewer: r.reviewer })),
  ];
  const nextApproverLabel = (status: string, stage: number): string => {
    if (status === 'approved') return '✓ Selesai';
    if (status === 'rejected') return 'Dikembalikan ke konseptor';
    if (status === 'submitted') return KM_STAGES[stage - 1] ?? '—';
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
                    <th>Tanggal</th>
                    <th style={{ width: 260 }}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {kmList.map((k) => (
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
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {KM_STAGES.map((label, idx) => {
                              const stage = idx + 1;
                              const done = stage < k.currentStage;
                              const current = stage === k.currentStage;
                              return (
                                <div key={stage} title={label} style={{
                                  width: 22, height: 22, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: done ? 'var(--color-success)' : current ? 'var(--color-accent)' : 'var(--color-surface-2)',
                                  color: done || current ? '#fff' : 'var(--color-text-muted)',
                                }}>
                                  {done ? '✓' : stage}
                                </div>
                              );
                            })}
                            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 2 }}>{KM_STAGES[k.currentStage - 1]}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(k.submittedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </td>
                        <td>
                          {kmTarget === k.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                              <textarea
                                className="form-textarea"
                                style={{ fontSize: 'var(--text-xs)', minHeight: 48 }}
                                placeholder="Catatan (wajib untuk menolak)"
                                value={kmNote}
                                onChange={(e) => setKmNote(e.target.value)}
                              />
                              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: '#fff' }} disabled={kmBusy} onClick={() => handleKmReview(k.id, 'approve')}>
                                  <CheckCircle size={12} /> {k.currentStage >= KM_FINAL_STAGE ? 'Setujui (Final)' : 'Setujui & Teruskan'}
                                </button>
                                <button className="btn btn-sm" style={{ background: 'var(--color-danger)', color: '#fff' }} disabled={kmBusy} onClick={() => handleKmReview(k.id, 'reject', 'konseptor')} title="Kembalikan ke Staff untuk revisi isi (proses diulang dari Asman)">
                                  <XCircle size={12} /> Kembalikan ke Konseptor
                                </button>
                                {k.currentStage >= 3 && (
                                  <button className="btn btn-sm" style={{ background: 'var(--color-warning)', color: '#fff' }} disabled={kmBusy} onClick={() => handleKmReview(k.id, 'reject', 'previous')} title={`Kembalikan 1 tahap ke ${KM_STAGES[k.currentStage - 2]} untuk klarifikasi`}>
                                    <XCircle size={12} /> Kembalikan ke {KM_STAGES[k.currentStage - 2]}
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
                          <td colSpan={7} style={{ background: 'var(--color-surface-2)', padding: 0 }}>
                            <table className="data-table compact" style={{ margin: 0 }}>
                              <thead>
                                <tr>
                                  <th>No</th><th>Indikator Kinerja</th><th>Formula</th><th>Satuan</th>
                                  <th className="num">Bobot</th><th>Target Sem I</th><th>Target Tahun</th>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </FoldCard>
      )}

      {/* Review Realisasi Kinerja Bulanan — hanya untuk Asman ke atas */}
      {canReview && (
        <FoldCard
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
                    <th>Pengirim</th>
                    <th>Indikator</th>
                    <th>Jenjang Persetujuan</th>
                    <th>Tanggal</th>
                    <th style={{ width: 260 }}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {realList.map((rl) => {
                    const entries = Object.values(rl.values ?? {});
                    return (
                      <Fragment key={rl.id}>
                        <tr>
                          <td style={{ fontWeight: 600 }}>{UNIT_NAMES[rl.unitCode] ?? rl.unitCode}</td>
                          <td style={{ color: 'var(--color-text-muted)' }}>{rl.submitter}</td>
                          <td>
                            <button className="btn btn-ghost btn-sm" onClick={() => setRealExpanded(realExpanded === rl.id ? null : rl.id)}>
                              {entries.length} indikator <ChevronDown size={12} style={{ transform: realExpanded === rl.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              {KM_STAGES.map((label, idx) => {
                                const stage = idx + 1;
                                const done = stage < rl.currentStage;
                                const current = stage === rl.currentStage;
                                return (
                                  <div key={stage} title={label} style={{
                                    width: 22, height: 22, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: done ? 'var(--color-success)' : current ? 'var(--color-info)' : 'var(--color-surface-2)',
                                    color: done || current ? '#fff' : 'var(--color-text-muted)',
                                  }}>{done ? '✓' : stage}</div>
                                );
                              })}
                              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 2 }}>{KM_STAGES[rl.currentStage - 1]}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                            {new Date(rl.submittedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                          </td>
                          <td>
                            {realTarget === rl.id ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <textarea
                                  className="form-textarea"
                                  style={{ fontSize: 'var(--text-xs)', minHeight: 48 }}
                                  placeholder="Catatan (wajib untuk menolak)"
                                  value={realNote}
                                  onChange={(e) => setRealNote(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                  <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: '#fff' }} disabled={realBusy} onClick={() => handleRealReview(rl.id, 'approve')}>
                                    <CheckCircle size={12} /> {rl.currentStage >= KM_FINAL_STAGE ? 'Setujui (Final)' : 'Setujui & Teruskan'}
                                  </button>
                                  <button className="btn btn-sm" style={{ background: 'var(--color-danger)', color: '#fff' }} disabled={realBusy} onClick={() => handleRealReview(rl.id, 'reject', 'konseptor')}>
                                    <XCircle size={12} /> Kembalikan ke Konseptor
                                  </button>
                                  {rl.currentStage >= 3 && (
                                    <button className="btn btn-sm" style={{ background: 'var(--color-warning)', color: '#fff' }} disabled={realBusy} onClick={() => handleRealReview(rl.id, 'reject', 'previous')}>
                                      <XCircle size={12} /> Kembalikan ke {KM_STAGES[rl.currentStage - 2]}
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
                            <td colSpan={6} style={{ background: 'var(--color-surface-2)', padding: 0 }}>
                              <table className="data-table compact" style={{ margin: 0 }}>
                                <thead>
                                  <tr><th>No</th><th>Indikator</th><th>Satuan</th><th className="num">Bobot</th><th className="num">Target</th><th className="num">Realisasi</th></tr>
                                </thead>
                                <tbody>
                                  {entries.map((it, idx) => (
                                    <tr key={idx}>
                                      <td>{idx + 1}</td>
                                      <td>{it.indikator ?? '—'}</td>
                                      <td>{it.satuan ?? '—'}</td>
                                      <td className="num">{it.bobot ?? '—'}</td>
                                      <td className="num">{it.target ?? '—'}</td>
                                      <td className="num" style={{ fontWeight: 700 }}>{it.realisasi ?? '—'}</td>
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
              </tr>
            </thead>
            <tbody>
              {docRows.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{UNIT_NAMES[d.unitCode] ?? d.unitCode}</td>
                  <td>
                    {d.jenis}
                    {d.detail ? <span style={{ color: 'var(--color-text-muted)' }}> · {d.detail}</span> : null}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{periodMap[d.periodId] ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {KM_STAGES.map((label, idx) => {
                        const s = idx + 1;
                        const done = d.status === 'approved' || s < d.currentStage;
                        const current = d.status === 'submitted' && s === d.currentStage;
                        return (
                          <div key={s} title={label} style={{
                            width: 20, height: 20, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: done ? 'var(--color-success)' : current ? 'var(--color-accent)' : 'var(--color-surface-2)',
                            color: done || current ? '#fff' : 'var(--color-text-muted)',
                          }}>{done ? '✓' : s}</div>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${DOC_STATUS_PILL[d.status] ?? 'in-review'}`} style={{ fontSize: 10 }}>
                      {DOC_STATUS_LABEL[d.status] ?? d.status}
                    </span>
                  </td>
                  <td style={{ color: d.status === 'approved' ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {nextApproverLabel(d.status, d.currentStage)}
                  </td>
                </tr>
              ))}
              {docRows.length === 0 && (
                <tr><td colSpan={6}><EmptyState title="Belum ada dokumen" message="Belum ada Kontrak Manajemen atau Realisasi yang diinput." /></td></tr>
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
