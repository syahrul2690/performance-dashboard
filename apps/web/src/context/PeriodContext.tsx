import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { meta, kinerja } from '../lib/api';
import type { Period } from '../lib/types';

interface PeriodCtxValue {
  periods: Period[];
  periodId: string;
  setPeriodId: (id: string) => void;
  label: string;
}

const PeriodCtx = createContext<PeriodCtxValue>({
  periods: [], periodId: '', setPeriodId: () => {}, label: '',
});

// eslint-disable-next-line react-refresh/only-export-components
export const usePeriod = () => useContext(PeriodCtx);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodId, setPeriodId] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const list = ((await meta.periods()) as Period[]) ?? [];
        setPeriods(list);
        // Default cerdas: periode terbaru yang punya realisasi DISETUJUI; fallback ke periode aktif.
        let def = list.find((p) => p.isActive)?.id ?? list[0]?.id ?? '';
        try {
          const latest = (await kinerja.latestPeriod()) as Period | null;
          if (latest?.id) def = latest.id;
        } catch { /* abaikan — pakai fallback */ }
        setPeriodId(def);
      } catch { /* abaikan */ }
    })();
  }, []);

  const label = periods.find((p) => p.id === periodId)?.label ?? '';

  return (
    <PeriodCtx.Provider value={{ periods, periodId, setPeriodId, label }}>
      {children}
    </PeriodCtx.Provider>
  );
}
