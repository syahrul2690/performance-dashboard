import { useEffect, useState } from 'react';
import { gcgEsg } from '../lib/api';

interface Principle {
  id: string;
  name: string;
  icon: string;
  actual: number;
  target: number;
  desc: string;
}

interface EsgMetric {
  id: string;
  name: string;
  actual: number;
  baseline: number;
  target: number;
  unit: string;
  trend: string;
  better: string;
}

interface RiskCat {
  cat: string;
  count: number;
  high: number;
}

interface TopRisk {
  id: string;
  name: string;
  cat: string;
  severity: string;
  prob: string;
  mitigation: string;
}

interface GcgEsgData {
  gcg: {
    overallScore: number;
    target: number;
    maxScore: number;
    previousScore: number;
    principles: Principle[];
    audit: { findings2025: number; closed: number; closureRate: number };
    smap: { iso: string; maturity: string; score: number };
    whistleblower: { reports2026: number; resolved: number; avgDaysToResolve: number };
  };
  esg: {
    score: { e: number; s: number; g: number; composite: number; target: number };
    environment: { nzePathway: string; metrics: EsgMetric[] };
    social: { metrics: EsgMetric[]; beneficiaries: number; tjslBudgetSpentRpM: number };
    governance: { metrics: EsgMetric[] };
  };
  risk: {
    total: number;
    byCategory: RiskCat[];
    highRisk: number;
    mitigated: number;
    mitigationRate: number;
    topRisks: TopRisk[];
  };
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div
      style={{
        background: 'var(--color-surface-sunken, #eee)',
        borderRadius: 4,
        height: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.min(100, (value / max) * 100)}%`,
          background: color,
          height: '100%',
        }}
      />
    </div>
  );
}

function MetricList({ metrics }: { metrics: EsgMetric[] }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {metrics.map((m) => (
        <div key={m.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span>{m.name}</span>
            <strong>
              {m.actual} {m.unit}
            </strong>
          </div>
          <Bar
            value={m.better === 'lower' ? m.target : m.actual}
            max={m.better === 'lower' ? m.actual || 1 : Math.max(m.target, m.actual)}
            color={m.trend === 'up' || m.trend === 'down' ? '#46BD0D' : '#03A2B8'}
          />
          <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
            Target {m.target} {m.unit} · baseline {m.baseline}
          </div>
        </div>
      ))}
    </div>
  );
}

const SEV_COLOR: Record<string, string> = {
  high: 'danger',
  medium: 'warning',
  low: 'success',
};

export function GcgEsgPage() {
  const [data, setData] = useState<{ data: GcgEsgData | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gcgEsg.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat…</div>;
  const d = data?.data;
  if (!d) return <div className="page-loading">Data tidak tersedia.</div>;

  const { gcg, esg, risk } = d;

  return (
    <div className="page gcg-esg-page">
      <div className="page-header">
        <h1 className="page-title">GCG &amp; ESG</h1>
        <p className="page-subtitle">
          Tata Kelola, Lingkungan, Sosial &amp; Keterkaitan Risiko (Proses 11.0)
        </p>
      </div>

      {/* Hero */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              GCG Composite Score
            </div>
            <div style={{ fontSize: 44, fontWeight: 800, color: '#125D72', lineHeight: 1.1 }}>
              {gcg.overallScore}
              <span style={{ fontSize: 18, color: 'var(--color-text-subtle)' }}>
                {' '}
                / {gcg.maxScore}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Target {gcg.target} · sebelumnya {gcg.previousScore}
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 12,
              flex: 1,
            }}
          >
            <div className="kpi-strip-item card">
              <div className="kpi-strip-label">Audit Closure Rate</div>
              <div className="kpi-strip-value">{gcg.audit.closureRate}%</div>
            </div>
            <div className="kpi-strip-item card">
              <div className="kpi-strip-label">SMAP ISO 37001</div>
              <div className="kpi-strip-value">{gcg.smap.score}</div>
            </div>
            <div className="kpi-strip-item card">
              <div className="kpi-strip-label">Whistleblower Resolved</div>
              <div className="kpi-strip-value">
                {gcg.whistleblower.resolved}/{gcg.whistleblower.reports2026}
              </div>
            </div>
            <div className="kpi-strip-item card">
              <div className="kpi-strip-label">ESG Composite</div>
              <div className="kpi-strip-value">{esg.score.composite}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 GCG principles */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="card-header">
          <h3 className="card-title">5 Prinsip GCG</h3>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
          {gcg.principles.map((p) => (
            <div key={p.id} className="card" style={{ padding: 14 }}>
              <strong>{p.name}</strong>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-muted)',
                  margin: '4px 0 8px',
                }}
              >
                {p.desc}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span>
                  Aktual <strong>{p.actual}</strong>
                </span>
                <span>Target {p.target}</span>
              </div>
              <Bar value={p.actual} max={100} color="#125D72" />
            </div>
          ))}
        </div>
      </div>

      {/* ESG 3 pillars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div className="card" style={{ padding: 16 }}>
          <div className="card-header">
            <h3 className="card-title">Environment (E = {esg.score.e})</h3>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 10 }}>
            {esg.environment.nzePathway}
          </div>
          <MetricList metrics={esg.environment.metrics} />
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="card-header">
            <h3 className="card-title">Social (S = {esg.score.s})</h3>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 10 }}>
            {esg.social.beneficiaries.toLocaleString('id-ID')} penerima manfaat · TJSL Rp{' '}
            {esg.social.tjslBudgetSpentRpM} M
          </div>
          <MetricList metrics={esg.social.metrics} />
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="card-header">
            <h3 className="card-title">Governance (G = {esg.score.g})</h3>
          </div>
          <MetricList metrics={esg.governance.metrics} />
        </div>
      </div>

      {/* Risk linkage */}
      <div className="card" style={{ padding: 16 }}>
        <div className="card-header">
          <h3 className="card-title">
            Keterkaitan Risiko — {risk.total} risiko · {risk.highRisk} prioritas tinggi ·
            mitigasi {risk.mitigationRate}%
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          {risk.byCategory.map((c) => (
            <span key={c.cat} className="badge" style={{ padding: '4px 10px' }}>
              {c.cat}: {c.count} ({c.high} tinggi)
            </span>
          ))}
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Risiko</th>
                <th>Kategori</th>
                <th>Severity</th>
                <th>Mitigasi</th>
              </tr>
            </thead>
            <tbody>
              {risk.topRisks.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.cat}</td>
                  <td>
                    <span className={`badge badge-${SEV_COLOR[r.severity] ?? 'warning'}`}>
                      {r.severity}
                    </span>
                  </td>
                  <td>{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
