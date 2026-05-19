import { useEffect, useState } from 'react';
import { humanCapital } from '../lib/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function HumanCapitalPage() {
  const [data, setData] = useState<{ data: Record<string, unknown> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    humanCapital.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat…</div>;
  const d = (data?.data ?? {}) as Record<string, unknown>;
  const hc = d?.headcount as Record<string, unknown> | undefined;
  const age = d?.ageDistribution as Record<string, unknown> | undefined;

  const ageChart = age ? {
    labels: Object.keys(age),
    datasets: [{
      label: 'Distribusi Usia',
      data: Object.values(age) as number[],
      backgroundColor: '#125D72',
    }],
  } : null;

  return (
    <div className="page hc-page">
      <div className="page-header">
        <h1 className="page-title">Human Capital</h1>
        <p className="page-subtitle">Sumber Daya Manusia PUSMANPRO</p>
      </div>

      {hc && (
        <div className="kpi-strip">
          {Object.entries(hc).map(([k, v]) => (
            <div key={k} className="kpi-strip-item card">
              <div className="kpi-strip-label">{k}</div>
              <div className="kpi-strip-value">{String(v)}</div>
            </div>
          ))}
        </div>
      )}

      {ageChart && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">Distribusi Usia Pegawai</h3></div>
          <div style={{ height: 240 }}>
            <Bar data={ageChart} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      {Boolean(d?.certifications) && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">Sertifikasi</h3></div>
          <div className="cert-list">
            {(d.certifications as Array<Record<string, unknown>>).map((c, i) => (
              <div key={i} className="cert-item">
                <span className="cert-name">{c.name as string}</span>
                <div className="cert-progress-wrap">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${c.pct ?? c.achievement ?? 0}%` }} />
                  </div>
                  <span>{String(c.count ?? c.value ?? '')} / {String(c.target ?? '')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
