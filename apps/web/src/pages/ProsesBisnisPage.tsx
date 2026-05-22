import { useEffect, useState } from 'react';
import { prosesBisnis } from '../lib/api';

interface ProsesGroup {
  code: string;
  name: string;
  icon: string;
  desc: string;
  maturity: number;
  score: number;
  owner: string;
  core: boolean;
}

interface ProsesData {
  groups: ProsesGroup[];
  maturityLabels: Record<string, string>;
}

const MATURITY_COLOR: Record<number, string> = {
  1: '#EC1C24',
  2: '#FBA806',
  3: '#03A2B8',
  4: '#46BD0D',
};

export function ProsesBisnisPage() {
  const [data, setData] = useState<{ data: ProsesData | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prosesBisnis.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat…</div>;
  const d = data?.data;
  if (!d) return <div className="page-loading">Data tidak tersedia.</div>;

  const groups = d.groups ?? [];
  const core = groups.find((g) => g.core);
  const avg = groups.length
    ? Math.round(groups.reduce((s, g) => s + g.score, 0) / groups.length)
    : 0;
  const dist = [1, 2, 3, 4].map((m) => groups.filter((g) => g.maturity === m).length);

  return (
    <div className="page proses-bisnis-page">
      <div className="page-header">
        <h1 className="page-title">Proses Bisnis L2</h1>
        <p className="page-subtitle">
          13 Kelompok Proses Bisnis PUSMANPRO — KEP DIR 0302.K/DIR/2025
        </p>
      </div>

      <div className="four-col-grid">
        <div className="summary-hero-card kpi">
          <div className="summary-hero-label">Total Kelompok Proses</div>
          <div className="summary-hero-value">{groups.length}</div>
          <div className="summary-hero-meta">Klasifikasi proses bisnis L2</div>
        </div>
        <div className="summary-hero-card pi">
          <div className="summary-hero-label">Core Process (5.0)</div>
          <div className="summary-hero-value">{core ? core.score : '—'}</div>
          <div className="summary-hero-meta">{core ? core.name : 'Menyediakan Jasa'}</div>
        </div>
        <div className="summary-hero-card pen">
          <div className="summary-hero-label">Rata-rata Skor Maturity</div>
          <div className="summary-hero-value">{avg}</div>
          <div className="summary-hero-meta">Skala 0–100</div>
        </div>
        <div className="summary-hero-card total">
          <div className="summary-hero-label">Distribusi F / P / A / M</div>
          <div className="summary-hero-value">{dist.join(' / ')}</div>
          <div className="summary-hero-meta">Foundational → Mastery</div>
        </div>
      </div>

      <div className="procbiz-grid">
        {groups.map((g) => (
          <div
            key={g.code}
            className={`procbiz-card maturity-${g.maturity}${g.core ? ' core' : ''}`}
          >
            {g.core && <span className="badge-core">CORE</span>}
            <div className="procbiz-head">
              <span className="procbiz-num">{g.code}</span>
              <span className="procbiz-name">{g.name}</span>
            </div>
            <div className="procbiz-sub">{g.desc}</div>
            <div className="procbiz-bar">
              <span style={{ width: `${g.score}%` }} />
            </div>
            <div className="procbiz-meta">
              <span>Owner: {g.owner}</span>
              <strong>
                {d.maturityLabels[String(g.maturity)]} · {g.score}
              </strong>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header compact">
          <div className="card-title">Legenda Maturity</div>
        </div>
        <div className="card-body">
          <div className="procbiz-legend">
            {[1, 2, 3, 4].map((m) => (
              <span key={m} className="procbiz-legend-item">
                <span
                  className="procbiz-legend-dot"
                  style={{ background: MATURITY_COLOR[m] }}
                />
                {m} — {d.maturityLabels[String(m)]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
