import { useEffect, useState } from 'react';
import { strategic } from '../lib/api';

export function StrategicPage() {
  const [data, setData] = useState<{ data: Record<string, unknown> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    strategic.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat…</div>;
  const d = data?.data as Record<string, unknown> | undefined;
  const bsc = d?.BSC as Record<string, unknown> | undefined;
  const okr = d?.OKR as Array<Record<string, unknown>> | undefined;

  return (
    <div className="page strategic-page">
      <div className="page-header">
        <h1 className="page-title">Target Strategis</h1>
        <p className="page-subtitle">Balanced Scorecard & OKR PUSMANPRO</p>
      </div>

      {bsc && (
        <div className="section-grid-2">
          {Object.entries(bsc).map(([perspective, items]) => (
            <div key={perspective} className="card bsc-card">
              <div className="card-header"><h3 className="card-title">{perspective}</h3></div>
              <div className="bsc-items">
                {(items as Array<Record<string, unknown>>).map((item, i) => (
                  <div key={i} className="bsc-item">
                    <span className="bsc-item-name">{item.label as string || item.name as string}</span>
                    {typeof item.achievement === 'number' && (
                      <div className="bsc-progress">
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${Math.min(item.achievement as number, 100)}%` }} />
                        </div>
                        <span>{item.achievement as number}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {okr && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">OKR — Objectives & Key Results</h3></div>
          <div className="okr-list">
            {okr.map((obj, i) => (
              <div key={i} className="okr-objective">
                <div className="okr-objective-title">{obj.objective as string}</div>
                <div className="okr-krs">
                  {((obj.keyResults ?? obj.krs) as Array<Record<string, unknown>> | undefined)?.map((kr, j) => (
                    <div key={j} className="okr-kr">
                      <span>{kr.label as string || kr.name as string}</span>
                      <div className="okr-kr-progress">
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${Math.min((kr.progress as number) ?? 0, 100)}%` }} />
                        </div>
                        <span>{kr.progress as number ?? 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
