import { useState } from 'react';
import { ShieldAlert, Trash2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { admin } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function AdminPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  if (user?.role !== 'SUPERADMIN' && user?.role !== 'DEVELOPER') {
    return <Navigate to="/" replace />;
  }

  const handleReset = async () => {
    const confirmed = window.confirm(
      'PERHATIAN: Semua data KM, realisasi, notifikasi, dan audit log akan dihapus permanen.\n\nAkun pengguna dan data referensi (periode, jabatan, dll.) TIDAK dihapus.\n\nLanjutkan reset?'
    );
    if (!confirmed) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await admin.resetTestData();
      setResult({ ok: true, msg: res.message ?? 'Data berhasil direset.' });
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? (e as Error)?.message ?? 'Reset gagal.';
      setResult({ ok: false, msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <ShieldAlert size={22} color="var(--color-danger)" />
          <h1 className="page-title">Admin Tools</h1>
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Hanya dapat diakses oleh {user.role}
        </span>
      </div>

      {result && (
        <div
          className={`status-banner ${result.ok ? 'success' : 'danger'}`}
          style={{ marginBottom: 'var(--space-4)' }}
        >
          {result.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {result.msg}
        </div>
      )}

      <div className="card" style={{ borderLeft: '4px solid var(--color-danger)', maxWidth: 560 }}>
        <div className="card-header compact">
          <div className="card-title"><Database size={14} /> Reset Data Testing</div>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Hapus semua data transaksional agar testing dapat dimulai dari kondisi bersih.
          </p>

          <table style={{ width: '100%', fontSize: 'var(--text-xs)', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>Tabel</th>
                <th style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Kontrak Manajemen', 'kontrak_manajemen'],
                ['Bundle KM Tahunan', 'km_bundles'],
                ['Input Realisasi', 'input_realisasi'],
                ['Bundle Realisasi', 'realisasi_bundles'],
                ['Notifikasi', 'notifications'],
                ['Audit Log', 'audit_logs'],
              ].map(([label, table]) => (
                <tr key={table}>
                  <td style={{ padding: '4px 8px', borderBottom: '1px solid var(--color-border-subtle)' }}>{label}</td>
                  <td style={{ padding: '4px 8px', borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-danger)', fontWeight: 600, fontSize: 10 }}>AKAN DIHAPUS</td>
                </tr>
              ))}
              {[
                ['Akun Pengguna', 'users'],
                ['Periode', 'periods'],
                ['Data Referensi', 'role_variants, dll.'],
              ].map(([label, table]) => (
                <tr key={table}>
                  <td style={{ padding: '4px 8px', borderBottom: '1px solid var(--color-border-subtle)' }}>{label}</td>
                  <td style={{ padding: '4px 8px', borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-success)', fontWeight: 600, fontSize: 10 }}>AMAN</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="btn"
            onClick={handleReset}
            disabled={loading}
            style={{
              background: 'var(--color-danger)', color: '#fff', border: 'none',
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              alignSelf: 'flex-start',
            }}
          >
            <Trash2 size={15} />
            {loading ? 'Mereset…' : 'Reset Semua Data Testing'}
          </button>
        </div>
      </div>
    </div>
  );
}
