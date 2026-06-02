import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { notifications as notifApi } from '../lib/api';
import type { Notification } from '../lib/types';
import { useAuth } from './AuthContext';

interface NotifCtx {
  items: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  refresh: () => void;
}

const Ctx = createContext<NotifCtx>({
  items: [], unreadCount: 0,
  markRead: () => {}, markAllRead: () => {}, refresh: () => {},
});

export function NotifProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);

  const refresh = useCallback(() => {
    if (!user) return;
    notifApi.list().then(setItems).catch(() => {});
  }, [user]);

  // Muat awal + polling otomatis tiap 15 detik supaya notifikasi
  // (mis. usulan KM baru ke Asman) muncul tanpa perlu refresh manual.
  useEffect(() => {
    if (!user) { setItems([]); return; }
    refresh();
    const id = window.setInterval(refresh, 15000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => { window.clearInterval(id); window.removeEventListener('focus', onFocus); };
  }, [user, refresh]);

  const markRead = (id: string) => {
    notifApi.markRead(id).then(refresh).catch(() => {});
  };

  const markAllRead = () => {
    notifApi.markAllRead().then(refresh).catch(() => {});
  };

  const unreadCount = items.filter((n) => n.unread).length;

  return (
    <Ctx.Provider value={{ items, unreadCount, markRead, markAllRead, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useNotif = () => useContext(Ctx);
