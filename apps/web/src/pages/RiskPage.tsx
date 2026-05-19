import { useEffect, useState } from 'react';
import { risk } from '../lib/api';
import type { RiskItem } from '../lib/types';

const LIKELIHOOD_LABELS = ['', 'Sangat Rendah', 'Rendah', 'Sedang', 'Tinggi', 'Sangat Tinggi'];
const IMPACT_LABELS = ['', 'Tidak Signifikan', 'Minor', 'Moderat', 'Major', 'Katastrofik'];

function heatColor(l: number, i: number): string {
  const score = l * i;
  if (score >= 20) return '#e74c3c';
  if (score >= 12) return '#e67e22';
  if (score >= 6) return '#f1c40f';
  return '#2ecc71';
}

export function RiskPage() {
  const [data, setData] = useState<{ data: Record<string, unknown> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    risk.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat…</div>;
  const d = data?.data as Record<string, unknown> | undefined;
  const register = (d?.register ?? []) as RiskItem[];
  const kpis = (d?.kpis ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="page risk-page">
      <div className="page-header">
        <h1 className="page-title">Manajemen Risiko</h1>
        <p className="page-subtitle">Risk Register & Heat Map PUSMANPRO</p>
      </div>

      {kpis.length > 0 && (
        <div className="kpi-strip">
          {kpis.map((k, i) => (
            <div key={i} className="kpi-strip-item card">
              <div className="kpi-strip-label">{k.label as string}</div>
              <div className="kpi-strip-value">{String(k.value ?? '')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Heat Map 5×5 */}
      <div className="card heat-map-card">
        <div className="card-header"><h3 className="card-title">Heat Map Risiko 5×5</h3></div>
        <div className="heat-map-grid">
          <div className="heat-map-y-label">Dampak →</div>
          <div className="heat-map-matrix">
            {[5, 4, 3, 2, 1].map((impact) => (
              <div key={impact} className="heat-map-row">
                <span className="heat-map-axis-label">{IMPACT_LABELS[impact]}</span>
                {[1, 2, 3, 4, 5].map((likelihood) => {
                  const count = register.filter(
                    (r) => r.likelihood === likelihood && r.impact === impact
                  ).length;
                  return (
                    <div
                      key={likelihood}
                      className="heat-map-cell"
                      style={{ backgroundColor: heatColor(likelihood, impact) }}
                      title={`L${likelihood}×I${impact}`}
                    >
                      {count > 0 && <span className="heat-cell-count">{count}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="heat-map-x-labels">
              <span></span>
              {[1,2,3,4,5].map((l) => <span key={l} className="heat-map-axis-label">{LIKELIHOOD_LABELS[l]}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Register */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Risk Register ({register.length} risiko)</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Deskripsi</th>
                <th>Kategori</th>
                <th>Unit</th>
                <th>L</th>
                <th>D</th>
                <th>Mitigation</th>
                <th>%</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {register.map((r, i) => (
                <tr key={r.id ?? i}>
                  <td>{i + 1}</td>
                  <td>{r.desc}</td>
                  <td>{r.cat}</td>
                  <td>{r.unit}</td>
                  <td>
                    <span className="risk-score" style={{ backgroundColor: heatColor(r.likelihood, 3) }}>
                      {r.likelihood}
                    </span>
                  </td>
                  <td>
                    <span className="risk-score" style={{ backgroundColor: heatColor(3, r.impact) }}>
                      {r.impact}
                    </span>
                  </td>
                  <td className="risk-mitigation">{r.mitigation}</td>
                  <td>{r.mitigationPct}%</td>
                  <td>
                    <span className={`badge badge-${r.status === 'open' ? 'danger' : r.status === 'mitigating' ? 'warning' : 'success'}`}>
                      {r.status}
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
