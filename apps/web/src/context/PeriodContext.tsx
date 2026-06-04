import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { meta, kinerja } from '../lib/api';
import { useAuth } from './AuthContext';
import type { Period } from '../lib/types';

export type PeriodMode = 'Bulan' | 'Semester' | 'Tahun';

interface PeriodCtxValue {
  periods: Period[];
  periodId: string;
  setPeriodId: (id: string) => void;
  mode: PeriodMode;
  setMode: (m: PeriodMode) => void;
  label: string;
}

const PeriodCtx = createContext<PeriodCtxValue>({
  periods: [], periodId: '', setPeriodId: () => {}, mode: 'Bulan', setMode: () => {}, label: '',
});

// eslint-disable-next-line react-refresh/only-export-components
export const usePeriod = () => useContext(PeriodCtx);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodId, setPeriodId] = useState('');
  const [mode, setMode] = useState<PeriodMode>('Bulan');

  // Muat periode setelah user terautentikasi (endpoint /meta/periods butuh auth).
  // Re-fetch saat user berganti (mis. selesai login) agar dropdown langsung tampil tanpa refresh.
  useEffect(() => {
    if (!user) { setPeriods([]); setPeriodId(''); return; }
    let cancelled = false;
    (async () => {
      try {
        const list = ((await meta.periods()) as Period[]) ?? [];
        if (cancelled) return;
        setPeriods(list);
        let def = list.find((p) => p.isActive)?.id ?? list[0]?.id ?? '';
        try {
          const latest = (await kinerja.latestPeriod()) as Period | null;
          if (latest?.id && !cancelled) def = latest.id;
        } catch { /* abaikan — pakai fallback */ }
        if (!cancelled) setPeriodId(def);
      } catch { /* abaikan */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const label = periods.find((p) => p.id === periodId)?.label ?? '';

  return (
    <PeriodCtx.Provider value={{ periods, periodId, setPeriodId, mode, setMode, label }}>
      {children}
    </PeriodCtx.Provider>
  );
}
