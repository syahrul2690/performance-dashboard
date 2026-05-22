import { useEffect, useState } from 'react';
import {
  Eye, Scale, CheckCircle2, Shield, Gavel, Leaf, Users, Building2,
} from 'lucide-react';
import type { ComponentType } from 'react';
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

const PRINCIPLE_ICON: Record<string, ComponentType<{ size?: number }>> = {
  tra: Eye,
  akt: Scale,
  rsp: CheckCircle2,
  ind: Shield,
  wjr: Gavel,
};

const SEV_BADGE: Record<string, string> = {
  high: 'badge-danger',
  medium: 'badge-warning',
  low: 'badge-success',
};

function barClass(actual: number, target: number): string {
  if (actual >= target) return '';
  if (actual >= target - 5) return 'warn';
  return 'bad';
}

function EsgPillar({
  variant, title, icon: Icon, score, metrics,
}: {
  variant: string;
  title: string;
  icon: ComponentType<{ size?: number }>;
  score: number;
  metrics: EsgMetric[];
}) {
  return (
    <div className={`esg-pillar ${variant}`}>
      <div className="esg-pillar-head">
        <span className="esg-pillar-title">
          <Icon size={18} /> {title}
        </span>
        <span className="esg-pillar-score">{score}</span>
      </div>
      {metrics.map((m) => (
        <div key={m.id} className="esg-metric">
          <span className="em-name">{m.name}</span>
          <span className="em-val">
            {m.actual}
            {m.unit && m.unit !== '%' ? ` ${m.unit}` : m.unit}
          </span>
          <span className="em-tgt">T: {m.target}</span>
        </div>
      ))}
    </div>
  );
}

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

      <div className="gcg-hero">
        <div className="gcg-hero-score">
          <div className="gcg-hero-score-val">{gcg.overallScore}</div>
          <div className="gcg-hero-score-tgt">
            Target {gcg.target} · Maks {gcg.maxScore}
          </div>
        </div>
        <div className="gcg-hero-info">
          <h2>GCG Composite Score</h2>
          <p>
            Skor tata kelola perusahaan PUSMANPRO — naik dari {gcg.previousScore} pada
            periode sebelumnya.
          </p>
          <div className="gcg-hero-bars">
            <div className="gcg-mini">
              <div className="label">Audit Closure Rate</div>
              <div className="value">{gcg.audit.closureRate}%</div>
            </div>
            <div className="gcg-mini">
              <div className="label">SMAP ISO 37001</div>
              <div className="value">{gcg.smap.score}</div>
            </div>
            <div className="gcg-mini">
              <div className="label">Whistleblower</div>
              <div className="value">
                {gcg.whistleblower.resolved}/{gcg.whistleblower.reports2026}
              </div>
            </div>
            <div className="gcg-mini">
              <div className="label">ESG Composite</div>
              <div className="value">{esg.score.composite}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-title-row">
        <h2 className="section-title">5 Prinsip GCG</h2>
      </div>
      <div className="gcg-principle-grid">
        {gcg.principles.map((p) => {
          const Icon = PRINCIPLE_ICON[p.id] ?? Shield;
          return (
            <div key={p.id} className="gcg-principle">
              <div className="gcg-principle-head">
                <span className="gcg-principle-icon">
                  <Icon size={16} />
                </span>
                <span className="gcg-principle-name">{p.name}</span>
              </div>
              <div className="gcg-principle-desc">{p.desc}</div>
              <div className="gcg-principle-meta">
                <span className="gcg-principle-val">{p.actual}</span>
                <span className="gcg-principle-tgt">Target {p.target}</span>
              </div>
              <div className="gcg-bar">
                <span
                  className={barClass(p.actual, p.target)}
                  style={{ width: `${p.actual}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-title-row">
        <h2 className="section-title">ESG Triple-Pillar Scorecard</h2>
      </div>
      <div className="esg-pillars">
        <EsgPillar
          variant="env"
          title="Environment"
          icon={Leaf}
          score={esg.score.e}
          metrics={esg.environment.metrics}
        />
        <EsgPillar
          variant="soc"
          title="Social"
          icon={Users}
          score={esg.score.s}
          metrics={esg.social.metrics}
        />
        <EsgPillar
          variant="gov"
          title="Governance"
          icon={Building2}
          score={esg.score.g}
          metrics={esg.governance.metrics}
        />
      </div>

      <div className="card p-0">
        <div className="card-header compact">
          <div className="card-title">Keterkaitan Risiko (Proses 11.0)</div>
          <span className="card-meta">
            {risk.total} risiko · {risk.highRisk} prioritas tinggi · mitigasi{' '}
            {risk.mitigationRate}%
          </span>
        </div>
        <div className="card-body">
          <div className="risk-cat-row">
            {risk.byCategory.map((c) => (
              <span key={c.cat} className="meta-pill">
                {c.cat}: {c.count} ({c.high} tinggi)
              </span>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table compact">
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
                    <span className={`badge-pill ${SEV_BADGE[r.severity] ?? 'badge-warning'}`}>
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
