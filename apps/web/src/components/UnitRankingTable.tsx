import type { UnitRanking } from '../lib/types';

const UNIT_NAMES: Record<string, string> = {
  KP: 'Kantor Induk', UPMK1: 'UPMK I', UPMK2: 'UPMK II',
  UPMK3: 'UPMK III', UPMK4: 'UPMK IV', UPMK5: 'UPMK V',
};

interface Props { ranking: UnitRanking[]; }

export function UnitRankingTable({ ranking }: Props) {
  return (
    <div className="unit-ranking-table">
      {ranking.map((u, idx) => (
        <div key={u.code} className="unit-ranking-row">
          <span className="rank-num">{idx + 1}</span>
          <div className="rank-info">
            <span className="rank-name">{UNIT_NAMES[u.code] ?? u.code}</span>
            <span className="rank-kpi text-muted">{u.criticalKpi}</span>
          </div>
          <div className="rank-right">
            <span className="rank-score">{u.score.toFixed(2)}</span>
            <span className={`badge badge-${u.status === 'Baik' ? 'success' : 'warning'}`}>{u.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
