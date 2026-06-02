import { useEffect, useState, Fragment } from 'react';
import { approvals as approvalsApi, inputKontrak } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';
import type { Report, KontrakManajemen } from '../lib/types';
import { CheckCircle, XCircle, Clock, CalendarClock, ClipboardList, FileText, UsersRound, FileSignature, ChevronDown } from 'lucide-react';
import { SkeletonTable, EmptyState, ErrorState } from '../components/LoadState';

const STAGES = ['', 'Staff', 'Asman', 'Manajer', 'Sr. Manajer', 'GM'];
// Jenjang persetujuan usulan Kontrak Manajemen: Staff → Asman → Manajer → Sr. Manajer (final)
const KM_STAGES = ['Staff', 'Asman', 'Manajer', 'Sr. Manajer'];
const KM_FINAL_STAGE = 4;
const UNIT_NAMES: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
  UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};
const FASE_ACCENT = ['var(--color-accent)', 'var(--color-info)', 'var(--color-warning)', 'var(--color-success)', 'var(--color-text-muted)'];

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
  const [actionNote, setActionNote] = useState('');
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  // Review usulan Kontrak Manajemen (untuk Asman ke atas)
  const canReview = !!user && user.role !== 'STAFF';
  const [kmList, setKmList] = useState<KontrakManajemen[]>([]);
  const [kmNote, setKmNote] = useState('');
  const [kmTarget, setKmTarget] = useState<string | null>(null);
  const [kmExpanded, setKmExpanded] = useState<string | null>(null);
  const [kmBusy, setKmBusy] = useState(false);

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

  useEffect(() => { load(); loadKm(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKmReview = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !kmNote) { alert('Isi catatan saat mengembalikan usulan'); return; }
    setKmBusy(true);
    try {
      await inputKontrak.review(id, action, kmNote || undefined);
      setKmTarget(null); setKmNote('');
      loadKm();
      refreshNotif();
    } catch (e) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal memproses review');
    } finally {
      setKmBusy(false);
    }
  };

  const handleAdvance = async (id: string) => {
    await approvalsApi.advance(id, actionNote);
    setActionTarget(null); setActionNote(''); load();
  };

  const handleReturn = async (id: string) => {
    if (!actionNote) { alert('Isi catatan revisi'); return; }
    await approvalsApi.return(id, actionNote);
    setActionTarget(null); setActionNote(''); load();
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

  const total = reports.length;
  const approved = reports.filter(r => r.status === 'APPROVED').length;
  const pending = reports.filter(r => r.status !== 'APPROVED').length;
  const myTasks = reports.filter(r => r.canApprove).length;

  return (
    <div className="page approvals-page">
      <div className="kpi-strip-grid">
        {[
          { label: 'Total Laporan', value: total, color: 'var(--color-accent)' },
          { label: 'Sudah Disetujui', value: approved, color: 'var(--color-success)' },
          { label: 'Menunggu Review', value: pending, color: 'var(--color-warning)' },
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
        <div className="card p-0" style={{ marginBottom: 'var(--space-6)', borderTop: '3px solid var(--color-accent)' }}>
          <div className="card-header compact">
            <div className="card-title"><FileSignature size={14} />Usulan Kontrak Manajemen Menunggu Review</div>
            <span className="status-pill" style={{ background: 'var(--color-accent-tint)', color: 'var(--color-accent)', fontWeight: 'bold' }}>
              {kmList.length} Usulan
            </span>
          </div>
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
                              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: '#fff' }} disabled={kmBusy} onClick={() => handleKmReview(k.id, 'approve')}>
                                  <CheckCircle size={12} /> {k.currentStage >= KM_FINAL_STAGE ? 'Setujui (Final)' : 'Setujui & Teruskan'}
                                </button>
                                <button className="btn btn-sm" style={{ background: 'var(--color-danger)', color: '#fff' }} disabled={kmBusy} onClick={() => handleKmReview(k.id, 'reject')}>
                                  <XCircle size={12} /> Kembalikan
                                </button>
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
        </div>
      )}

      {/* Workflow Timeline Card */}
      <div className="card p-0" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header compact">
          <div className="card-title"><CalendarClock size={14} />Timeline Pelaporan Bulanan</div>
          <span className="card-meta">5 Fase siklus bulanan</span>
        </div>
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
      </div>

      {/* Pending Tasks */}
      {myTasks > 0 && (
        <div className="card p-0" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header compact">
            <div className="card-title"><ClipboardList size={14} />Tugas Approval Saya</div>
            <span className="status-pill" style={{ background: 'var(--color-accent-tint)', color: 'var(--color-accent)', fontWeight: 'bold' }}>{myTasks} Tugas</span>
          </div>
          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Periode</th>
                  <th>Fase</th>
                  <th>Status</th>
                  <th>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {reports.filter(r => r.canApprove).map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{UNIT_NAMES[r.unit] ?? r.unit}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{r.periodId}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <div key={s} style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: s < r.currentStage ? 'var(--color-success)' : s === r.currentStage ? FASE_ACCENT[s - 1] : 'var(--color-surface-2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: s <= r.currentStage ? '#fff' : 'var(--color-text-muted)',
                            fontSize: 9, fontWeight: 700,
                          }}>
                            {s < r.currentStage ? '✓' : s}
                          </div>
                        ))}
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{STAGES[r.currentStage]}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${r.status === 'APPROVED' ? 'completed' : r.status === 'NEEDS_REVISION' ? 'needs-revision' : 'in-review'}`} style={{ fontSize: 10 }}>{r.status}</span>
                    </td>
                    <td>
                      {actionTarget === r.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          <textarea
                            className="form-textarea"
                            style={{ fontSize: 'var(--text-xs)', minHeight: 52 }}
                            placeholder="Catatan (opsional untuk approve, wajib untuk revisi)"
                            value={actionNote}
                            onChange={e => setActionNote(e.target.value)}
                          />
                          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: '#fff' }} onClick={() => handleAdvance(r.id)}>
                              <CheckCircle size={12} /> Setujui
                            </button>
                            <button className="btn btn-sm" style={{ background: 'var(--color-danger)', color: '#fff' }} onClick={() => handleReturn(r.id)}>
                              <XCircle size={12} /> Kembalikan
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setActionTarget(null)}>Batal</button>
                          </div>
                        </div>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => setActionTarget(r.id)}>
                          <Clock size={12} /> Tinjau
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Reports */}
      <div className="card p-0" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header compact">
          <div className="card-title"><FileText size={14} />Semua Laporan Kinerja Manajemen</div>
          <span className="card-meta">Riwayat dan status terkini</span>
        </div>
        <div className="table-wrap">
          <table className="data-table compact">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Periode</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Next Approver</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{UNIT_NAMES[r.unit] ?? r.unit}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{r.periodId}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} style={{
                          width: 20, height: 20, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: s < r.currentStage ? 'var(--color-success)' : s === r.currentStage ? 'var(--color-accent)' : 'var(--color-surface-2)',
                          color: s <= r.currentStage ? '#fff' : 'var(--color-text-muted)',
                        }}>
                          {s < r.currentStage ? '✓' : s}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${r.status === 'APPROVED' ? 'completed' : r.status === 'NEEDS_REVISION' ? 'needs-revision' : 'in-review'}`} style={{ fontSize: 10 }}>{r.status}</span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {r.nextApprover ?? <span style={{ color: 'var(--color-success)' }}>✓ Selesai</span>}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={5}><EmptyState title="Tidak ada laporan" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RACI Matrix */}
      <div className="card p-0">
        <div className="card-header compact">
          <div className="card-title"><UsersRound size={14} />Matriks RACI</div>
          <span className="card-meta">R=Responsible · A=Accountable · C=Consulted · I=Informed</span>
        </div>
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
      </div>
    </div>
  );
}
