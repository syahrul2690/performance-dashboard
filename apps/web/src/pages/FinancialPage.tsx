import { useEffect, useState } from 'react';
import { financial } from '../lib/api';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import '../lib/charts';
import { TrendingUp, PieChart, Calculator, Banknote, Building2, FileSpreadsheet, LineChart } from 'lucide-react';
import { SkeletonKpiCards, SkeletonChart, SkeletonTable, EmptyState, ErrorState } from '../components/LoadState';

const STATUS_LABEL: Record<string, string> = {
  'on-track': 'On Track', 'at-risk': 'At Risk', 'delayed': 'Tertinggal', 'completed': 'Tercapai',
};

const UNIT_NAMES: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II', UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};

const CHART_COLORS = {
  teal: '#125D72', orange: '#F97F18', success: '#22c55e', warning: '#f59e0b', danger: '#ef4444',
  blue: '#3b82f6', purple: '#8b5cf6', grid: 'rgba(0,0,0,0.06)',
};

const chartDefaults = {
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: CHART_COLORS.grid }, ticks: { font: { size: 10 } } },
    y: { grid: { color: CHART_COLORS.grid }, ticks: { font: { size: 10 } } },
  },
  maintainAspectRatio: false,
};

function fmt(v: number, d = 0) {
  return v?.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }) ?? '—';
}

