import { useEffect, useState } from 'react';
import { workflowKm } from '../lib/api';
import type { KMDocument } from '../lib/types';
import { LineChart } from 'lucide-react';
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

export function WorkflowKmRealisasiPage() {
  const [docs, setDocs] = useState<KMDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    workflowKm.realisasi()
      .then(setDocs)
      .catch((e) => setError(e?.message ?? 'Gagal memuat data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="page-header"><h1 className="page-title">Proses Realisasi KM</h1></div>
        <div className="kpi-strip-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="metric-card" style={{ minHeight: 80 }}>
              <div className="skeleton-line skeleton" style={{ width: '60%', height: 12 }} />
              <div className="skeleton-line skeleton" style={{ width: '30%', height: 28, marginTop: 8 }} />
            </div>
          ))}
        </div>
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  if (error) return <ErrorState title="Gagal memuat dokumen realisasi" message={error} />;

  const approved = docs.filter(d => d.status === 'APPROVED' || d.status === 'SIGNED_GM').length;
  const inReview = docs.filter(d => d.status.startsWith('IN_REVIEW')).length;
  const returned = docs.filter(d => d.status === 'RETURNED').length;

  return (
    <div className="page workflow-km-page">
      <div className="kpi-strip-grid">
        {[
          { label: 'Total Dokumen WF-3', value: docs.length, color: 'var(--color-accent)' },
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

      <div className="status-banner success">
        <LineChart size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>WF-3 — Monitoring Realisasi KPI Kontrak Manajemen</strong>
          <div style={{ fontSize: 10, marginTop: 2, opacity: 0.8 }}>Dokumen WF-3 berisi laporan realisasi KPI KM yang dimonitor setiap bulan.</div>
        </div>
      </div>

      <div className="card p-0">
        <div className="card-header compact">
          <div className="card-title"><LineChart size={14} />Dokumen Realisasi KM (WF-3)</div>
          <span className="card-meta">{docs.length} dokumen</span>
        </div>
        <div className="table-wrap">
          {docs.length === 0 ? (
            <EmptyState title="Belum ada dokumen realisasi WF-3" message="Dokumen akan muncul setelah Staff menginput realisasi." />
          ) : (
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Doc ID</th>
                  <th>Bidang / Unit</th>
                  <th>Pemegang</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>SLA</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => {
                  const cfg = STATUS_CFG[doc.status] ?? { cls: 'in-review', lbl: doc.status };
                  return (
                    <tr key={doc.docId}>
                      <td style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-accent)' }}>{doc.docId}</td>
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
                    </tr>
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
