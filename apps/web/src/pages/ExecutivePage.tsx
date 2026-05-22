import { useEffect, useState } from 'react';
import { executive } from '../lib/api';
import { BarChart3, LineChart, Trophy, Layers, TrendingUp, TrendingDown, Minus, ShieldCheck } from 'lucide-react';
import { CapacityChart } from '../components/CapacityChart';
import { UnitTrendChart } from '../components/UnitTrendChart';
import { SkeletonKpiCards, SkeletonChart, SkeletonTable, EmptyState, ErrorState } from '../components/LoadState';
import type { ExecutiveData } from '../lib/types';

function fmt(v: unknown, d = 2) {
  if (typeof v !== 'number') return String(v ?? '—');
  return v.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
}

function StatusPill({ status }: { status?: string }) {
  const cls = status === 'Baik' || status === 'on-track' || status === 'completed' ? 'completed'
    : status === 'at-risk' || status === 'Hati-hati' ? 'at-risk'
    : status === 'delayed' || status === 'Tertinggal' ? 'delayed'
    : 'completed';
  return <span className={`status-pill ${cls}`}>{status}</span>;
}

export function ExecutivePage() {
  const [data, setData] = useState<{ period: unknown; data: ExecutiveData } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeKpi, setActiveKpi] = useState(0);

  useEffect(() => {
    executive.summary()
      .then(setData)
      .catch((e) => setError(e?.message ?? 'Gagal memuat data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Executive Summary</h1>
            <p className="page-subtitle">Dashboard Kinerja PUSMANPRO</p>
          </div>
        </div>
        <SkeletonKpiCards count={4} />
        <div className="two-col-grid">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  if (error) return <ErrorState title="Gagal memuat Executive Summary" message={error} />;
  if (!data?.data) return <EmptyState title="Data tidak tersedia" message="Tidak ada data untuk periode ini." />;

  const d = data.data;
  const hs = d.healthScore ?? {};
  const kpis = d.kpis ?? [];
  const selectedKpi = kpis[activeKpi];

  const scoreColor = (hs.value as number) >= 100 ? 'var(--color-success)' : (hs.value as number) >= 90 ? 'var(--color-warning)' : 'var(--color-danger)';

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Summary</h1>
          <p className="page-subtitle">Dashboard Kinerja PUSMANPRO — Februari 2026</p>
        </div>
        <div className="page-meta">
          <span className="meta-pill">Februari 2026</span>
        </div>
      </div>

      {/* Hero Health Score — compact, single row */}
      <div className="hero-health" style={{ gridTemplateColumns: '260px 1fr', gap: 'var(--space-6)', padding: 'var(--space-5)' }}>
        <div className="hero-health-gauge">
          <svg viewBox="0 0 320 200" style={{width:'100%',height:'100%'}}>
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-danger)" />
                <stop offset="50%" stopColor="var(--color-warning)" />
                <stop offset="100%" stopColor="var(--color-success)" />
              </linearGradient>
            </defs>
            <path d="M 40 170 A 120 120 0 0 1 280 170" fill="none" stroke="var(--color-surface-hover)" strokeWidth="24" strokeLinecap="round" />
            <path d="M 40 170 A 120 120 0 0 1 280 170" fill="none" stroke="url(#gaugeGrad)" strokeWidth="24" strokeLinecap="round"
              strokeDasharray="377" strokeDashoffset={377 - 377 * Math.min((hs.value as number) / 120, 1)} />
            {[75,90,100].map((tick, i) => {
              const pct = tick / 120;
              const angle = -180 + pct * 180;
              const rad = (angle * Math.PI) / 180;
              return <circle key={i} cx={160 + 120 * Math.cos(rad)} cy={170 + 120 * Math.sin(rad)} r={4} fill="var(--color-surface)" />;
            })}
          </svg>
          <div className="hero-health-overlay">
            <div className="hero-health-value display-font" style={{color: scoreColor, fontSize: 'var(--display-md)'}}>{fmt(hs.value)}</div>
            <div className="hero-health-meta">/ {String(hs.target ?? 100)}</div>
            <StatusPill status={String(hs.status ?? 'Baik')} />
          </div>
        </div>

        <div className="hero-health-info" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <div>
            <div className="hero-health-title" style={{ fontSize: 'var(--text-lg)' }}>{String(hs.label ?? 'Total Nilai Kinerja PUSMANPRO')}</div>
            <div className="hero-health-subtitle" style={{ marginTop: 4, fontSize: 'var(--text-xs)' }}>
              Agregat 14 indikator RKM 2026 — Kantor Induk + 5 UPMK bulan Februari 2026
            </div>
          </div>

          <div className="hero-health-stats" style={{ marginTop: 0, paddingTop: 'var(--space-3)', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="hero-stat">
              <div className="hero-stat-label">Target</div>
              <div className="hero-stat-value">{String(hs.target ?? 100)}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Bulan Lalu</div>
              <div className="hero-stat-value">{fmt(hs.previous)}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Δ vs Sebelumnya</div>
              <div className={`hero-stat-value ${(hs.delta as number) >= 0 ? 'delta-positive' : 'delta-negative'}`}>
                {(hs.delta as number) > 0 ? '+' : ''}{fmt(hs.delta)}%
              </div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">KPI Aktif</div>
              <div className="hero-stat-value">{kpis.length} indikator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div className="status-banner success">
        <ShieldCheck size={18} style={{color:'var(--color-success)',flexShrink:0}} />
        <div>
          <strong>Tidak ada pengurang aktif</strong> — Semua Pengurang (Keterlambatan COD, Temuan BPK, Fatality) dalam kondisi aman.
        </div>
      </div>

      {/* KPI Master-Detail — use 1:1 ratio so detail panel is filled */}
      <div className="section-title-row">
        <h2 className="section-title"><BarChart3 size={16} />Indikator Kinerja PUSMANPRO — {kpis.length} KPI RKM 2026</h2>
        <span className="section-meta">Klik KPI untuk lihat detail</span>
      </div>

      <div className="kpi-md-section" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 'var(--space-6)' }}>
        <div className="kpi-md-list" style={{ maxHeight: 480 }}>
          {kpis.map((kpi, i) => {
            const st = String(kpi.status ?? '').toLowerCase().replace(/\s+/g, '-');
            const dotCls = kpi.status === 'Baik' || st === 'on-track' ? 'success' : kpi.status === 'Hati-hati' || st === 'at-risk' ? 'warning' : 'danger';
            return (
              <div key={kpi.id ?? i} className={`kpi-md-item${activeKpi === i ? ' active' : ''}`} onClick={() => setActiveKpi(i)}>
                <div className="kpi-md-item-no">{i + 1}</div>
                <div className="kpi-md-item-body">
                  <div className="kpi-md-item-name">{kpi.label ?? kpi.name}</div>
                  <div className="kpi-md-item-meta">{String(kpi.bidang ?? kpi.category ?? '').toUpperCase()}</div>
                </div>
                <div className={`kpi-md-item-dot ${dotCls}`} />
              </div>
            );
          })}
        </div>

        {selectedKpi && (
          <div className="kpi-md-detail">
            <div className="kpi-md-detail-header">
              <div>
                <div className="kpi-md-detail-title">{selectedKpi.label ?? selectedKpi.name}</div>
                <div className="kpi-md-detail-cat">{String(selectedKpi.bidang ?? selectedKpi.category ?? '').toUpperCase()} · {String(selectedKpi.satuan ?? selectedKpi.unit ?? '')}</div>
              </div>
              <StatusPill status={String(selectedKpi.status ?? '')} />
            </div>

            <div className="kpi-md-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div>
                <div className="kpi-md-cell-label">Target</div>
                <div className="kpi-md-cell-value">{fmt(selectedKpi.target)}</div>
              </div>
              <div>
                <div className="kpi-md-cell-label">Realisasi</div>
                <div className="kpi-md-cell-value">{fmt(selectedKpi.actual ?? selectedKpi.value)}</div>
              </div>
              <div>
                <div className="kpi-md-cell-label">Bobot</div>
                <div className="kpi-md-cell-value">{fmt(selectedKpi.bobot)}</div>
              </div>
              <div>
                <div className="kpi-md-cell-label">Nilai</div>
                <div className="kpi-md-cell-value">{fmt(selectedKpi.nilai)}</div>
              </div>
            </div>

            <div>
              <div className="kpi-md-cell-label" style={{marginBottom:8}}>Pencapaian</div>
              <div style={{display:'flex',alignItems:'center',gap:'var(--space-3)'}}>
                <div style={{flex:1,height:8,background:'var(--color-surface-hover)',borderRadius:'var(--radius-full)',overflow:'hidden'}}>
                  <div style={{
                    height:'100%',
                    width:`${Math.min((selectedKpi.achievement as number) ?? 0, 100)}%`,
                    background: (selectedKpi.achievement as number) >= 100 ? 'var(--color-success)' : (selectedKpi.achievement as number) >= 90 ? 'var(--color-warning)' : 'var(--color-danger)',
                    borderRadius:'var(--radius-full)',transition:'width 0.5s'
                  }} />
                </div>
                <span style={{fontSize:'var(--text-md)',fontWeight:800,color:'var(--color-text)'}}>{fmt(selectedKpi.achievement, 1)}%</span>
              </div>
            </div>

            <div className="kpi-md-meta-row">
              <div><span className="label">Polarity</span> <span>{String(selectedKpi.polarity ?? 'higher-is-better')}</span></div>
              <div><span className="label">ID</span> <code>{String(selectedKpi.id ?? '')}</code></div>
            </div>
          </div>
        )}
      </div>

      {/* Two-column: Trend + Ranking */}
      <div className="two-col-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-header compact">
            <div className="card-title"><LineChart size={14} />Trend Nilai Kinerja vs Target</div>
            <span className="card-meta">12 bulan terakhir</span>
          </div>
          <div className="chart-container" style={{ height: 260 }}>
            <UnitTrendChart trend={d.unitTrend as Record<string, unknown>} />
          </div>
        </div>
        <div className="card">
          <div className="card-header compact">
            <div className="card-title"><Trophy size={14} />Pencapaian Kinerja Per Unit</div>
            <span className="card-meta">Kantor Induk + 5 UPMK</span>
          </div>
          <div className="chart-container" style={{ height: 260 }}>
            <CapacityChart data={d.capacityAddition as Record<string, unknown>} />
          </div>
        </div>
      </div>

      {/* Initiatives + Ranking side by side */}
      <div className="two-col-grid" style={{ alignItems: 'start', marginBottom: 'var(--space-6)' }}>
        {d.initiatives && d.initiatives.length > 0 && (
          <div className="card p-0">
            <div className="card-header compact">
              <div className="card-title"><Layers size={14} />Strategic Initiatives ({d.initiatives.length})</div>
              <span className="card-meta">RKM 2026</span>
            </div>
            <div className="table-wrap">
              <table className="data-table compact">
                <thead>
                  <tr>
                    <th>Inisiatif</th>
                    <th>PIC</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {d.initiatives.map((ini) => {
                    const pct = ini.progress as number ?? 0;
                    const barCls = pct >= 100 ? '' : pct >= 80 ? 'warning' : 'danger';
                    return (
                      <tr key={ini.id}>
                        <td style={{fontWeight:600, maxWidth: 200}}>{ini.name}</td>
                        <td style={{color:'var(--color-text-muted)'}}>{ini.owner}</td>
                        <td style={{width:120}}>
                          <div style={{display:'flex',alignItems:'center',gap:'var(--space-2)'}}>
                            <div className="progress-mini" style={{flex:1}}>
                              <div className={`progress-mini-fill ${barCls}`} style={{width:`${pct}%`}} />
                            </div>
                            <span style={{fontSize:'var(--text-xs)',fontWeight:700,minWidth:32}}>{pct}%</span>
                          </div>
                        </td>
                        <td><span className={`status-pill ${ini.status === 'on-track' ? 'on-track' : ini.status === 'at-risk' ? 'at-risk' : 'delayed'}`}>{ini.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {d.unitRanking && d.unitRanking.length > 0 && (
          <div className="card p-0">
            <div className="card-header compact">
              <div className="card-title"><TrendingUp size={14} />Ranking Unit Kinerja</div>
              <span className="card-meta">Semester I 2026</span>
            </div>
            <div style={{padding:'var(--space-2) 0'}}>
              {d.unitRanking.map((r, i) => {
                const score = r.score as number ?? 0;
                const stCls = score >= 100 ? 'on-track' : score >= 90 ? 'at-risk' : 'delayed';
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'var(--space-3)',padding:'var(--space-3) var(--space-4)',borderBottom:'1px solid var(--color-border)'}}>
                    <span style={{fontSize:'var(--text-xs)',fontWeight:800,color:'var(--color-text-muted)',width:20}}>{i+1}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'var(--text-sm)',fontWeight:700}}>{r.name ?? r.unit}</div>
                      <div className="progress-mini" style={{marginTop:4}}>
                        <div className={`progress-mini-fill ${stCls === 'on-track' ? 'success' : stCls === 'at-risk' ? 'warning' : 'danger'}`} style={{width:`${Math.min(score, 110) / 1.1}%`}} />
                      </div>
                    </div>
                    <span style={{fontSize:'var(--text-sm)',fontWeight:800,color:'var(--color-brand)'}}>{fmt(score)}</span>
                    <span className={`status-pill ${stCls}`}>{r.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
