import { useEffect, useState } from 'react';
import { inputRealisasi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import seedData from '../prototype/seed-data.json';

type SeedData = typeof seedData;
type WorkflowKM = (SeedData & { DATA: { workflowKM: { kpiKantorInduk: Array<Record<string, unknown>>; kpiUPMK: Array<Record<string, unknown>> } } })['DATA']['workflowKM'];

const KPI_KI = (seedData as unknown as { DATA: { workflowKM: WorkflowKM } }).DATA?.workflowKM?.kpiKantorInduk ?? [];
const KPI_UPMK = (seedData as unknown as { DATA: { workflowKM: WorkflowKM } }).DATA?.workflowKM?.kpiUPMK ?? [];

export function InputRealisasiPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isKP = user?.unit === 'KP';
  const kpiList = isKP ? KPI_KI : KPI_UPMK;

  useEffect(() => {
    inputRealisasi.history(user?.unit)
      .then(setHistory).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {};
      kpiList.forEach((kpi, i) => { payload[`kpi_${i}`] = { ...kpi, realisasi: values[String(i)] ?? '' }; });
      await inputRealisasi.submit(user.unit, payload);
      alert('Realisasi berhasil dikirim');
      setValues({});
      inputRealisasi.history(user.unit).then(setHistory).catch(() => {});
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Memuat…</div>;

  return (
    <div className="page input-realisasi-page">
      <div className="page-header">
        <h1 className="page-title">Input Realisasi Bulanan</h1>
        <p className="page-subtitle">WF-3 — Unit: {user?.unit}</p>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">KPI Realisasi Bulan Ini</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th><th>Indikator</th><th>Formula</th><th>Satuan</th>
                <th>Bobot</th><th>Target</th><th>Realisasi</th>
              </tr>
            </thead>
            <tbody>
              {kpiList.map((kpi, i) => (
                <tr key={i}>
                  <td>{(kpi.no as number) ?? i + 1}</td>
                  <td>{kpi.indikator as string}</td>
                  <td className="text-muted">{kpi.formula as string}</td>
                  <td>{kpi.satuan as string}</td>
                  <td>{kpi.bobot as string}</td>
                  <td>{kpi.target as string}</td>
                  <td>
                    <input
                      type="text"
                      className="form-input form-input-sm"
                      value={values[String(i)] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [String(i)]: e.target.value }))}
                      placeholder="Isi realisasi"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Mengirim…' : 'Kirim Realisasi'}
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">Riwayat Submisi</h3></div>
          <div className="history-list">
            {history.map((h: unknown, i) => {
              const item = h as Record<string, unknown>;
              return (
                <div key={i} className="history-item">
                  <span className="history-submitter">{item.submitter as string}</span>
                  <span className={`badge badge-${item.status === 'approved' ? 'success' : 'warning'}`}>{item.status as string}</span>
                  <span className="history-date text-muted">{new Date(item.submittedAt as string).toLocaleDateString('id-ID')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
