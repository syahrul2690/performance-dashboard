import { useEffect, useState, Fragment } from 'react';
import { kpiMaster, inputKontrak } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { usePeriod } from '../context/PeriodContext';
import { Layers, Plus, Trash2, Edit2, X, ChevronDown, AlertCircle, CheckCircle, PieChart, UserCheck, ShieldCheck, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { SkeletonTable, EmptyState, ErrorState } from '../components/LoadState';
import type { ReviewerCandidate } from '../components/ReviewerPickerModal';

const UNIT_OPTIONS = [
  { code: 'KP', name: 'Kantor Induk' },
  { code: 'UPMK1', name: 'UPMK I' }, { code: 'UPMK2', name: 'UPMK II' },
  { code: 'UPMK3', name: 'UPMK III' }, { code: 'UPMK4', name: 'UPMK IV' }, { code: 'UPMK5', name: 'UPMK V' },
];
const UNIT_NAMES: Record<string, string> = Object.fromEntries(UNIT_OPTIONS.map((u) => [u.code, u.name]));
const BIDANG_OPTIONS = [
  'Operasi Manajemen Proyek', 'QA/QC', 'Keuangan, Komunikasi & Umum',
  'Perencanaan & Project Control', 'K3L', 'MRO',
];

type Assignment = {
  unitCode: string; bidang: string; holder: string; bobotKm: string; target: string; target2: string;
  persenAgregasi: number;
};
type KpiMasterRow = {
  id: string; year: string; kmType: 'draft' | 'final'; indikator: string; formula: string; satuan: string;
  targetParent: string; createdBy: string; createdAt: string;
  assignments: Array<Assignment & { id: string }>;
  defaultCheckerIds: string[]; defaultApproverId: string | null;
  effectiveMonth: string; version: number; status: string; previousVersionId: string | null;
  isPending: boolean; isCurrent: boolean;
  aggregationMethod: 'weighted' | 'sum';
};
const ROLE_LABEL: Record<string, string> = { ASMAN: 'ASMAN', MANAJER: 'Manajer', SRMANAJER: 'Senior Manajer', GM: 'General Manager' };
type RollupBreakdown = { unitCode: string; bidang: string; persenAgregasi: number; realisasi: number | null; kontribusi: number; hasData: boolean };
type Rollup = {
  masterId: string; indikator: string; targetParent: string; periodId: string; periodLabel: string;
  aggregationMethod: 'weighted' | 'sum';
  totalPersen: number; nilaiParent: number; isFullyConfigured: boolean; breakdown: RollupBreakdown[];
};

const CURRENT_YEAR = new Date().getFullYear();
const emptyAssignment = (): Assignment => ({ unitCode: 'UPMK1', bidang: 'Operasi Manajemen Proyek', holder: '', bobotKm: '', target: '', target2: '', persenAgregasi: 0 });

export function KpiMasterPage() {
  const { user } = useAuth();
  const { periodId } = usePeriod();
  const canAuthor = user?.unit === 'KP';

  const [masters, setMasters] = useState<KpiMasterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [rollups, setRollups] = useState<Record<string, Rollup>>({});
  const [rollupLoading, setRollupLoading] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingIsPending, setEditingIsPending] = useState(false);
  const [kmType, setKmType] = useState<'draft' | 'final'>('draft');
  const [aggregationMethod, setAggregationMethod] = useState<'weighted' | 'sum'>('weighted');
  const [indikator, setIndikator] = useState('');
  const [formula, setFormula] = useState('');
  const [satuan, setSatuan] = useState('');
  const [targetParent, setTargetParent] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([emptyAssignment()]);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Default alur reviewer (Fase C) — diwariskan ke picker submit dokumen hasil fan-out.
  const [reviewerCandidates, setReviewerCandidates] = useState<{ checkers: ReviewerCandidate[]; approvers: ReviewerCandidate[] }>({ checkers: [], approvers: [] });
  const [defaultCheckerOrder, setDefaultCheckerOrder] = useState<string[]>([]);
  const [defaultApproverId, setDefaultApproverId] = useState('');

  useEffect(() => {
    inputKontrak.reviewerCandidates()
      .then((d) => setReviewerCandidates(d as { checkers: ReviewerCandidate[]; approvers: ReviewerCandidate[] }))
      .catch(() => {});
  }, []);
  const toggleDefaultChecker = (id: string) =>
    setDefaultCheckerOrder((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const moveDefaultChecker = (id: string, dir: -1 | 1) =>
    setDefaultCheckerOrder((prev) => {
      const i = prev.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const candDesc = (c: ReviewerCandidate) => `${ROLE_LABEL[c.role] ?? c.role}${c.unit && c.unit !== 'KP' ? ' · ' + (UNIT_NAMES[c.unit] ?? c.unit) : ''}`;

  const load = () => {
    setLoading(true);
    kpiMaster.list()
      .then((d) => setMasters(d as KpiMasterRow[]))
      .catch((e) => setError((e as Error)?.message ?? 'Gagal memuat data'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditingId(null); setEditingIsPending(false); setKmType('draft'); setAggregationMethod('weighted');
    setIndikator(''); setFormula(''); setSatuan('');
    setTargetParent(''); setAssignments([emptyAssignment()]); setFormError(null); setShowForm(false);
    setDefaultCheckerOrder([]); setDefaultApproverId('');
  };

  const handleEdit = (m: KpiMasterRow) => {
    setEditingId(m.id); setKmType(m.kmType); setAggregationMethod(m.aggregationMethod ?? 'weighted');
    setIndikator(m.indikator); setFormula(m.formula);
    setSatuan(m.satuan); setTargetParent(m.targetParent);
    setDefaultCheckerOrder(m.defaultCheckerIds ?? []); setDefaultApproverId(m.defaultApproverId ?? '');
    setAssignments(m.assignments.map((a) => ({
      unitCode: a.unitCode, bidang: a.bidang, holder: a.holder, bobotKm: a.bobotKm, target: a.target, target2: a.target2,
      persenAgregasi: a.persenAgregasi ?? 0,
    })));
    setEditingIsPending(m.isPending);
    setShowForm(true); setFormError(null);
  };

  const addAssignment = () => setAssignments((prev) => [...prev, emptyAssignment()]);
  const removeAssignment = (i: number) => setAssignments((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));
  const updateAssignment = (i: number, field: Exclude<keyof Assignment, 'persenAgregasi'>, value: string) =>
    setAssignments((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  const updatePersen = (i: number, value: string) => {
    const n = value === '' ? 0 : Number(value);
    setAssignments((prev) => prev.map((a, idx) => (idx === i ? { ...a, persenAgregasi: Number.isFinite(n) ? n : a.persenAgregasi } : a)));
  };
  const totalPersenForm = assignments.reduce((s, a) => s + (a.persenAgregasi || 0), 0);
  const anyPersenSet = assignments.some((a) => (a.persenAgregasi || 0) > 0);

  const fetchRollup = async (masterId: string) => {
    setRollupLoading(masterId);
    try {
      const d = await kpiMaster.rollup(masterId, periodId || undefined);
      setRollups((prev) => ({ ...prev, [masterId]: d as Rollup }));
    } catch { /* abaikan — tampil tanpa rollup */ }
    finally { setRollupLoading(null); }
  };

  const handleSave = async () => {
    if (!indikator.trim()) { setFormError('Nama indikator wajib diisi.'); return; }
    // Cek duplikat (unit,bidang)
    const keys = new Set<string>();
    for (const a of assignments) {
      const k = `${a.unitCode}||${a.bidang}`;
      if (keys.has(k)) { setFormError(`Assignment ganda: ${UNIT_NAMES[a.unitCode]} — ${a.bidang}`); return; }
      keys.add(k);
    }
    // Bobot agregasi: hanya berlaku utk metode 'weighted' — bila diisi (ada nilai > 0),
    // total harus tepat 100%. Metode 'sum' (KPI penalti) tidak punya syarat ini.
    if (aggregationMethod === 'weighted' && anyPersenSet && Math.abs(totalPersenForm - 100) > 0.01) {
      setFormError(`Total bobot agregasi harus 100%, saat ini ${totalPersenForm}%.`);
      return;
    }
    setFormError(null); setBusy(true);
    try {
      await kpiMaster.save({
        id: editingId ?? undefined, kmType, aggregationMethod, indikator: indikator.trim(), formula, satuan, targetParent, assignments,
        defaultCheckerIds: defaultCheckerOrder, defaultApproverId: defaultApproverId || undefined,
      });
      setSubmitted(true);
      resetForm();
      load();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      setFormError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (e as Error)?.message ?? 'Gagal menyimpan');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus KPI Master ini? Item yang sudah disebar ke dokumen KM draft akan ikut dibersihkan.')) return;
    try { await kpiMaster.delete(id); load(); }
    catch (e) { setError((e as Error)?.message ?? 'Gagal menghapus'); }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-header"><h1 className="page-title">KPI Master</h1></div>
        <SkeletonTable rows={4} cols={5} />
      </div>
    );
  }
  if (error && masters.length === 0 && !showForm) return <ErrorState title="Gagal memuat data" message={error} />;

  return (
    <div className="page kpi-master-page">
      <div className="card" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--color-accent)' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-lg)', background: 'var(--color-accent-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Layers size={24} color="var(--color-accent)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>KPI Master — Tahun {CURRENT_YEAR}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
              Definisikan satu KPI, lalu assign ke banyak Unit/Bidang. Definisi otomatis disebar ke dokumen KM draft masing-masing (bertanda KPI Master).
            </div>
          </div>
          {canAuthor && (
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} disabled={showForm}>
              <Plus size={16} /> KPI Master Baru
            </button>
          )}
        </div>
      </div>

      {submitted && (
        <div className="status-banner success" style={{ marginBottom: 'var(--space-4)' }}>
          <CheckCircle size={18} /> <strong>KPI Master tersimpan & disebar ke dokumen KM.</strong>
        </div>
      )}

      {!canAuthor && (
        <div className="status-banner" style={{ marginBottom: 'var(--space-4)', background: 'var(--color-surface-2)' }}>
          <AlertCircle size={16} /> KPI Master disusun oleh Kantor Induk. Anda dapat melihat, tetapi tidak mengubah.
        </div>
      )}

      {/* Form */}
      {canAuthor && showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--color-warning)' }}>
          <div className="card-header compact">
            <div className="card-title"><Edit2 size={14} />{editingId ? 'Edit KPI Master' : 'KPI Master Baru'}</div>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}><X size={14} /></button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {formError && (<div className="status-banner danger" style={{ margin: 0 }}><AlertCircle size={16} /> {formError}</div>)}
            {editingId && !editingIsPending && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)', background: 'var(--color-warning-tint)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                <AlertCircle size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                KPI ini sedang <b>berlaku pada periode berjalan</b>. Perubahan tidak akan mengubah data periode ini —
                sistem akan membuat <b>versi baru</b> yang berlaku mulai bulan berikutnya.
              </div>
            )}
            {editingId && editingIsPending && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', background: 'var(--color-accent-tint)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                KPI ini <b>belum berlaku</b> (menunggu periode mendatang) — perubahan langsung memperbarui versi ini di tempat.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label className="form-label">Indikator KPI <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input className="form-input" value={indikator} onChange={(e) => setIndikator(e.target.value)} placeholder="Nama indikator kinerja" />
              </div>
              <div>
                <label className="form-label">Tipe KM</label>
                <select className="form-input" value={kmType} onChange={(e) => setKmType(e.target.value as 'draft' | 'final')}>
                  <option value="draft">KM Draft</option>
                  <option value="final">KM Final</option>
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Formula / Metode Perhitungan</label>
              <input className="form-input" value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="Rumus / cara pengukuran KPI" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label className="form-label">Satuan</label>
                <input className="form-input" value={satuan} onChange={(e) => setSatuan(e.target.value)} placeholder="mis. %, MW, Hari kerja" />
              </div>
              <div>
                <label className="form-label">Target Gabungan (Parent)</label>
                <input className="form-input" value={targetParent} onChange={(e) => setTargetParent(e.target.value)} placeholder="Target keseluruhan" />
              </div>
            </div>
            <div>
              <label className="form-label">Metode Agregasi</label>
              <select className="form-input" value={aggregationMethod} onChange={(e) => setAggregationMethod(e.target.value as 'weighted' | 'sum')}>
                <option value="weighted">Rata-rata Tertimbang (KPI positif — pakai Bobot Agregasi %, total 100%)</option>
                <option value="sum">Jumlah / SUM (KPI penalti-pengurang — tanpa syarat 100%)</option>
              </select>
            </div>

            {/* Assignments */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Assign ke Unit / Bidang ({assignments.length})</label>
                <button className="btn btn-ghost btn-sm" onClick={addAssignment}><Plus size={14} /> Tambah Assignment</button>
              </div>
              <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-2)' }}>
                {aggregationMethod === 'weighted' ? (
                  <><b>Bobot Agregasi</b>: persentase kontribusi realisasi tiap unit/bidang ke nilai KPI parent (rollup). Kosongkan semua bila belum dikonfigurasi, atau isi hingga total tepat 100%.</>
                ) : (
                  <>Metode <b>SUM</b>: nilai parent = jumlah polos realisasi tiap unit/bidang (cocok untuk KPI penalti/pengurang lintas bidang). Tidak perlu Bobot Agregasi.</>
                )}
              </p>
              <div className="table-wrap">
                <table className="data-table compact">
                  <thead>
                    <tr>
                      <th>Unit</th><th>Bidang</th><th>Penanggung Jawab</th>
                      <th className="num">Bobot KM</th><th>Target Sem I</th><th>Target {CURRENT_YEAR}</th>
                      {aggregationMethod === 'weighted' && <th className="num">Bobot Agregasi (%)</th>}
                      <th style={{ width: 40 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a, i) => (
                      <tr key={i}>
                        <td>
                          <select className="form-input form-input-sm" value={a.unitCode} onChange={(e) => updateAssignment(i, 'unitCode', e.target.value)}>
                            {UNIT_OPTIONS.map((u) => <option key={u.code} value={u.code}>{u.name}</option>)}
                          </select>
                        </td>
                        <td>
                          <select className="form-input form-input-sm" value={a.bidang} onChange={(e) => updateAssignment(i, 'bidang', e.target.value)}>
                            {BIDANG_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </td>
                        <td><input className="form-input form-input-sm" value={a.holder} onChange={(e) => updateAssignment(i, 'holder', e.target.value)} placeholder="Nama PJ" /></td>
                        <td><input className="form-input form-input-sm" style={{ textAlign: 'center' }} value={a.bobotKm} onChange={(e) => updateAssignment(i, 'bobotKm', e.target.value)} placeholder="poin" /></td>
                        <td><input className="form-input form-input-sm" value={a.target} onChange={(e) => updateAssignment(i, 'target', e.target.value)} placeholder="Target Sem I" /></td>
                        <td><input className="form-input form-input-sm" value={a.target2} onChange={(e) => updateAssignment(i, 'target2', e.target.value)} placeholder="Target tahun" /></td>
                        {aggregationMethod === 'weighted' && (
                          <td>
                            <input
                              type="number" min={0} max={100} step={1}
                              className="form-input form-input-sm" style={{ textAlign: 'center' }}
                              value={a.persenAgregasi || ''} onChange={(e) => updatePersen(i, e.target.value)} placeholder="0"
                            />
                          </td>
                        )}
                        <td>
                          <button className="btn btn-ghost btn-sm" disabled={assignments.length <= 1} onClick={() => removeAssignment(i)} style={{ color: 'var(--color-danger)' }}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                    {aggregationMethod === 'weighted' && anyPersenSet && (
                      <tr style={{ background: 'var(--color-surface-2)' }}>
                        <td colSpan={6} style={{ textAlign: 'right', fontWeight: 700, fontSize: 'var(--text-xs)' }}>Total Bobot Agregasi:</td>
                        <td className="num" style={{ fontWeight: 700, color: Math.abs(totalPersenForm - 100) < 0.01 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {totalPersenForm}%
                        </td>
                        <td />
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Default Alur Reviewer (Fase C) — diwariskan ke picker submit dokumen hasil fan-out */}
            <div>
              <label className="form-label" style={{ marginBottom: 4 }}>Default Alur Reviewer (opsional)</label>
              <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-2)' }}>
                Mengisi otomatis picker reviewer saat submitter mengirim dokumen hasil fan-out KPI ini. Submitter tetap bisa mengubahnya.
              </p>

              {defaultCheckerOrder.length > 0 && (
                <div style={{ marginBottom: 'var(--space-2)' }}>
                  {defaultCheckerOrder.map((id, i) => {
                    const c = reviewerCandidates.checkers.find((x) => x.id === id);
                    if (!c) return null;
                    return (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'var(--color-surface-2)', borderRadius: 6, marginBottom: 4, fontSize: 12 }}>
                        <span style={{ fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
                        <span style={{ flex: 1 }}>{c.name} <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>· {candDesc(c)}</span></span>
                        <button className="btn btn-ghost btn-sm" disabled={i === 0} onClick={() => moveDefaultChecker(id, -1)}><ArrowUp size={12} /></button>
                        <button className="btn btn-ghost btn-sm" disabled={i === defaultCheckerOrder.length - 1} onClick={() => moveDefaultChecker(id, 1)}><ArrowDown size={12} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleDefaultChecker(id)}><X size={12} /></button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><UserCheck size={12} /> Default Checker</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflowY: 'auto' }}>
                    {reviewerCandidates.checkers.map((c) => {
                      const picked = defaultCheckerOrder.includes(c.id);
                      return (
                        <button
                          key={c.id} type="button" onClick={() => toggleDefaultChecker(c.id)}
                          style={{ textAlign: 'left', padding: '5px 8px', borderRadius: 6, border: `1px solid ${picked ? 'var(--color-accent)' : 'var(--color-border)'}`, background: picked ? 'var(--color-accent-tint)' : 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                        >
                          <span style={{ width: 14 }}>{picked && <Check size={12} />}</span>
                          <span>{c.name} <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>· {candDesc(c)}</span></span>
                        </button>
                      );
                    })}
                    {reviewerCandidates.checkers.length === 0 && <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Tidak ada kandidat.</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={12} /> Default Approver</div>
                  <select className="form-input form-input-sm" value={defaultApproverId} onChange={(e) => setDefaultApproverId(e.target.value)}>
                    <option value="">— Tidak ada default —</option>
                    {reviewerCandidates.approvers.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} — {candDesc(a)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button className="btn btn-ghost" onClick={resetForm} disabled={busy}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={busy}>
                {busy ? 'Menyimpan…' : editingId ? 'Update & Sebar' : 'Simpan & Sebar ke KM'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="card p-0">
        <div className="card-header compact">
          <div className="card-title"><Layers size={14} /> Daftar KPI Master</div>
          <span className="card-meta">{masters.length} KPI</span>
        </div>
        {masters.length === 0 ? (
          <EmptyState title="Belum ada KPI Master" message="Klik 'KPI Master Baru' untuk mendefinisikan KPI dan meng-assign-nya ke banyak unit/bidang." />
        ) : (
          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Indikator</th><th>Tipe</th><th>Versi</th><th>Satuan</th><th className="num">Assignment</th><th>Dibuat oleh</th><th style={{ width: 90 }} />
                </tr>
              </thead>
              <tbody>
                {masters.map((m) => (
                  <Fragment key={m.id}>
                    <tr>
                      <td style={{ fontWeight: 600 }}>
                        {m.indikator}
                        {m.aggregationMethod === 'sum' && (
                          <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: 4, padding: '1px 4px' }} title="Metode agregasi: SUM (jumlah polos)">
                            Σ SUM
                          </span>
                        )}
                      </td>
                      <td><span className={`status-pill ${m.kmType === 'final' ? 'completed' : 'at-risk'}`} style={{ fontSize: 10 }}>{m.kmType === 'final' ? 'Final' : 'Draft'}</span></td>
                      <td>
                        <span className={`status-pill ${m.isPending ? 'in-review' : 'completed'}`} style={{ fontSize: 10 }} title={`Berlaku mulai ${m.effectiveMonth}`}>
                          v{m.version} · {m.isPending ? `mulai ${m.effectiveMonth}` : 'berlaku'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{m.satuan || '—'}</td>
                      <td className="num">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            const willOpen = expanded !== m.id;
                            setExpanded(willOpen ? m.id : null);
                            if (willOpen && !rollups[m.id]) fetchRollup(m.id);
                          }}
                        >
                          {m.assignments.length} unit <ChevronDown size={12} style={{ transform: expanded === m.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                        </button>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{m.createdBy}</td>
                      <td>
                        {canAuthor && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(m)} title="Edit"><Edit2 size={13} /></button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(m.id)} title="Hapus" style={{ color: 'var(--color-danger)' }}><Trash2 size={13} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {expanded === m.id && (
                      <tr>
                        <td colSpan={7} style={{ background: 'var(--color-surface-2)', padding: 0 }}>
                          <table className="data-table compact" style={{ margin: 0 }}>
                            <thead>
                              <tr><th>Unit</th><th>Bidang</th><th>PJ</th><th className="num">Bobot KM</th><th>Target Sem I</th><th>Target {CURRENT_YEAR}</th><th className="num">{m.aggregationMethod === 'sum' ? 'Metode' : 'Bobot Agregasi'}</th></tr>
                            </thead>
                            <tbody>
                              {m.assignments.map((a) => (
                                <tr key={a.id}>
                                  <td style={{ fontWeight: 600 }}>{UNIT_NAMES[a.unitCode] ?? a.unitCode}</td>
                                  <td style={{ fontSize: 11 }}>{a.bidang}</td>
                                  <td style={{ color: 'var(--color-text-muted)' }}>{a.holder || '—'}</td>
                                  <td className="num">{a.bobotKm || '—'}</td>
                                  <td>{a.target || '—'}</td>
                                  <td>{a.target2 || '—'}</td>
                                  <td className="num">{m.aggregationMethod === 'sum' ? 'SUM' : (a.persenAgregasi ? `${a.persenAgregasi}%` : '—')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Rollup: nilai parent hasil agregasi realisasi children */}
                          <div style={{ padding: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <PieChart size={13} /> Rollup Nilai Parent
                            </div>
                            {rollupLoading === m.id ? (
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Menghitung…</div>
                            ) : rollups[m.id] ? (
                              <>
                                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'baseline', marginBottom: 8 }}>
                                  <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-accent)' }}>{rollups[m.id].nilaiParent}</span>
                                  <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)' }}>
                                    Target parent: {rollups[m.id].targetParent || '—'} · Periode: {rollups[m.id].periodLabel} · Total bobot: {rollups[m.id].totalPersen}%
                                    {!rollups[m.id].isFullyConfigured && <span style={{ color: 'var(--color-warning)' }}> (belum 100%)</span>}
                                  </span>
                                </div>
                                <table className="data-table compact" style={{ margin: 0 }}>
                                  <thead>
                                    <tr><th>Unit</th><th>Bidang</th><th className="num">Bobot</th><th className="num">Realisasi</th><th className="num">Kontribusi</th></tr>
                                  </thead>
                                  <tbody>
                                    {rollups[m.id].breakdown.map((b, i) => (
                                      <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{UNIT_NAMES[b.unitCode] ?? b.unitCode}</td>
                                        <td style={{ fontSize: 11 }}>{b.bidang}</td>
                                        <td className="num">{b.persenAgregasi}%</td>
                                        <td className="num">{b.hasData ? b.realisasi : <span style={{ color: 'var(--color-text-subtle)' }}>belum ada</span>}</td>
                                        <td className="num" style={{ fontWeight: 700 }}>{b.kontribusi}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </>
                            ) : (
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Rollup tidak tersedia.</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
