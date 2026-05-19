import { useEffect, useState } from 'react';
import { approvals as approvalsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Report } from '../lib/types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const STAGES = ['', 'Staff', 'Asman', 'Manajer', 'Sr. Manajer', 'GM'];
const UNIT_NAMES: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
  UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};

export function ApprovalsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNote, setActionNote] = useState('');
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  const load = () => {
    approvalsApi.reports().then(setReports).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdvance = async (id: string) => {
    await approvalsApi.advance(id, actionNote);
    setActionTarget(null);
    setActionNote('');
    load();
  };

  const handleReturn = async (id: string) => {
    if (!actionNote) { alert('Isi catatan revisi'); return; }
    await approvalsApi.return(id, actionNote);
    setActionTarget(null);
    setActionNote('');
    load();
  };

  if (loading) return <div className="page-loading">Memuat…</div>;

  return (
    <div className="page approvals-page">
      <div className="page-header">
        <h1 className="page-title">Persetujuan Laporan</h1>
        <p className="page-subtitle">Workflow Approval 5 Tahap</p>
      </div>

      <div className="approvals-grid">
        {reports.map((r) => (
          <div key={r.id} className={`approval-card card ${r.canApprove ? 'can-approve' : ''}`}>
            <div className="approval-card-header">
              <span className="approval-unit">{UNIT_NAMES[r.unit] ?? r.unit}</span>
              <span className={`badge badge-${r.status === 'APPROVED' ? 'success' : r.status === 'NEEDS_REVISION' ? 'warning' : 'info'}`}>
                {r.status}
              </span>
            </div>

            {/* Progress stages */}
            <div className="stage-track">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`stage-dot ${s < r.currentStage ? 'done' : s === r.currentStage ? 'current' : 'pending'}`}>
                  {s < r.currentStage ? <CheckCircle size={14} /> : s === r.currentStage ? <Clock size={14} /> : <span>{s}</span>}
                  <span className="stage-label">{STAGES[s]}</span>
                </div>
              ))}
            </div>

            {r.nextApprover && (
              <div className="approval-next">Menunggu: <strong>{r.nextApprover}</strong></div>
            )}

            {r.canApprove && user && (
              <div className="approval-actions">
                {actionTarget === r.id ? (
                  <>
                    <textarea
                      className="form-input"
                      placeholder="Catatan (opsional untuk setuju, wajib untuk revisi)"
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      rows={2}
                    />
                    <div className="action-btns">
                      <button className="btn btn-success btn-sm" onClick={() => handleAdvance(r.id)}>
                        <CheckCircle size={14} /> Setujui
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleReturn(r.id)}>
                        <XCircle size={14} /> Kembalikan
                      </button>
                      <button className="btn-ghost btn-sm" onClick={() => setActionTarget(null)}>Batal</button>
                    </div>
                  </>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => setActionTarget(r.id)}>
                    Tinjau
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
