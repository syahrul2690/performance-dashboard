import { useEffect, useState } from 'react';
import { workflowKm } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { KMDocument } from '../lib/types';
import { FilePlus, CheckCircle, RotateCcw } from 'lucide-react';
import { SkeletonTable, EmptyState, ErrorState } from '../components/LoadState';

const STATUS_CFG: Record<string, { cls: string; lbl: string }> = {
  IN_REVIEW_C1: { cls: 'in-review', lbl: 'IN REVIEW C1' },
  IN_REVIEW_C2: { cls: 'in-review', lbl: 'IN REVIEW C2' },
  IN_REVIEW_SM: { cls: 'at-risk', lbl: 'IN REVIEW SM' },
  APPROVED:     { cls: 'completed', lbl: 'APPROVED' },
  SIGNED_GM:   { cls: 'completed', lbl: 'SIGNED GM' },
  RETURNED:    { cls: 'needs-revision', lbl: 'RETURNED' },
  OVERDUE:     { cls: 'needs-revision', lbl: 'OVERDUE' },
  DRAFT:       { cls: 'in-review', lbl: 'DRAFT' },
};

export function WorkflowKmUsulanPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<KMDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const load = () => {
    workflowKm.usulan()
      .then(setDocs)
      .catch((e) => setError(e?.message ?? 'Gagal memuat data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const doReview = async (docId: string, action: 'approve' | 'return') => {
    await workflowKm.review(docId, action, note);
    setReviewing(null); setNote(''); load();
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-header"><h1 className="page-title">Proses Usulan KM</h1></div>
        <div className="kpi-strip-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="metric-card" style={{ minHeight: 80 }}>
              <div className="skeleton-line skeleton" style={{ width: '60%', height: 12 }} />
              <div className="skeleton-line skeleton" style={{ width: '30%', height: 28, marginTop: 8 }} />
            </div>
          ))}
        </div>
        <SkeletonTable rows={5} cols={8} />
      </div>
    );
  }

  if (error) return <ErrorState title="Gagal memuat dokumen usulan" message={error} />;

  const approved = docs.filter(d => d.status === 'APPROVED' || d.status === 'SIGNED_GM').length;
  const inReview = docs.filter(d => d.status.startsWith('IN_REVIEW')).length;
  const returned = docs.filter(d => d.status === 'RETURNED').length;

  return (
    <div className="page workflow-km-page">
      {/* Summary strip */}
      <div className="kpi-strip-grid">
        {[
          { label: 'Total Dokumen', value: docs.length, color: 'var(--color-accent)' },
          { label: 'Disetujui', value: approved, color: 'var(--color-success)' },
          { label: 'Dalam Review', value: inReview, color: 'var(--color-warning)' },
          { label: 'Dikembalikan', value: returned, color: 'var(--color-danger)' },
        ].map((s, i) => (
          <div key={i} className="metric-card" style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="metric-label">{s.label}</div>
            <div className="metric-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Workflow info */}
      <div className="three-col-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { step: 'WF-1', title: 'KPI Proposal Kantor Induk', desc: 'Staff submit → C1/C2 review → SM approve → GM sign', color: 'var(--color-accent)' },
          { step: 'WF-1b', title: 'KPI Proposal UPMK', desc: 'Staff UPMK submit → Manajer → SM consolidate → GM sign', color: 'var(--color-info)' },
          { step: 'WF-2', title: 'Draft Kontrak Manajemen', desc: 'Draft KM disiapkan setelah WF-1 selesai, ditandatangani GM', color: 'var(--color-warning)' },
        ].map((w, i) => (
          <div key={i} style={{ border: '1px solid var(--color-border)', borderTop: `3px solid ${w.color}`, borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: w.color, marginBottom: 4 }}>{w.step}</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4 }}>{w.title}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{w.desc}</div>
          </div>
        ))}
      </div>

      {/* Documents Table */}
      <div className="card p-0">
        <div className="card-header compact">
          <div className="card-title"><FilePlus size={14} />Dokumen KM Usulan (WF-1 / WF-1b / WF-2)</div>
          <span className="card-meta">{docs.length} dokumen</span>
        </div>
        <div className="table-wrap">
          {docs.length === 0 ? (
            <EmptyState title="Belum ada dokumen usulan KM" />
          ) : (
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Doc ID</th>
                  <th>Tipe</th>
                  <th>Bidang / Unit</th>
                  <th>Pemegang</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>SLA</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => {
                  const cfg = STATUS_CFG[doc.status] ?? { cls: 'in-review', lbl: doc.status };
                  const canReview = user && !['APPROVED', 'SIGNED_GM', 'RETURNED'].includes(doc.status);
                  return (
                    <>
                      <tr key={doc.docId}>
                        <td style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-accent)' }}>{doc.docId}</td>
                        <td><span style={{ fontSize: 10, fontWeight: 700, background: 'var(--color-accent-tint)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: 4 }}>{doc.tipe}</span></td>
                        <td>{doc.bidangUnit}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{doc.holder}</td>
                        <td><span className={`status-pill ${cfg.cls}`} style={{ fontSize: 10, padding: '2px 8px' }}>{cfg.lbl}</span></td>
                        <td style={{ fontSize: 10, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{doc.deadline ?? '—'}</td>
                        <td style={{ fontSize: 10 }}>
                          {doc.slaRemain != null ? (
                            <span style={{ color: doc.slaRemain <= 0 ? 'var(--color-danger)' : doc.slaRemain <= 24 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 700 }}>
                              {doc.slaRemain <= 0 ? 'OVERDUE' : `${doc.slaRemain}h`}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          {canReview && (
                            <button className="btn btn-secondary btn-sm" onClick={() => setReviewing(reviewing === doc.docId ? null : doc.docId)} style={{ fontSize: 10 }}>
                              {reviewing === doc.docId ? 'Tutup' : 'Review'}
                            </button>
                          )}
                        </td>
                      </tr>
                      {reviewing === doc.docId && (
                        <tr key={`${doc.docId}-review`} style={{ background: 'var(--color-surface-2)' }}>
                          <td colSpan={8} style={{ padding: 'var(--space-3) var(--space-4)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: 480 }}>
                              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Review: {doc.docId} — {doc.bidangUnit}</div>
                              <textarea
                                className="form-textarea"
                                style={{ fontSize: 'var(--text-xs)', minHeight: 60 }}
                                placeholder="Catatan review (opsional untuk approve, wajib untuk kembalikan)"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                              />
                              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: '#fff' }} onClick={() => doReview(doc.docId, 'approve')}>
                                  <CheckCircle size={12} /> Setujui
                                </button>
                                <button className="btn btn-sm" style={{ background: 'var(--color-danger)', color: '#fff' }} onClick={() => doReview(doc.docId, 'return')}>
                                  <RotateCcw size={12} /> Kembalikan
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setReviewing(null)}>Batal</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
