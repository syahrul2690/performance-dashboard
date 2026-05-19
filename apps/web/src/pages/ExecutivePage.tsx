import { useEffect, useState } from 'react';
import { executive } from '../lib/api';
import { KpiCard } from '../components/KpiCard';
import { UnitRankingTable } from '../components/UnitRankingTable';
import { CapacityChart } from '../components/CapacityChart';
import type { ExecutiveData } from '../lib/types';

export function ExecutivePage() {
  const [data, setData] = useState<{ period: unknown; data: ExecutiveData } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    executive.summary().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat…</div>;
  if (!data?.data) return <div className="page-empty">Data tidak tersedia.</div>;

  const d = data.data;

  return (
    <div className="page executive-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Summary</h1>
          <p className="page-subtitle">Dashboard Kinerja PUSMANPRO — Februari 2026</p>
        </div>
      </div>

      {/* Health Score */}
      <div className="health-score-section">
        <div className="health-score-card card">
          <div className="health-score-value">{d.healthScore?.value?.toFixed(2)}</div>
          <div className="health-score-label">{d.healthScore?.label}</div>
          <div className="health-score-meta">
            Target: {d.healthScore?.target} · Status: <span className="badge badge-success">{d.healthScore?.status}</span>
          </div>
        </div>
        <div className="health-trio">
          <div className="trio-card card">
            <div className="trio-label">{d.efficiency?.label}</div>
            <div className="trio-value">{d.efficiency?.value}%</div>
          </div>
          <div className="trio-card card">
            <div className="trio-label">{d.csat?.label}</div>
            <div className="trio-value">{d.csat?.value} <span className="trio-unit">hari</span></div>
          </div>
          <div className="trio-card card">
            <div className="trio-label">{d.safety?.label}</div>
            <div className="trio-value">{d.safety?.value} <span className="trio-unit">{d.safety?.unit}</span></div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {d.kpis?.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Capacity Addition Chart */}
      <div className="section-grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Penambahan Kapasitas (12 Bulan)</h3>
          </div>
          <CapacityChart data={d.capacityAddition as Record<string, unknown>} />
        </div>

        {/* Unit Ranking */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ranking Unit</h3>
          </div>
          <UnitRankingTable ranking={d.unitRanking ?? []} />
        </div>
      </div>

      {/* Initiatives */}
      {d.initiatives && d.initiatives.length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">Inisiatif Strategis</h3></div>
          <div className="initiatives-list">
            {d.initiatives.map((ini) => (
              <div key={ini.id} className="initiative-item">
                <div className="initiative-info">
                  <span className="initiative-name">{ini.name}</span>
                  <span className="initiative-owner text-muted">{ini.owner}</span>
                </div>
                <div className="initiative-progress-wrap">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${ini.progress}%` }} />
                  </div>
                  <span className="initiative-pct">{ini.progress}%</span>
                </div>
                <span className={`badge badge-${ini.status === 'on-track' ? 'success' : ini.status === 'at-risk' ? 'warning' : 'danger'}`}>
                  {ini.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {d.alerts && d.alerts.length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">Alert Aktif</h3></div>
          <div className="alerts-list">
            {d.alerts.map((a) => (
              <div key={a.id} className={`alert-item severity-${a.severity}`}>
                <span className={`badge badge-${a.severity === 'critical' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'}`}>
                  {a.severity}
                </span>
                <span className="alert-unit">[{a.unit}]</span>
                <span className="alert-msg">{a.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