export function FinancialPage() {
  const [data, setData] = useState<{ data: Record<string, unknown> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    financial.get()
      .then(setData)
      .catch((e) => setError(e?.message ?? 'Gagal memuat data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="page-header"><h1 className="page-title">Cost &amp; Capex</h1></div>
        <SkeletonKpiCards count={4} />
        <div className="two-col-grid">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  if (error) return <ErrorState title="Gagal memuat Cost &amp; Capex" message={error} />;

  const d = (data?.data ?? {}) as Record<string, unknown>;
  const kpiStrip = (d.kpiStrip ?? []) as Array<{ label: string; value: number; formatted?: string; vsTarget?: number; vsPriorYear?: number }>;
  const ratios = (d.ratios ?? []) as Array<{ label: string; value: number; formatted?: string; unit?: string; benchmark: number; desc: string; status: string; isInverse?: boolean }>;
  const pnl = (d.pnl ?? []) as Array<{ item: string; budget: number; actual: number; isSubtotal?: boolean }>;
  const evm = (d.evm ?? []) as Array<{ code: string; spi: number; cpi: number; status: string }>;
  const investasi = (d.investasiPerUnit ?? []) as Array<{ name: string; target: number; realisasi: number; percent: number; status: string }>;
  const cashFlow = (d.cashFlow ?? {}) as { operating: number; investing: number; financing: number; cashEnd: number; netChange: number };
  const rawTrend = (d.opexTrend ?? d.revenueTrend ?? { months: [], actual: [], budget: [], priorYear: [] }) as {
    months?: string[]; actual?: number[]; budget?: number[]; priorYear?: number[];
  };
  const opexTrend = {
    months: rawTrend.months ?? Array.from({ length: (rawTrend.actual ?? []).length }, (_, i) => ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][i]),
    actual: rawTrend.actual ?? [],
    budget: rawTrend.budget ?? [],
    priorYear: rawTrend.priorYear ?? [],
  };
  const costStructure = (d.costStructure ?? { labels: [], values: [] }) as { labels: string[]; values: number[] };

  if (!data?.data || (kpiStrip.length === 0 && ratios.length === 0 && pnl.length === 0)) {
    return <EmptyState title="Data Cost &amp; Capex tidak tersedia" />;
  }

  const opexLineData = {
    labels: opexTrend.months,
    datasets: [
      { label: 'Realisasi', data: opexTrend.actual, borderColor: CHART_COLORS.teal, backgroundColor: 'rgba(18,93,114,0.08)', fill: true, tension: 0.4 },
      { label: 'Budget', data: opexTrend.budget, borderColor: CHART_COLORS.orange, borderDash: [5, 5], backgroundColor: 'transparent', tension: 0.4 },
      { label: 'Tahun Lalu', data: opexTrend.priorYear, borderColor: 'rgba(0,0,0,0.15)', backgroundColor: 'transparent', tension: 0.4 },
    ],
  };

  const donutData = {
    labels: costStructure.labels,
    datasets: [{ data: costStructure.values, backgroundColor: [CHART_COLORS.teal, CHART_COLORS.orange, CHART_COLORS.blue, CHART_COLORS.purple, CHART_COLORS.warning], borderWidth: 0 }],
  };

  const cashValues = [cashFlow.operating ?? 0, cashFlow.investing ?? 0, cashFlow.financing ?? 0];
  const cashBarData = {
    labels: ['Operating', 'Investing', 'Financing'],
    datasets: [{
      data: cashValues,
      backgroundColor: cashValues.map(v => v >= 0 ? CHART_COLORS.success : CHART_COLORS.danger),
      borderRadius: 6,
    }],
  };

  const invBarData = {
    labels: investasi.map(u => u.name?.replace('UPMK ', 'UPMK\n')?.replace('Kantor', 'KP') ?? ''),
    datasets: [
      { label: 'Target', data: investasi.map(u => u.target), backgroundColor: 'rgba(18,93,114,0.2)', borderRadius: 4 },
      { label: 'Realisasi', data: investasi.map(u => u.realisasi), backgroundColor: CHART_COLORS.teal, borderRadius: 4 },
    ],
  };

  return (
    <div className="page financial-page">
      {/* KPI Strip — capped width, not stretching */}
      {kpiStrip.length > 0 && (
        <div className="kpi-strip-grid">
          {kpiStrip.map((k, i) => {
            const deltaT = typeof k.vsTarget === 'number' ? k.vsTarget : null;
            const deltaY = typeof k.vsPriorYear === 'number' ? k.vsPriorYear : null;
            return (
              <div key={i} className="metric-card" style={{ maxWidth: 'none' }}>
                <div className="metric-label">{k.label}</div>
                <div className="metric-value">{k.formatted ?? fmt(k.value, 2)}</div>
                <div className="metric-delta">
                  {deltaT !== null && (
                    <span className={deltaT >= 0 ? 'delta-positive' : 'delta-negative'}>
                      vs Tgt: {deltaT > 0 ? '+' : ''}{fmt(deltaT, 1)}%
                    </span>
                  )}
                  {deltaY !== null && (
                    <span className={deltaY >= 0 ? 'delta-positive' : 'delta-negative'} style={{ marginLeft: 8 }}>
                      vs PY: {deltaY > 0 ? '+' : ''}{fmt(deltaY, 1)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Two Column: OPEX Trend (wide) + Cost Donut (narrow) */}
      <div className="two-col-grid wide-left">
        <div className="card">
          <div className="card-header compact">
            <div className="card-title"><LineChart size={14} />Trend OPEX Bulanan vs Budget vs Tahun Lalu</div>
            <span className="card-meta">12 bulan, Rp Miliar</span>
          </div>
          <div className="chart-container">
            <Line data={opexLineData} options={{ ...chartDefaults, plugins: { legend: { display: true, labels: { font: { size: 10 }, boxWidth: 10 } } } }} />
          </div>
        </div>
        <div className="card">
          <div className="card-header compact">
            <div className="card-title"><PieChart size={14} />Cost Structure</div>
            <span className="card-meta">OPEX YTD</span>
          </div>
          <div className="chart-container" style={{ height: 260 }}>
            <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10 } } } }} />
          </div>
        </div>
      </div>

      {/* Ratio Cards — 3 column grid, not auto-fit stretching */}
      {ratios.length > 0 && (
        <>
          <div className="section-title-row">
            <h2 className="section-title"><Calculator size={14} />Indikator Cost &amp; Capex ({ratios.length})</h2>
            <span className="section-meta">Realisasi vs Benchmark</span>
          </div>
          <div className="three-col-grid">
            {ratios.map((r, i) => {
              const fillCls = r.status === 'success' ? '' : r.status === 'warning' ? 'warning' : 'danger';
              const valueText = r.formatted ?? (fmt(r.value, 2) + (r.unit ? ' ' + r.unit : ''));
              const benchText = r.benchmark > 1e9 ? `Rp ${fmt(r.benchmark / 1e9, 2)} M` : fmt(r.benchmark, 1) + (r.unit ? ' ' + r.unit : '');
              const pct = r.isInverse
                ? Math.min(100, (r.benchmark / (r.value || 1)) * 100)
                : Math.min(100, (r.value / (r.benchmark || 1)) * 100);
              return (
                <div key={i} className="ratio-card">
                  <div className="ratio-card-label">{r.label}</div>
                  <div className="ratio-card-value">{valueText}</div>
                  <div className="ratio-card-bench">Benchmark: {benchText}</div>
                  <div className="ratio-card-desc">{r.desc}</div>
                  <div className="ratio-progress">
                    <div className={`ratio-progress-fill ${fillCls}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Cash Flow + Investasi per Unit */}
      <div className="two-col-grid">
        <div className="card">
          <div className="card-header compact">
            <div className="card-title"><Banknote size={14} />Cash Flow Februari 2026</div>
            <span className="card-meta">Rp Miliar</span>
          </div>
          <div className="chart-container short">
            <Bar data={cashBarData} options={{ ...chartDefaults, plugins: { legend: { display: false } } }} />
          </div>
          <div className="cash-summary">
            <div>
              <div className="cash-stat-label">Net Change</div>
              <div className={`cash-stat-value ${(cashFlow.netChange ?? 0) >= 0 ? 'delta-positive' : 'delta-negative'}`}>
                {(cashFlow.netChange ?? 0) >= 0 ? '+' : ''}Rp {fmt(cashFlow.netChange)} M
              </div>
            </div>
            <div>
              <div className="cash-stat-label">Cash Position End</div>
              <div className="cash-stat-value">Rp {fmt(cashFlow.cashEnd)} M</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header compact">
            <div className="card-title"><Building2 size={14} />Realisasi Capex per Unit</div>
            <span className="card-meta">Target vs Realisasi (Rp Miliar)</span>
          </div>
          <div className="chart-container">
            <Bar data={invBarData} options={{ ...chartDefaults, plugins: { legend: { display: true, labels: { font: { size: 10 }, boxWidth: 10 } } } }} />
          </div>
        </div>
      </div>

      {/* Variance Table + EVM side by side */}
      <div className="two-col-grid" style={{ alignItems: 'start' }}>
        <div className="card p-0">
          <div className="card-header compact">
            <div className="card-title"><FileSpreadsheet size={14} />Variance vs RKAP 2026</div>
            <span className="card-meta">Per item anggaran (Rp Miliar)</span>
          </div>
          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="num">Budget</th>
                  <th className="num">Aktual</th>
                  <th className="num">Var %</th>
                </tr>
              </thead>
              <tbody>
                {pnl.map((row, i) => {
                  const variance = (row.actual ?? 0) - (row.budget ?? 0);
                  const pct = row.budget !== 0 ? (variance / Math.abs(row.budget)) * 100 : 0;
                  const isExpense = (row.actual ?? 0) < 0;
                  const goodVariance = isExpense ? variance < 0 : variance > 0;
                  return (
                    <tr key={i} className={row.isSubtotal ? 'subtotal' : ''}>
                      <td>{row.item}</td>
                      <td className="num">{fmt(row.budget)}</td>
                      <td className="num">{fmt(row.actual)}</td>
                      <td className={`num ${goodVariance ? 'delta-positive' : 'delta-negative'}`}>{pct > 0 ? '+' : ''}{fmt(pct, 1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-0">
          <div className="card-header compact">
            <div className="card-title"><TrendingUp size={14} />EVM Matrix (SPI &amp; CPI)</div>
            <span className="card-meta">Per unit</span>
          </div>
          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th className="num">SPI</th>
                  <th className="num">CPI</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {evm.map((e, i) => (
                  <tr key={i}>
                    <td>{UNIT_NAMES[e.code] ?? e.code}</td>
                    <td className={`num ${e.spi >= 1 ? 'delta-positive' : 'delta-negative'}`}>{e.spi?.toFixed(2)}</td>
                    <td className={`num ${e.cpi >= 1 ? 'delta-positive' : 'delta-negative'}`}>{e.cpi?.toFixed(2)}</td>
                    <td><span className={`status-pill ${e.status}`}>{STATUS_LABEL[e.status] ?? e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
