import { useEffect, useState } from 'react';
import { inputRealisasi, inputKontrak } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardEdit, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { SkeletonTable, EmptyState, ErrorState } from '../components/LoadState';
import type { KontrakManajemen } from '../lib/types';

const CURRENT_YEAR = new Date().getFullYear();

type KpiItem = {
  no?: number; indikator?: string; formula?: string; satuan?: string;
  bobot?: number | string; target?: number | string; target2?: number | string;
  bidang?: string; realisasi?: number | string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', submitted: 'Menunggu Review', approved: 'Disetujui', rejected: 'Dikembalikan',
};
const STATUS_PILL: Record<string, string> = {
  draft: 'in-review', submitted: 'needs-revision', approved: 'completed', rejected: 'delayed',
};
const STAGE_LABEL: Record<number, string> = {
  2: 'Asisten Manajer', 3: 'Manajer Bidang', 4: 'Senior Manajer', 5: 'General Manager',
};

// Unit yang bisa mengisi realisasi: Kantor Induk + 5 UPMK
const UNIT_OPTIONS = [
  { code: 'KP', name: 'Kantor Induk' },
  { code: 'UPMK1', name: 'UPMK I' },
  { code: 'UPMK2', name: 'UPMK II' },
  { code: 'UPMK3', name: 'UPMK III' },
  { code: 'UPMK4', name: 'UPMK IV' },
  { code: 'UPMK5', name: 'UPMK V' },
];

