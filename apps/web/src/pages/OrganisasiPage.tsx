import { useEffect, useState } from 'react';
import { organisasi } from '../lib/api';

interface OrgNodeData {
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
  gm: OrgNodeData;
  sm: OrgNodeData[];
  manager: OrgNodeData[];
  asmanKhusus: OrgNodeData[];
  upmk: OrgNodeData[];
  upmkSub: { standard: SubNode[] };
  totals: { managerial: number; asman: number; staff: number; total: number };
  regulasi?: string;
}

const LEGEND = [
  { label: 'General Manager', color: '#125D72' },
  { label: 'Senior Manajer', color: '#03A2B8' },
  { label: 'Manajer Bidang', color: '#46BD0D' },
  { label: 'Unit Pelaksana (UPMK)', color: '#F9AF1C' },
  { label: 'ASMAN Khusus', color: '#EC1C24' },
];

function OrgNodeCard({ node, variant }: { node: OrgNodeData; variant: string }) {
  return (
    <div className={`org-node ${variant}`}>
      {node.formasi != null && <span className="org-node-formasi">{node.formasi}</span>}
      <span className="org-code">{node.code}</span>
      <span className="org-name">{node.name}</span>
      {(node.wilayah || node.headcount != null) && (
        <span className="org-meta">
          {node.wilayah}
          {node.headcount != null ? ` · ${node.headcount} pegawai` : ''}
        </span>
      )}
      {node.tugasPokok && node.tugasPokok.length > 0 && (
        <details>
          <summary className="org-meta" style={{ cursor: 'pointer' }}>
            Tugas pokok
          </summary>
          <ul className="org-tugas">
            {node.tugasPokok.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </details>
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
  const upmkHeadcount = d.upmk.reduce((s, u) => s + (u.headcount ?? 0), 0);

  return (
    <div className="page organisasi-page">
      <div className="page-header">
        <h1 className="page-title">Struktur Organisasi</h1>
        <p className="page-subtitle">
          PUSMANPRO — {d.regulasi ?? 'PDIR 0110 & 0153.P/DIR/2025'}
        </p>
      </div>

      <div className="four-col-grid">
        <div className="summary-hero-card kpi">
          <div className="summary-hero-label">Total Formasi Jabatan</div>
          <div className="summary-hero-value">{d.totals.total}</div>
          <div className="summary-hero-meta">Seluruh PUSMANPRO</div>
        </div>
        <div className="summary-hero-card pi">
          <div className="summary-hero-label">Bidang Utama (Senior Manajer)</div>
          <div className="summary-hero-value">{d.sm.length}</div>
          <div className="summary-hero-meta">Perencanaan · OMP · QA/QC · Keu/Kom/Umum</div>
        </div>
        <div className="summary-hero-card pen">
          <div className="summary-hero-label">Unit Pelaksana (UPMK)</div>
          <div className="summary-hero-value">{d.upmk.length}</div>
          <div className="summary-hero-meta">{upmkHeadcount} pegawai lapangan</div>
        </div>
        <div className="summary-hero-card total">
          <div className="summary-hero-label">Managerial / ASMAN / Staff</div>
          <div className="summary-hero-value">
            {d.totals.managerial} / {d.totals.asman} / {d.totals.staff}
          </div>
          <div className="summary-hero-meta">Komposisi formasi</div>
        </div>
      </div>

      <div className="card p-0">
        <div className="card-header compact">
          <div className="card-title">Bagan Organisasi</div>
        </div>
        <div className="org-chart-wrap">
          <div className="org-level-label">Level 5 — Pimpinan</div>
          <div className="org-level">
            <OrgNodeCard node={d.gm} variant="gm-node" />
          </div>

          <div className="org-level-label">Level 4–3 — Bidang Utama</div>
          <div className="org-level">
            {d.sm.map((sm) => (
              <div key={sm.id} className="org-sm-group">
                <OrgNodeCard node={sm} variant="sm-node" />
                <div className="org-sm-children">
                  {d.manager
                    .filter((m) => m.parent === sm.id)
                    .map((m) => (
                      <OrgNodeCard key={m.id} node={m} variant="man-node" />
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="org-level-label">Langsung di Bawah GM</div>
          <div className="org-level">
            {d.asmanKhusus.map((n) => (
              <OrgNodeCard key={n.id} node={n} variant="asman-node" />
            ))}
            {directGm.map((n) => (
              <OrgNodeCard key={n.id} node={n} variant="man-node" />
            ))}
          </div>

          <div className="org-level-label">Level 3 — Unit Pelaksana (UPMK)</div>
          <div className="org-level">
            {d.upmk.map((u) => (
              <div key={u.id} className="org-sm-group">
                <OrgNodeCard node={u} variant="mup-node" />
                <div className="org-upmk-children">
                  <div className="org-upmk-children-label">Sub-struktur</div>
                  {d.upmkSub.standard.map((s) => (
                    <div key={s.code} className="org-upmk-sub">
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="org-legend">
            {LEGEND.map((l) => (
              <span key={l.label} className="org-legend-item">
                <span className="org-legend-dot" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
