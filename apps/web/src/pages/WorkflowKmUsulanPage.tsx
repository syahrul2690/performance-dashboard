import { useEffect, useState } from 'react';
import { workflowKm } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { KMDocument } from '../lib/types';

const STATUS_LABELS: Record<string, string> = {
  IN_REVIEW_C1: 'Review C1',
  IN_REVIEW_C2: 'Review C2',
  IN_REVIEW_SM: 'Review SM',
  APPROVED: 'Disetujui',
  RETURNED: 'Dikembalikan',
};

const STATUS_BADGE: Record<string, string> = {
  IN_REVIEW_C1: 'info', IN_REVIEW_C2: 'info', IN_REVIEW_SM: 'warning',
  APPROVED: 'success', RETURNED: 'danger',
};

export function WorkflowKmUsulanPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<KMDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const load = () => {
    workflowKm.usulan().then(setDocs).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const doReview = async (docId: string, action: 'approve' | 'return') => {
    await workflowKm.review(docId, action, note);
    setReviewing(null);
    setNote('');
    load();
  };

  if (loading) return <div className="page-loading">Memuat…</div>;

  return (
    <div className="page workflow-km-page">
      <div className="page-header">
        <h1 className="page-title">Kontrak Manajemen — Usulan</h1>
        <p className="page-subtitle">Workflow WF-1 / WF-1b / WF-2</p>
      </div>

      <div className="km-table-card card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doc ID</th><th>Tipe</th><th>Bidang/Unit</th>
                <th>Pemegang</th><th>Status</th><th>SLA</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <>
                  <tr key={doc.docId}>
                    <td className="mono">{doc.docId}</td>
                    <td><span className="badge badge-info">{doc.tipe}</span></td>
                    <td>{doc.bidangUnit}</td>
                    <td>{doc.holder}</td>
                    <td>
                      <span className={`badge badge-${STATUS_BADGE[doc.status]}`}>
                        {STATUS_LABELS[doc.status] ?? doc.status}
                      </span>
                    </td>
                    <td>{doc.slaRemain != null ? `${doc.slaRemain}h` : '—'}</td>
                    <td>
                      {doc.status !== 'APPROVED' && doc.status !== 'RETURNED' && (
                        <button className="btn btn-sm btn-primary" onClick={() => setReviewing(doc.docId)}>
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                  {reviewing === doc.docId && (
                    <tr key={`${doc.docId}-review`}>
                      <td colSpan={7} className="review-row">
                        <div className="review-panel">
                          <textarea
                            className="form-input"
                            placeholder="Catatan review (opsional)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                          />
                          <div className="action-btns">
                            <button className="btn btn-success btn-sm" onClick={() => doReview(doc.docId, 'approve')}>Setujui</button>
                            <button className="btn btn-danger btn-sm" onClick={() => doReview(doc.docId, 'return')}>Kembalikan</button>
                            <button className="btn-ghost btn-sm" onClick={() => setReviewing(null)}>Batal</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
