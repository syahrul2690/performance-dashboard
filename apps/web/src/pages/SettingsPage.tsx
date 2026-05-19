import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { audit } from '../lib/api';
import type { AuditLog } from '../lib/types';

type Tab = 'profile' | 'audit';

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, set: setTheme } = useTheme();
  const [tab, setTab] = useState<Tab>('profile');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const loadAudit = () => {
    setLogsLoading(true);
    audit.logs().then((r) => setLogs(r.data)).catch(console.error).finally(() => setLogsLoading(false));
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t === 'audit' && logs.length === 0) loadAudit();
  };

  return (
    <div className="page settings-page">
      <div className="page-header">
        <h1 className="page-title">Pengaturan</h1>
      </div>

      <div className="settings-tabs">
        <button className={`tab-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}>
          Profil
        </button>
        {(user?.role === 'GM' || user?.role === 'SRMANAJER') && (
          <button className={`tab-btn ${tab === 'audit' ? 'active' : ''}`} onClick={() => handleTabChange('audit')}>
            Audit Log
          </button>
        )}
      </div>

      {tab === 'profile' && (
        <div className="settings-content">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Informasi Akun</h3></div>
            <div className="profile-info">
              <div className="profile-avatar">{user?.name?.[0]}</div>
              <div className="profile-details">
                <div className="profile-name">{user?.name}</div>
                <div className="profile-email text-muted">{user?.email}</div>
                <div className="profile-role">
                  <span className={`badge badge-info role-${user?.role?.toLowerCase()}`}>{user?.role}</span>
                  <span className="text-muted"> · {user?.unit}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Tampilan</h3></div>
            <div className="settings-row">
              <span>Tema</span>
              <div className="theme-toggle-group">
                <button
                  className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setTheme('light')}
                >
                  Terang
                </button>
                <button
                  className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setTheme('dark')}
                >
                  Gelap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'audit' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Audit Log</h3>
            <button className="btn btn-sm btn-ghost" onClick={loadAudit}>Refresh</button>
          </div>
          {logsLoading ? (
            <div className="page-loading">Memuat…</div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Waktu</th><th>Aktor</th><th>Aksi</th><th>Entitas</th><th>Catatan</th></tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td className="text-muted">{new Date(l.createdAt).toLocaleString('id-ID')}</td>
                      <td>{l.actor}</td>
                      <td><code>{l.action}</code></td>
                      <td>{l.entity ?? '—'}</td>
                      <td>{l.note ?? '—'}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={5} className="empty-state">Tidak ada log audit.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
