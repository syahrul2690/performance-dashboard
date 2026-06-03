import { useEffect, useState, Fragment } from 'react';
import { inputKontrak } from '../lib/api';
import { FileCheck2, ChevronDown } from 'lucide-react';
import { SkeletonTable, EmptyState, ErrorState } from '../components/LoadState';
import type { KontrakManajemen } from '../lib/types';

const UNIT_NAMES: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
  UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};

export function KontrakDisetujuiPage() {
  const [list, setList] = useState<KontrakManajemen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    inputKontrak.approved()
      .then((d) => setList(d as KontrakManajemen[]))
      .catch((e) => setError((e as Error)?.message ?? 'Gagal memuat data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="page-header"><h1 className="page-title">Kontrak Manajemen Disetujui</h1></div>
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }
  if (error) return <ErrorState title="Gagal memuat data" message={error} />;

  const units = new Set(list.map((k) => k.unitCode)).size;
  const totalKpi = list.reduce((s, k) => s + k.kpiItems.length, 0);

  return (
    <div className="page kontrak-disetujui-page">
      <div className="page-header">
        <h1 className="page-title">Kontrak Manajemen Disetujui</h1>
        <p className="page-subtitle">
          Registri Kontrak Manajemen yang telah disahkan penuh hingga General Manager — acuan target kinerja
        </p>
      </div>

      <div className="kpi-strip-grid">
        {[
          { label: 'KM Disetujui', value: list.length, color: 'var(--color-success)' },
          { label: 'Jumlah Unit', value: units, color: 'var(--color-info)' },
          { label: 'Total Indikator KPI', value: totalKpi, color: 'var(--color-accent)' },
        ].map((k, i) => (
          <div key={i} className="metric-card" style={{ borderTop: `3px solid ${k.color}` }}>
            <div className="metric-label">{k.label}</div>
            <div className="metric-value" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="card p-0">
        <div className="card-header compact">
          <div className="card-title"><FileCheck2 size={14} />Daftar Kontrak Manajemen Sah</div>
          <span className="card-meta">{list.length} kontrak · read-only</span>
        </div>
        {list.length === 0 ? (
          <div className="card-body">
            <EmptyState title="Belum ada KM disetujui" message="Belum ada Kontrak Manajemen yang disahkan hingga General Manager." />
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Bidang</th>
                  <th>Penanggung Jawab</th>
                  <th>KPI</th>
                  <th>Disahkan oleh</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {list.map((k) => (
                  <Fragment key={k.id}>
                    <tr>
                      <td style={{ fontWeight: 600 }}>{UNIT_NAMES[k.unitCode] ?? k.unitCode}</td>
                      <td>{k.bidang}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{k.holder}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(expanded === k.id ? null : k.id)}>
                          {k.kpiItems.length} indikator <ChevronDown size={12} style={{ transform: expanded === k.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                        </button>
                      </td>
                      <td>
                        <span className="status-pill completed" style={{ fontSize: 10 }}>{k.reviewer ?? 'GM'}</span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {k.reviewedAt ? new Date(k.reviewedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                    {expanded === k.id && (
                      <tr>
                        <td colSpan={6} style={{ background: 'var(--color-surface-2)', padding: 0 }}>
                          <table className="data-table compact" style={{ margin: 0 }}>
                            <thead>
                              <tr>
                                <th>No</th><th>Indikator Kinerja</th><th>Formula</th><th>Satuan</th>
                                <th className="num">Bobot</th><th>Target Sem I</th><th>Target Tahun</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(k.kpiItems as Record<string, string>[]).map((it, idx) => (
                                <tr key={idx}>
                                  <td>{idx + 1}</td>
                                  <td>{it.indikator}</td>
                                  <td>{it.formula}</td>
                                  <td>{it.satuan}</td>
                                  <td className="num">{it.bobot}</td>
                                  <td>{it.target}</td>
                                  <td>{it.target2}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
