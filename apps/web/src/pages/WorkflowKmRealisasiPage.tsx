import { useEffect, useState } from 'react';
import { workflowKm } from '../lib/api';
import type { KMDocument } from '../lib/types';

const STATUS_BADGE: Record<string, string> = {
  IN_REVIEW_C1: 'info', IN_REVIEW_C2: 'info', IN_REVIEW_SM: 'warning',
  APPROVED: 'success', RETURNED: 'danger',
};

export function WorkflowKmRealisasiPage() {
  const [docs, setDocs] = useState<KMDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workflowKm.realisasi().then(setDocs).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat…</div>;

  if (docs.length === 0) {
    return (
      <div className="page workflow-km-page">
        <div className="page-header">
          <h1 className="page-title">Kontrak Manajemen — Realisasi</h1>
          <p className="page-subtitle">Workflow WF-3</p>
        </div>
        <div className="card">
          <div className="empty-state">Belum ada dokumen realisasi WF-3.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page workflow-km-page">
      <div className="page-header">
        <h1 className="page-title">Kontrak Manajemen — Realisasi</h1>
        <p className="page-subtitle">Workflow WF-3</p>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Doc ID</th><th>Bidang/Unit</th><th>Pemegang</th><th>Status</th><th>SLA</th></tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.docId}>
                  <td className="mono">{doc.docId}</td>
                  <td>{doc.bidangUnit}</td>
                  <td>{doc.holder}</td>
                  <td><span className={`badge badge-${STATUS_BADGE[doc.status]}`}>{doc.status}</span></td>
                  <td>{doc.slaRemain != null ? `${doc.slaRemain}h` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
