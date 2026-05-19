import { useEffect, useState } from 'react';
import { operational } from '../lib/api';

export function OperationalPage() {
  const [data, setData] = useState<{ data: Record<string, unknown> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    operational.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat…</div>;
  const d = data?.data as Record<string, unknown> | undefined;
  const kpis = (d?.kpis ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="page operational-page">
      <div className="page-header">
        <h1 className="page-title">Operasional KPI</h1>
        <p className="page-subtitle">Key Performance Indicators Operasional</p>
      </div>

      <div className="kpi-table-card card">
        <div className="card-header"><h3 className="card-title">Daftar KPI Operasional</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Indikator</th>
                <th>Target</th>
                <th>Realisasi</th>
                <th>Bobot</th>
                <th>Achievement</th>
                <th>Nilai</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((kpi, i) => (
                <tr key={i}>
                  <td>{kpi.label as string}</td>
                  <td>{String(kpi.target ?? '')}</td>
                  <td>{String(kpi.actual ?? kpi.value ?? '')}</td>
                  <td>{String(kpi.bobot ?? '')}</td>
                  <td>{typeof kpi.achievement === 'number' ? `${kpi.achievement}%` : String(kpi.achievement ?? '')}</td>
                  <td>{String(kpi.nilai ?? '')}</td>
                  <td>
                    <span className={`badge badge-${kpi.status === 'Baik' ? 'success' : kpi.status === 'Hati-hati' ? 'warning' : 'danger'}`}>
                      {kpi.status as string}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
