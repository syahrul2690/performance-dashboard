import { Line } from 'react-chartjs-2';
import '../lib/charts';

const UNIT_COLORS: Record<string, string> = {
  KP: '#125D72',
  UPMK1: '#F97F18',
  UPMK2: '#3b82f6',
  UPMK3: '#8b5cf6',
  UPMK4: '#10b981',
  UPMK5: '#f59e0b',
};

const UNIT_LABELS: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
  UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

interface Props { trend: Record<string, unknown>; }

export function UnitTrendChart({ trend }: Props) {
  if (!trend || Object.keys(trend).length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
        Tidak ada data trend
      </div>
    );
  }

  const units = Object.keys(trend).filter(k => Array.isArray(trend[k]));
  const maxLen = units.reduce((m, k) => Math.max(m, (trend[k] as number[]).length), 0);
  const labels = MONTHS.slice(0, maxLen);

  const datasets = units.map(unit => ({
    label: UNIT_LABELS[unit] ?? unit,
    data: trend[unit] as number[],
    borderColor: UNIT_COLORS[unit] ?? '#999',
    backgroundColor: 'transparent',
    borderWidth: 2,
    tension: 0.4,
    pointRadius: 2,
  }));

  datasets.push({
    label: 'Target (100)',
    data: Array(maxLen).fill(100),
    borderColor: 'rgba(0,0,0,0.15)',
    backgroundColor: 'transparent',
    borderWidth: 1,
    tension: 0,
    pointRadius: 0,
    borderDash: [4, 4],
  } as (typeof datasets)[0]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' as const, labels: { font: { size: 10 }, boxWidth: 10, padding: 8 } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 } }, min: 70, suggestedMax: 110 },
    },
  };

  return (
    <div style={{ height: 240 }}>
      <Line data={{ labels, datasets }} options={options} />
    </div>
  );
}
