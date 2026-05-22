import { Activity, AlertTriangle, FileQuestion } from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
}

export function SkeletonKpiCards({ count = 4 }: { count?: number }) {
  return (
    <div className="kpi-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line skeleton" style={{ width: '60%' }} />
          <div className="skeleton-line skeleton" style={{ width: '40%', height: 28 }} />
          <div className="skeleton-line skeleton" style={{ width: '45%' }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="card" style={{ minHeight: 280 }}>
      <div className="card-header">
        <div className="skeleton-line skeleton" style={{ width: 160, height: 16 }} />
      </div>
      <div className="card-body" style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '100%', height: '100%', minHeight: 200 }} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="card p-0">
      <div className="card-header">
        <div className="skeleton-line skeleton" style={{ width: 140, height: 16 }} />
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i}><div className="skeleton-line skeleton" style={{ width: 60, height: 12 }} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, ri) => (
              <tr key={ri}>
                {Array.from({ length: cols }).map((_, ci) => (
                  <td key={ci}><div className="skeleton-line skeleton" style={{ width: `${40 + Math.random() * 40}%`, height: 12 }} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyState({ title = 'Tidak ada data', message }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <FileQuestion size={24} />
      </div>
      <div className="empty-state-title">{title}</div>
      {message && <div className="empty-state-message">{message}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Gagal memuat data', message = 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.' }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ color: 'var(--color-danger)', background: 'var(--color-danger-tint)', borderColor: 'var(--color-danger)' }}>
        <AlertTriangle size={24} />
      </div>
      <div className="empty-state-title" style={{ color: 'var(--color-danger)' }}>{title}</div>
      {message && <div className="empty-state-message">{message}</div>}
    </div>
  );
}