export function InputRealisasiPage() {
  const { user } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<string>('KP');
  const [history, setHistory] = useState<unknown[]>([]);
  const [kpiList, setKpiList] = useState<KpiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Default unit mengikuti unit user (bila ada)
  useEffect(() => { if (user?.unit) setSelectedUnit(user.unit); }, [user?.unit]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [histRes, approvedRes] = await Promise.allSettled([
          inputRealisasi.history(selectedUnit),
          inputKontrak.approved(selectedUnit),
        ]);
        if (histRes.status === 'fulfilled') setHistory(histRes.value as unknown[]);
        if (approvedRes.status === 'fulfilled') {
          // Acuan realisasi = KPI dari Kontrak Manajemen yang sudah DISETUJUI (final GM) untuk unit terpilih.
          const kontrak = approvedRes.value as KontrakManajemen[];
          const merged: KpiItem[] = kontrak.flatMap((k) =>
            (k.kpiItems as KpiItem[]).map((it) => ({ ...it, bidang: k.bidang })),
          );
          setKpiList(merged);
          setValues({});
        }
      } catch (e) {
        setError((e as Error)?.message ?? 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedUnit]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {};
      kpiList.forEach((kpi, i) => {
        payload[`kpi_${i}`] = { ...kpi, realisasi: values[String(i)] ?? '' };
      });
      await inputRealisasi.submit(selectedUnit, payload);
      setSubmitted(true);
      setValues({});
      const hist = await inputRealisasi.history(selectedUnit);
      setHistory(hist as unknown[]);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      setError((e as Error)?.message ?? 'Gagal mengirim');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus realisasi ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      await inputRealisasi.delete(id);
      const hist = await inputRealisasi.history(selectedUnit);
      setHistory(hist as unknown[]);
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (e as Error)?.message ?? 'Gagal menghapus';
      alert(msg);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-header"><h1 className="page-title">Input Realisasi Bulanan</h1></div>
        <SkeletonTable rows={6} cols={7} />
      </div>
    );
  }

  if (error && kpiList.length === 0) return <ErrorState title="Gagal memuat data" message={error} />;

  const filledCount = Object.values(values).filter(v => v.trim() !== '').length;
  const completionPct = kpiList.length > 0 ? Math.round((filledCount / kpiList.length) * 100) : 0;

  return (
    <div className="page input-realisasi-page">
      {/* Header Card */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--color-accent)' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-lg)', background: 'var(--color-accent-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ClipboardEdit size={24} color="var(--color-accent)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Input Realisasi Bulanan — Februari 2026</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span>Unit:</span>
              <select
                className="form-input form-input-sm"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                style={{ width: 'auto', minWidth: 140, fontWeight: 700 }}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.code} value={u.code}>{u.name} ({u.code})</option>
                ))}
              </select>
              <span>· {kpiList.length} indikator KM · Deadline: Tanggal 3 setiap bulan</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Progress Isi</div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: completionPct === 100 ? 'var(--color-success)' : 'var(--color-accent)' }}>{completionPct}%</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{filledCount}/{kpiList.length} terisi</div>
          </div>
        </div>
        <div style={{ height: 4, background: 'var(--color-surface-2)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${completionPct}%`, background: completionPct === 100 ? 'var(--color-success)' : 'var(--color-accent)', transition: 'width 0.3s' }} />
        </div>
      </div>

      {submitted && (
        <div className="status-banner success" style={{ marginBottom: 'var(--space-4)' }}>
          <CheckCircle size={18} />
          <strong>Realisasi berhasil dikirim!</strong>
        </div>
      )}

      {/* KPI Input Table */}
      <div className="card p-0" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header compact">
          <div className="card-title"><ClipboardEdit size={14} />KPI Realisasi — {UNIT_OPTIONS.find((u) => u.code === selectedUnit)?.name ?? selectedUnit}</div>
          <span className="card-meta">Isi nilai realisasi Februari 2026</span>
        </div>
        <div className="table-wrap">
          {kpiList.length === 0 ? (
            <EmptyState
              title="Belum ada KPI acuan"
              message="Belum ada Kontrak Manajemen yang disetujui (final GM) untuk unit Anda. Selesaikan persetujuan KM terlebih dahulu di menu Input Kontrak Manajemen → Persetujuan."
            />
          ) : (
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Bidang</th>
                  <th>Indikator</th>
                  <th>Formula</th>
                  <th>Satuan</th>
                  <th className="num">Bobot</th>
                  <th className="num">Target Sem I</th>
                  <th className="num">Target {CURRENT_YEAR}</th>
                  <th>Realisasi</th>
                </tr>
              </thead>
              <tbody>
                {kpiList.map((kpi, i) => {
                  const val = values[String(i)] ?? '';
                  const hasVal = val.trim() !== '';
                  return (
                    <tr key={i} style={{ background: hasVal ? 'rgba(34,197,94,0.03)' : 'transparent' }}>
                      <td style={{ color: 'var(--color-text-muted)' }}>{kpi.no ?? i + 1}</td>
                      <td style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{kpi.bidang ?? '—'}</td>
                      <td style={{ maxWidth: 220, fontWeight: 500 }}>{kpi.indikator ?? '—'}</td>
                      <td style={{ fontSize: 10, color: 'var(--color-text-muted)', maxWidth: 200 }}>{kpi.formula ?? '—'}</td>
                      <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{kpi.satuan ?? '—'}</td>
                      <td className="num" style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{kpi.bobot ?? '—'}</td>
                      <td className="num">{kpi.target ?? '—'}</td>
                      <td className="num">{kpi.target2 ?? '—'}</td>
                      <td style={{ minWidth: 140 }}>
                        <input
                          type="text"
                          className="form-input form-input-sm"
                          style={{ borderColor: hasVal ? 'rgba(34,197,94,0.5)' : undefined }}
                          value={val}
                          onChange={e => setValues(v => ({ ...v, [String(i)]: e.target.value }))}
                          placeholder={`Target: ${kpi.target ?? '—'}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {kpiList.length > 0 && (
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{filledCount} dari {kpiList.length} indikator terisi</span>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || filledCount === 0}>
              {submitting ? 'Mengirim…' : 'Kirim Realisasi'}
            </button>
          </div>
        )}
      </div>

      {/* Submission History */}
      {history.length > 0 && (
        <div className="card p-0">
          <div className="card-header compact">
            <div className="card-title"><Clock size={14} />Riwayat Submisi</div>
            <span className="card-meta">{history.length} entri</span>
          </div>
          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Submitter</th>
                  <th>Status</th>
                  <th>Tanggal Submit</th>
                  <th style={{ width: 90 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => {
                  const item = h as Record<string, unknown>;
                  const status = String(item.status ?? '');
                  const stage = Number(item.currentStage ?? 0);
                  const canDelete = status !== 'approved'
                    && (item.submitterId === user?.id || user?.role === 'GM');
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{item.unitCode as string ?? '—'}</td>
                      <td>{item.submitter as string ?? '—'}</td>
                      <td>
                        <span className={`status-pill ${STATUS_PILL[status] ?? 'in-review'}`} style={{ fontSize: 10 }}>
                          {STATUS_LABEL[status] ?? status}
                        </span>
                        {status === 'submitted' && STAGE_LABEL[stage] && (
                          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>di {STAGE_LABEL[stage]}</div>
                        )}
                        {status === 'rejected' && item.reviewNote ? (
                          <div style={{ fontSize: 10, color: 'var(--color-danger)', marginTop: 2, maxWidth: 240 }}>{item.reviewNote as string}</div>
                        ) : null}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>
                        {item.submittedAt ? new Date(item.submittedAt as string).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td>
                        {canDelete ? (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDelete(item.id as string)}
                            title="Hapus realisasi"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        ) : (
                          <span style={{ fontSize: 10, color: 'var(--color-text-subtle)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
