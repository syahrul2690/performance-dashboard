import { useEffect, useState } from 'react';
import { financial } from '../lib/api';

export function FinancialPage() {
  const [data, setData] = useState<{ data: Record<string, unknown> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    financial.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat…</div>;
  const d = (data?.data ?? {}) as Record<string, unknown>;

  return (
    <div className="page financial-page">
      <div className="page-header">
        <h1 className="page-title">Cost & Capex</h1>
        <p className="page-subtitle">Laporan Keuangan & Realisasi Investasi</p>
      </div>

      {Boolean(d?.kpiStrip) && (
        <div className="kpi-strip">
          {(d.kpiStrip as Array<Record<string, unknown>>).map((k, i) => (
            <div key={i} className="kpi-strip-item card">
              <div className="kpi-strip-label">{String(k.label ?? '')}</div>
              <div className="kpi-strip-value">{String(k.formatted ?? k.value ?? '')}</div>
              {typeof k.delta === 'number' && (
                <div className={`kpi-delta ${(k.delta as number) >= 0 ? 'trend-up' : 'trend-down'}`}>
                  {(k.delta as number) > 0 ? '+' : ''}{String(k.delta)}%
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="section-grid-2">
        {Boolean(d?.pnl) && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">P&amp;L Overview</h3></div>
            <DataTable rows={d.pnl as Array<Record<string, unknown>>} />
          </div>
        )}
        {Boolean(d?.EVM) && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">Earned Value Management</h3></div>
            <DataTable rows={Array.isArray(d.EVM) ? d.EVM as Array<Record<string, unknown>> : [d.EVM as Record<string, unknown>]} />
          </div>
        )}
      </div>
    </div>
  );
}

function DataTable({ rows }: { rows: Array<Record<string, unknown>> }) {
  if (!rows || rows.length === 0) return <div className="empty-state">Tidak ada data</div>;
  const cols = Object.keys(rows[0]);
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {cols.map((c) => <td key={c}>{String(row[c] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
