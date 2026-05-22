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
  2: '#F9AF1C',
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

      <div className="kpi-strip">
        <div className="kpi-strip-item card">
          <div className="kpi-strip-label">Total Kelompok Proses</div>
          <div className="kpi-strip-value">{groups.length}</div>
        </div>
        <div className="kpi-strip-item card">
          <div className="kpi-strip-label">Core Process (5.0)</div>
          <div className="kpi-strip-value">{core ? core.score : '—'}</div>
        </div>
        <div className="kpi-strip-item card">
          <div className="kpi-strip-label">Rata-rata Skor Maturity</div>
          <div className="kpi-strip-value">{avg}</div>
        </div>
        <div className="kpi-strip-item card">
          <div className="kpi-strip-label">Distribusi F / P / A / M</div>
          <div className="kpi-strip-value">{dist.join(' / ')}</div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: 16,
        }}
      >
        {groups.map((g) => (
          <div
            key={g.code}
            className="card"
            style={{ padding: 16, borderLeft: `4px solid ${MATURITY_COLOR[g.maturity]}` }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <strong>
                {g.code} — {g.name}
              </strong>
              {g.core && <span className="badge badge-warning">CORE</span>}
            </div>
            <div
              style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 10 }}
            >
              {g.desc}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: 'var(--color-text-muted)',
              }}
            >
              <span>Owner: {g.owner}</span>
              <span style={{ color: MATURITY_COLOR[g.maturity], fontWeight: 700 }}>
                {d.maturityLabels[String(g.maturity)]} · {g.score}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <div className="card-header">
          <h3 className="card-title">Legenda Maturity</h3>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map((m) => (
            <span key={m} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: MATURITY_COLOR[m],
                  display: 'inline-block',
                }}
              />
              {m} — {d.maturityLabels[String(m)]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
