import { useEffect, useState } from 'react';
import { organisasi } from '../lib/api';

interface OrgNode {
  id: string;
  code: string;
  name: string;
  tier?: string;
  icon?: string;
  formasi?: number;
  parent?: string;
  wilayah?: string;
  headcount?: number;
  tugasPokok?: string[];
  regulasi?: string;
}

interface SubNode {
  code: string;
  name: string;
  icon?: string;
}

interface OrgData {
  gm: OrgNode;
  sm: OrgNode[];
  manager: OrgNode[];
  asmanKhusus: OrgNode[];
  upmk: OrgNode[];
  upmkSub: { standard: SubNode[] };
  totals: { managerial: number; asman: number; staff: number; total: number };
  regulasi?: string;
}

function NodeCard({ node, accent }: { node: OrgNode; accent: string }) {
  const hasDetail = (node.tugasPokok && node.tugasPokok.length > 0) || node.regulasi;
  const body = (
    <>
      <div style={{ fontWeight: 700 }}>{node.name}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        {node.code}
        {node.wilayah ? ` · ${node.wilayah}` : ''}
        {node.headcount != null ? ` · ${node.headcount} pegawai` : ''}
        {node.formasi != null ? ` · formasi ${node.formasi}` : ''}
      </div>
    </>
  );
  return (
    <div className="card" style={{ padding: 14, borderTop: `3px solid ${accent}` }}>
      {hasDetail ? (
        <details>
          <summary style={{ cursor: 'pointer', listStyle: 'none' }}>{body}</summary>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12 }}>
            {(node.tugasPokok ?? []).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
          {node.regulasi && (
            <div style={{ fontSize: 11, marginTop: 6, color: 'var(--color-text-subtle)' }}>
              Dasar: {node.regulasi}
            </div>
          )}
        </details>
      ) : (
        body
      )}
    </div>
  );
}

export function OrganisasiPage() {
  const [data, setData] = useState<{ data: OrgData | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    organisasi.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat…</div>;
  const d = data?.data;
  if (!d) return <div className="page-loading">Data tidak tersedia.</div>;

  const directGm = (d.manager ?? []).filter((m) => m.parent === 'gm');
  const grid = (cols: string) => ({
    display: 'grid' as const,
    gridTemplateColumns: cols,
    gap: 14,
  });

  return (
    <div className="page organisasi-page">
      <div className="page-header">
        <h1 className="page-title">Struktur Organisasi</h1>
        <p className="page-subtitle">
          PUSMANPRO — {d.regulasi ?? 'PDIR 0110 & 0153.P/DIR/2025'}
        </p>
      </div>

      <div className="kpi-strip">
        <div className="kpi-strip-item card">
          <div className="kpi-strip-label">Total Formasi Jabatan</div>
          <div className="kpi-strip-value">{d.totals.total}</div>
        </div>
        <div className="kpi-strip-item card">
          <div className="kpi-strip-label">Senior Manajer Bidang</div>
          <div className="kpi-strip-value">{d.sm.length}</div>
        </div>
        <div className="kpi-strip-item card">
          <div className="kpi-strip-label">Unit Pelaksana (UPMK)</div>
          <div className="kpi-strip-value">
            {d.upmk.length} · {d.upmk.reduce((s, u) => s + (u.headcount ?? 0), 0)} pegawai
          </div>
        </div>
        <div className="kpi-strip-item card">
          <div className="kpi-strip-label">Managerial / ASMAN / Staff</div>
          <div className="kpi-strip-value">
            {d.totals.managerial} / {d.totals.asman} / {d.totals.staff}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="card-header">
          <h3 className="card-title">Pimpinan</h3>
        </div>
        <NodeCard node={d.gm} accent="#125D72" />
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="card-header">
          <h3 className="card-title">4 Bidang Utama (Senior Manajer)</h3>
        </div>
        <div style={grid('repeat(auto-fill, minmax(280px, 1fr))')}>
          {d.sm.map((sm) => (
            <div key={sm.id}>
              <NodeCard node={sm} accent="#017991" />
              <div style={{ marginTop: 8, paddingLeft: 12, display: 'grid', gap: 8 }}>
                {d.manager
                  .filter((m) => m.parent === sm.id)
                  .map((m) => (
                    <NodeCard key={m.id} node={m} accent="#03A2B8" />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="card-header">
          <h3 className="card-title">Langsung di Bawah GM</h3>
        </div>
        <div style={grid('repeat(auto-fill, minmax(280px, 1fr))')}>
          {[...d.asmanKhusus, ...directGm].map((n) => (
            <NodeCard key={n.id} node={n} accent="#F9AF1C" />
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="card-header">
          <h3 className="card-title">5 Unit Pelaksana Manajemen Konstruksi (UPMK)</h3>
        </div>
        <div style={grid('repeat(auto-fill, minmax(280px, 1fr))')}>
          {d.upmk.map((u) => (
            <div key={u.id}>
              <NodeCard node={u} accent="#46BD0D" />
              <ul
                style={{
                  margin: '8px 0 0',
                  paddingLeft: 18,
                  fontSize: 12,
                  color: 'var(--color-text-muted)',
                }}
              >
                {d.upmkSub.standard.map((s) => (
                  <li key={s.code}>{s.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
