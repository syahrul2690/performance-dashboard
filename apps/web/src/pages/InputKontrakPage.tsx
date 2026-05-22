import { useEffect, useState } from 'react';
import { inputKontrak } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Trash2, Send, CheckCircle, Edit2, X } from 'lucide-react';
import { SkeletonTable, EmptyState, ErrorState } from '../components/LoadState';
import type { KontrakManajemen } from '../lib/types';

type KpiItem = {
  indikator: string;
  target: string;
  satuan: string;
  bobot: string;
};

export function InputKontrakPage() {
  const { user } = useAuth();
  const [kontrakList, setKontrakList] = useState<KontrakManajemen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [bidang, setBidang] = useState('');
  const [holder, setHolder] = useState('');
  const [kpiItems, setKpiItems] = useState<KpiItem[]>([{ indikator: '', target: '', satuan: '', bobot: '' }]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const data = await inputKontrak.list(user?.unit);
      setKontrakList(data as KontrakManajemen[]);
    } catch (e) {
      setError((e as Error)?.message ?? 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBidang('');
    setHolder('');
    setKpiItems([{ indikator: '', target: '', satuan: '', bobot: '' }]);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (kontrak: KontrakManajemen) => {
    setBidang(kontrak.bidang);
    setHolder(kontrak.holder);
    setKpiItems(kontrak.kpiItems as KpiItem[]);
    setEditingId(kontrak.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user || !bidang || !holder) return;
    setSubmitting(true);
    try {
      await inputKontrak.save(user.unit, bidang, holder, kpiItems as unknown as Record<string, unknown>[]);
      setSubmitted(true);
      resetForm();
      await loadData();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      setError((e as Error)?.message ?? 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (id: string) => {
    setSubmitting(true);
    try {
      await inputKontrak.submit(id);
      setSubmitted(true);
      await loadData();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      setError((e as Error)?.message ?? 'Gagal mengirim');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kontrak ini?')) return;
    try {
      await inputKontrak.delete(id);
      await loadData();
    } catch (e) {
      setError((e as Error)?.message ?? 'Gagal menghapus');
    }
  };

  const addKpiRow = () => setKpiItems(prev => [...prev, { indikator: '', target: '', satuan: '', bobot: '' }]);
  const removeKpiRow = (i: number) => setKpiItems(prev => prev.filter((_, idx) => idx !== i));
  const updateKpiRow = (i: number, field: keyof KpiItem, value: string) =>
    setKpiItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  if (loading) {
    return (
      <div className="page">
        <div className="page-header"><h1 className="page-title">Input Kontrak Manajemen</h1></div>
        <SkeletonTable rows={4} cols={6} />
      </div>
    );
  }

  if (error && kontrakList.length === 0) return <ErrorState title="Gagal memuat data" message={error} />;

  const draftCount = kontrakList.filter(k => k.status === 'draft').length;
  const submittedCount = kontrakList.filter(k => k.status === 'submitted').length;

  return (
    <div className="page input-kontrak-page">
      {/* Header Card */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--color-accent)' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-lg)', background: 'var(--color-accent-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={24} color="var(--color-accent)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Input Kontrak Manajemen — Februari 2026</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
              Unit: <strong>{user?.unit ?? '—'}</strong> · {kontrakList.length} kontrak · Draft: {draftCount} · Terkirim: {submittedCount}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} disabled={showForm}>
            <Plus size={16} /> Tambah Kontrak
          </button>
        </div>
      </div>

      {submitted && (
        <div className="status-banner success" style={{ marginBottom: 'var(--space-4)' }}>
          <CheckCircle size={18} />
          <strong>Berhasil disimpan!</strong>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--color-warning)' }}>
          <div className="card-header compact">
            <div className="card-title"><Edit2 size={14} />{editingId ? 'Edit Kontrak' : 'Kontrak Baru'}</div>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}><X size={14} /></button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label className="form-label">Bidang / Unit</label>
                <input className="form-input" value={bidang} onChange={e => setBidang(e.target.value)} placeholder="Contoh: Bidang Teknik" />
              </div>
              <div>
                <label className="form-label">Penanggung Jawab</label>
                <input className="form-input" value={holder} onChange={e => setHolder(e.target.value)} placeholder="Nama penanggung jawab" />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Indikator KPI</label>
                <button className="btn btn-ghost btn-sm" onClick={addKpiRow}><Plus size={14} /> Tambah</button>
              </div>
              <div className="table-wrap">
                <table className="data-table compact">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Indikator</th>
                      <th>Target</th>
                      <th>Satuan</th>
                      <th className="num">Bobot (%)</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpiItems.map((item, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--color-text-muted)' }}>{i + 1}</td>
                        <td><input className="form-input form-input-sm" value={item.indikator} onChange={e => updateKpiRow(i, 'indikator', e.target.value)} placeholder="Nama indikator" /></td>
                        <td><input className="form-input form-input-sm" value={item.target} onChange={e => updateKpiRow(i, 'target', e.target.value)} placeholder="Target" style={{ width: 100 }} /></td>
                        <td><input className="form-input form-input-sm" value={item.satuan} onChange={e => updateKpiRow(i, 'satuan', e.target.value)} placeholder="Satuan" style={{ width: 80 }} /></td>
                        <td className="num"><input className="form-input form-input-sm" type="number" value={item.bobot} onChange={e => updateKpiRow(i, 'bobot', e.target.value)} placeholder="0" style={{ width: 70 }} /></td>
                        <td>
                          {kpiItems.length > 1 && (
                            <button className="btn btn-ghost btn-sm" onClick={() => removeKpiRow(i)} style={{ color: 'var(--color-danger)' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button className="btn btn-ghost" onClick={resetForm}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={submitting || !bidang || !holder || kpiItems.every(k => !k.indikator)}>
                {submitting ? 'Menyimpan…' : editingId ? 'Update' : 'Simpan Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kontrak List */}
      {kontrakList.length === 0 ? (
        <EmptyState title="Belum ada kontrak" message="Klik tombol 'Tambah Kontrak' untuk membuat kontrak manajemen baru." />
      ) : (
        <div className="card p-0">
          <div className="card-header compact">
            <div className="card-title"><FileText size={14} />Daftar Kontrak Manajemen</div>
            <span className="card-meta">{kontrakList.length} kontrak</span>
          </div>
          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Bidang</th>
                  <th>Penanggung Jawab</th>
                  <th>Jumlah KPI</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th style={{ width: 160 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {kontrakList.map((k) => (
                  <tr key={k.id}>
                    <td style={{ fontWeight: 600 }}>{k.bidang}</td>
                    <td>{k.holder}</td>
                    <td className="num">{k.kpiItems.length} indikator</td>
                    <td>
                      <span className={`status-pill ${k.status === 'submitted' ? 'completed' : 'in-review'}`}>
                        {k.status === 'submitted' ? 'Terkirim' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(k.submittedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {k.status === 'draft' && (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(k)}><Edit2 size={14} /></button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(k.id)} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                            <button className="btn btn-primary btn-sm" onClick={() => handleSubmit(k.id)} disabled={submitting}><Send size={14} /> Kirim</button>
                          </>
                        )}
                        {k.status === 'submitted' && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Menunggu review</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
