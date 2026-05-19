import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Kpi } from '../lib/types';

interface Props { kpi: Kpi; }

export function KpiCard({ kpi }: Props) {
  const delta = kpi.delta ?? 0;
  const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';

  return (
    <div className="kpi-card card">
      <div className="kpi-card-header">
        <span className="kpi-label">{kpi.label}</span>
      </div>
      <div className="kpi-card-body">
        <div className="kpi-value">{kpi.formatted ?? kpi.value}</div>
        <div className={`kpi-delta trend-${trend}`}>
          <Icon size={14} />
          <span>{delta > 0 ? '+' : ''}{delta}{kpi.deltaUnit ?? '%'}</span>
        </div>
      </div>
      {kpi.sparkline && kpi.sparkline.length > 0 && (
        <svg className="kpi-sparkline" viewBox={`0 0 ${kpi.sparkline.length * 10} 32`} preserveAspectRatio="none">
          <polyline
            className={`sparkline-line trend-${trend}`}
            points={kpi.sparkline.map((v, i) => {
              const min = Math.min(...kpi.sparkline!);
              const max = Math.max(...kpi.sparkline!);
              const range = max - min || 1;
              const y = 28 - ((v - min) / range) * 24;
              return `${i * 10 + 5},${y}`;
            }).join(' ')}
          />
        </svg>
      )}
    </div>
  );
}
